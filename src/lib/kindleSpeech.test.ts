import { describe, expect, it } from "vitest";
import { buildKindleSpeechSegments } from "./kindleSpeech";
import { ALL_SPEECH_LANGUAGES } from "./speechText";
import type { KindleDocument } from "./kindleFileParser";

const doc: KindleDocument = {
  id: "highlight", title: "Book", fileName: "book.txt", format: "text", wordCount: 8,
  pages: [
    { title: "Chapter 1", paragraphs: ["First", " ", "____", "Second"] },
    { title: "Book", paragraphs: ["Right page"] },
    { title: "Chapter 3", paragraphs: ["Last page"] },
  ],
};

describe("Kindle speech paragraph positions", () => {
  it("keeps original DOM indices after empty and silent lines", () => {
    const segments = buildKindleSpeechSegments(doc, [0]);
    expect(segments.find((s) => s.text === "Second")).toMatchObject({ pageIndex: 0, paragraphIndex: 3 });
    expect(segments.find((s) => s.text === "____")).toMatchObject({ paragraphIndex: 2 });
    expect(segments[0].paragraphIndex).toBeNull();
  });

  it.each(ALL_SPEECH_LANGUAGES)("maps the current translated paragraph without title offset drift in %s", (language) => {
    const translated = { 0: { title: `${language} chapter`, paragraphs: [`${language} first`, "", `${language} second`] } };
    const segments = buildKindleSpeechSegments(doc, [0], translated);
    expect(segments[1]).toEqual({ text: `${language} first`, pageIndex: 0, paragraphIndex: 0, translated: true });
    expect(segments[2].paragraphIndex).toBe(2);
  });

  it("maps the right page of the Original hardcover spread directly", () => {
    const segments = buildKindleSpeechSegments(doc, [0, 1]);
    expect(segments.find((s) => s.text === "Right page")).toMatchObject({ pageIndex: 1, paragraphIndex: 0, translated: false });
  });

  it("maps Full Book speech to later pages", () => {
    const segments = buildKindleSpeechSegments(doc, [0, 1, 2]);
    expect(segments.at(-1)).toMatchObject({ text: "Last page", pageIndex: 2, paragraphIndex: 0 });
  });
});