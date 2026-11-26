import { describe, expect, it } from "vitest";
import {
  buildTranslatedPage,
  buildTranslationCacheKey,
  detectDocumentLanguage,
  getPrecomputedPageTranslation,
  normalizeTranslationResult,
} from "./kindleTranslation";
import { KINDLE_SAMPLE_BOOKS } from "./kindleSamples";

describe("kindleTranslation", () => {
  it("provides instant pre-saved Tamil and Hindi translations for the Panchatantra starter book", () => {
    const book = KINDLE_SAMPLE_BOOKS.find((b) => b.id === "sample-en-story")!;
    const taPage0 = getPrecomputedPageTranslation(book.id, 0, "ta");
    const hiPage0 = getPrecomputedPageTranslation(book.id, 0, "hi");

    expect(taPage0).not.toBeNull();
    expect(hiPage0).not.toBeNull();
    expect(taPage0!.paragraphs.length).toBe(book.pages[0]!.paragraphs.length);
    expect(hiPage0!.paragraphs.length).toBe(book.pages[0]!.paragraphs.length);
    expect(taPage0!.title).toContain("அத்தியாயம்");
    expect(hiPage0!.title).toContain("अध्याय");
  });

  it("provides instant English and Hindi translations for the Tamil Thirukkural starter book", () => {
    const enPage = getPrecomputedPageTranslation("sample-ta-kural", 0, "en");
    const hiPage = getPrecomputedPageTranslation("sample-ta-kural", 0, "hi");
    expect(enPage?.title).toContain("Education");
    expect(hiPage?.title).toContain("शिक्षा");
  });

  it("provides instant Tamil and Hindi translations for all pages of the Phonics Consonant Blends starter book", () => {
    const book = KINDLE_SAMPLE_BOOKS.find((b) => b.id === "sample-en-phonics-blends")!;
    expect(book).toBeDefined();
    expect(book.pages.length).toBe(4);
    book.pages.forEach((page, idx) => {
      const taPage = getPrecomputedPageTranslation(book.id, idx, "ta");
      const hiPage = getPrecomputedPageTranslation(book.id, idx, "hi");
      expect(taPage).not.toBeNull();
      expect(hiPage).not.toBeNull();
      expect(taPage!.paragraphs.length).toBe(page.paragraphs.length);
      expect(hiPage!.paragraphs.length).toBe(page.paragraphs.length);
    });
  });

  it("produces deterministic cache keys scoped by target language", () => {
    const kTa = buildTranslationCacheKey("ta", ["Hello", "World"]);
    const kHi = buildTranslationCacheKey("hi", ["Hello", "World"]);
    const kTaAgain = buildTranslationCacheKey("ta", ["Hello", "World"]);
    expect(kTa).toBe(kTaAgain);
    expect(kTa).not.toBe(kHi);
  });

  it("falls back per item when translation output is shorter or has blanks", () => {
    const out = normalizeTranslationResult(["One", "Two", "Three"], ["ஒன்று", ""]);
    expect(out).toEqual(["ஒன்று", "Two", "Three"]);
  });

  it("clears original htmlContent when building a translated page so translated text renders", () => {
    const translated = buildTranslatedPage(
      { title: "Original", paragraphs: ["Hello"], htmlContent: "<p>Hello</p>" },
      { title: "தமிழ் தலைப்பு", paragraphs: ["வணக்கம்"] },
    );
    expect(translated.title).toBe("தமிழ் தலைப்பு");
    expect(translated.paragraphs).toEqual(["வணக்கம்"]);
    expect(translated.htmlContent).toBeUndefined();
  });

  it("detects Tamil, Hindi, and English starter books by script", () => {
    const byId = (id: string) => KINDLE_SAMPLE_BOOKS.find((b) => b.id === id)!;
    expect(detectDocumentLanguage(byId("sample-ta-kural"))).toBe("ta");
    expect(detectDocumentLanguage(byId("sample-hi-story"))).toBe("hi");
    expect(detectDocumentLanguage(byId("sample-en-story"))).toBe("en");
  });
});