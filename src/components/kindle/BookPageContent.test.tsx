import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import BookPageContent, { type ThemeColors } from "./BookPageContent";

const THEME: ThemeColors = {
  surface: "bg-white text-slate-900",
  muted: "text-slate-500",
  highlight: "bg-amber-100",
  border: "border-slate-200",
};

const SAMPLE_PAGE = {
  title: "Chapter 1",
  paragraphs: ["Original English paragraph text."],
  htmlContent: "<p>Original HTML content.</p>",
};

describe("BookPageContent translation status", () => {
  it("shows language-specific translating status and hides untranslated content while translating", () => {
    render(
      <BookPageContent
        page={SAMPLE_PAGE}
        docTitle="Sample Book"
        pageNumber={1}
        totalPages={3}
        theme={THEME}
        fontSize={18}
        fontSerif
        activeParagraphIndex={-1}
        badgeLabel="हिन्दी (Hindi)"
        isTranslating
      />,
    );

    expect(screen.getAllByText("हिन्दी (Hindi) Translating…").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("status")).toHaveTextContent("Working on translation for this page.");
    expect(screen.queryByText("Original English paragraph text.")).toBeNull();
    expect(screen.queryByText("Original HTML content.")).toBeNull();
  });

  it("shows retry button when translation fails", () => {
    const onRetry = vi.fn();
    render(
      <BookPageContent
        page={SAMPLE_PAGE}
        docTitle="Sample Book"
        pageNumber={1}
        totalPages={3}
        theme={THEME}
        fontSize={18}
        fontSerif
        activeParagraphIndex={-1}
        badgeLabel="हिन्दी (Hindi)"
        translationError="Translation timed out."
        onRetryTranslation={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Translation timed out.");
    fireEvent.click(screen.getByRole("button", { name: /retry translation/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});