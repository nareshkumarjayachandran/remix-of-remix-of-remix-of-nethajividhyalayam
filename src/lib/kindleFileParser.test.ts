import { describe, expect, it } from "vitest";
import {
  detectFileFormat,
  extractKindleSpeechSegments,
  paginateParagraphs,
  parseCsvRows,
  parseKindleFile,
  tableRowsToParagraphs,
} from "./kindleFileParser";
import { KINDLE_SAMPLE_BOOKS } from "./kindleSamples";
import {
  ALL_SPEECH_LANGUAGES,
  FOREIGN_SPEECH_LANGUAGES,
  INDIAN_SPEECH_LANGUAGES,
  rankVoicesForReader,
  SPEECH_LANGUAGE_META,
} from "./speechText";

describe("Kindle Reader file parsing", () => {
  it("detects PDF, Word, Excel/CSV, EPUB, Image, and Text formats", () => {
    expect(detectFileFormat("book.pdf")).toBe("pdf");
    expect(detectFileFormat("notes.docx")).toBe("word");
    expect(detectFileFormat("marks.xlsx")).toBe("excel");
    expect(detectFileFormat("marks.csv")).toBe("excel");
    expect(detectFileFormat("novel.epub")).toBe("epub");
    expect(detectFileFormat("scan.jpg")).toBe("image");
    expect(detectFileFormat("story.txt")).toBe("text");
  });

  it("parses quoted CSV rows and produces spoken sentences", () => {
    const rows = parseCsvRows('Name,Subject,Remark\nAarav,Maths,"Very good, keep it up"\nMeera,Tamil,Excellent');
    expect(rows).toEqual([
      ["Name", "Subject", "Remark"],
      ["Aarav", "Maths", "Very good, keep it up"],
      ["Meera", "Tamil", "Excellent"],
    ]);
    expect(tableRowsToParagraphs(rows, "Marks")).toEqual([
      "Row 1: Name: Aarav, Subject: Maths, Remark: Very good, keep it up.",
      "Row 2: Name: Meera, Subject: Tamil, Remark: Excellent.",
    ]);
  });

  it("paginates long text into multiple Kindle pages and extracts speech segments", () => {
    const longParas = Array.from({ length: 12 }, (_, i) => `Paragraph ${i + 1} ${"word ".repeat(55).trim()}.`);
    const pages = paginateParagraphs(longParas, "My Book");
    expect(pages.length).toBeGreaterThan(1);
    const sample = KINDLE_SAMPLE_BOOKS[0]!;
    const page1Segs = extractKindleSpeechSegments(sample, 0);
    expect(page1Segs[0]).toBe(sample.title);
    expect(page1Segs.length).toBe(4);
  });

  it("rejects empty files cleanly", async () => {
    const emptyFile = new File([], "empty.txt", { type: "text/plain" });
    await expect(parseKindleFile(emptyFile)).rejects.toThrow("empty");
  });
});

describe("Indian & world foreign speech languages", () => {
  it("includes all major Indian and world-famous foreign languages with BCP-47 locales", () => {
    expect(INDIAN_SPEECH_LANGUAGES).toEqual(
      expect.arrayContaining(["en", "ta", "hi", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur", "sa"]),
    );
    expect(FOREIGN_SPEECH_LANGUAGES).toEqual(
      expect.arrayContaining(["fr", "es", "de", "it", "pt", "ru", "ja", "zh", "ko", "ar"]),
    );
    expect(ALL_SPEECH_LANGUAGES.length).toBe(INDIAN_SPEECH_LANGUAGES.length + FOREIGN_SPEECH_LANGUAGES.length);
    for (const code of ALL_SPEECH_LANGUAGES) {
      expect(SPEECH_LANGUAGE_META[code].bcp47).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    }
  });

  it("ranks voices accurately for Indian and foreign languages like Japanese and Telugu", () => {
    const voices = [
      { name: "Google US English", lang: "en-US", voiceURI: "en" },
      { name: "Google తెలుగు", lang: "te-IN", voiceURI: "te" },
      { name: "Microsoft Nanami Natural", lang: "ja-JP", voiceURI: "ja-nat" },
      { name: "Google 日本語", lang: "ja-JP", voiceURI: "ja" },
    ];
    expect(rankVoicesForReader(voices, "te").map((v) => v.voiceURI)).toEqual(["te"]);
    expect(rankVoicesForReader(voices, "ja").map((v) => v.voiceURI)).toEqual(["ja-nat", "ja"]);
  });
});