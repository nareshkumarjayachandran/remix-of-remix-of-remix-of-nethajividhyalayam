import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => vi.restoreAllMocks());

describe("mobile speech following", () => {
  it.each([
    ["English", "The rabbit reached the well.", "The lion looked inside."],
    ["Tamil", "முயல் கிணற்றை அடைந்தது.", "சிங்கம் உள்ளே பார்த்தது."],
    ["Hindi", "खरगोश कुएँ तक पहुँचा।", "शेर ने अंदर देखा।"],
  ])("follows the current %s paragraph, not the previous one", (_language, first, second) => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 1100, bottom: 1200,
    } as DOMRect);
    const followed: string[] = [];
    const scroll = vi.fn(function (this: HTMLElement) { followed.push(this.textContent ?? ""); });
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scroll });
    const props = {
      page: { title: "Chapter", paragraphs: [first, "", second] }, docTitle: "Book",
      pageNumber: 1, totalPages: 2, theme: THEME, fontSize: 18, fontSerif: true,
    };
    const { rerender } = render(<BookPageContent {...props} activeParagraphIndex={0} />);
    rerender(<BookPageContent {...props} activeParagraphIndex={2} />);
    rerender(<BookPageContent {...props} activeParagraphIndex={-1} />);
    expect(followed).toEqual([first, second]);
    expect(scroll).toHaveBeenLastCalledWith({ behavior: "instant", block: "start", inline: "nearest" });
  });

  it.each([false, true])("does not move visible paragraphs or change desktop scrolling (desktop: %s)", (desktop) => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: desktop } as MediaQueryList);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 100, bottom: 200 } as DOMRect);
    const scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scroll });
    render(<BookPageContent page={{ title: "Chapter", paragraphs: ["Visible paragraph"] }}
      docTitle="Book" pageNumber={1} totalPages={1} theme={THEME} fontSize={18}
      fontSerif activeParagraphIndex={0} />);
    expect(scroll).not.toHaveBeenCalled();
  });
});

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