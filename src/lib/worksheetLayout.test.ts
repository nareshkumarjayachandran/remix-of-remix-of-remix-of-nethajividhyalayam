import { describe, expect, it } from "vitest";
import {
  distributeBookletPages,
  getBookletImpositionOrder,
  getWordPageCss,
  type WorksheetSection,
} from "./worksheetLayout";

describe("worksheetLayout", () => {
  it("preserves all questions in order without duplication across 4 booklet pages", () => {
    const sections: WorksheetSection[] = [
      {
        type: "fill_in_blanks",
        heading: "I. Fill in the blanks",
        questions: [
          { id: 1, question: "Q1 ____", answer: "A1" },
          { id: 2, question: "Q2 ____", answer: "A2" },
          { id: 3, question: "Q3 ____", answer: "A3" },
        ],
      },
      {
        type: "multiple_choice",
        heading: "II. Multiple Choice",
        questions: [
          { id: 4, question: "Q4", options: ["A", "B", "C", "D"], answer: "A" },
          { id: 5, question: "Q5", options: ["A", "B", "C", "D"], answer: "B" },
          { id: 6, question: "Q6", options: ["A", "B", "C", "D"], answer: "C" },
        ],
      },
      {
        type: "short_answer",
        heading: "III. Short Answer",
        questions: [
          { id: 7, question: "Q7", answer: "Ans7" },
          { id: 8, question: "Q8", answer: "Ans8" },
          { id: 9, question: "Q9", answer: "Ans9" },
          { id: 10, question: "Q10", answer: "Ans10" },
        ],
      },
    ];

    const pages = distributeBookletPages(sections);
    const allIds = [
      ...pages.page1,
      ...pages.page2,
      ...pages.page3,
      ...pages.page4,
    ].flatMap((slice) => slice.questions.map((entry) => entry.question.id));

    expect(allIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(pages.page1.length).toBeGreaterThan(0);
    expect(pages.page2.length).toBeGreaterThan(0);
    expect(pages.page3.length).toBeGreaterThan(0);
  });

  it("marks split sections as continuations on later pages", () => {
    const sections: WorksheetSection[] = [
      {
        type: "short_answer",
        heading: "I. Answer the following",
        questions: Array.from({ length: 8 }, (_, idx) => ({
          id: idx + 1,
          question: `Question ${idx + 1}`,
          answer: `Answer ${idx + 1}`,
        })),
      },
    ];

    const pages = distributeBookletPages(sections);
    expect(pages.page1[0]?.isContinuation).toBe(false);
    expect(pages.page2[0]?.isContinuation).toBe(true);
  });

  it("uses 1-sheet folded booklet imposition order: [4, 1] then [2, 3]", () => {
    expect(getBookletImpositionOrder()).toEqual([
      [4, 1],
      [2, 3],
    ]);
  });

  it("returns landscape @page CSS for landscape and booklet Word exports", () => {
    expect(getWordPageCss("portrait")).toContain("A4 portrait");
    expect(getWordPageCss("landscape")).toContain("A4 landscape");
    expect(getWordPageCss("booklet")).toContain("A4 landscape");
  });
});