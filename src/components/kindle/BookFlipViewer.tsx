import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KindleDocument, KindlePage } from "@/lib/kindleFileParser";
import BookPageContent, { type ThemeColors } from "./BookPageContent";

export type BookStyle = "hardcover" | "paperback" | "spiral" | "magazine" | "fullpage";

interface BookFlipViewerProps {
  doc: KindleDocument;
  pageIdx: number;
  bookStyle: BookStyle;
  theme: ThemeColors;
  fontSize: number;
  fontSerif: boolean;
  readScope: "page" | "book";
  activeSegmentIdx: number;
  formatLabel: string;
  bilingualMode?: boolean;
  translatedPages?: Record<number, KindlePage>;
  translationBadge?: string;
  isTranslating?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onPageChange: (nextIdx: number) => void;
  onClose: () => void;
}

const BookFlipViewer = ({
  doc,
  pageIdx,
  bookStyle,
  theme,
  fontSize,
  fontSerif,
  readScope,
  activeSegmentIdx,
  formatLabel,
  bilingualMode = false,
  translatedPages,
  translationBadge,
  isTranslating = false,
  isBookmarked = false,
  onToggleBookmark,
  onPageChange,
  onClose,
}: BookFlipViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flipDir, setFlipDir] = useState<"next" | "prev" | null>(null);
  const [flipNonce, setFlipNonce] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isSideBySideBilingual = Boolean(
    bookStyle === "hardcover" && bilingualMode && translationBadge,
  );
  const showTwoPageSpread =
    !isSideBySideBilingual && bookStyle === "hardcover" && isDesktop && doc.pages.length > 1;
  const step = showTwoPageSpread ? 2 : 1;
  const leftIdx = showTwoPageSpread ? Math.floor(pageIdx / 2) * 2 : pageIdx;
  const rightIdx = showTwoPageSpread && leftIdx + 1 < doc.pages.length ? leftIdx + 1 : null;

  const canPrev = leftIdx > 0;
  const canNext = showTwoPageSpread
    ? leftIdx + 2 < doc.pages.length
    : pageIdx < doc.pages.length - 1;

  const flipTo = (target: number, dir: "next" | "prev") => {
    const clamped = Math.max(0, Math.min(doc.pages.length - 1, target));
    setFlipDir(dir);
    setFlipNonce((n) => n + 1);
    onPageChange(clamped);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      } else if (e.key === "ArrowRight" && canNext) {
        flipTo(leftIdx + step, "next");
      } else if (e.key === "ArrowLeft" && canPrev) {
        flipTo(leftIdx - step, "prev");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, canNext, canPrev, leftIdx, step, onClose]);

  const getActiveParaIdx = (idx: number) => {
    if (readScope !== "page" || idx !== pageIdx || activeSegmentIdx < 0) return -1;
    const p = doc.pages[idx];
    if (!p) return -1;
    const offset = (idx === 0 ? 1 : 0) + (p.title && p.title !== doc.title ? 1 : 0);
    return activeSegmentIdx - offset;
  };

  const flipClass =
    flipDir === "next" ? "kindle-flip-next" : flipDir === "prev" ? "kindle-flip-prev" : "";

  const rawLeftPage = doc.pages[leftIdx] ?? doc.pages[0]!;
  const rawRightPage = rightIdx !== null ? doc.pages[rightIdx] : null;
  const leftPage = isSideBySideBilingual
    ? rawLeftPage
    : (translatedPages?.[leftIdx] ?? rawLeftPage);
  const rightPage = isSideBySideBilingual
    ? (translatedPages?.[leftIdx] ?? rawLeftPage)
    : (rightIdx !== null ? (translatedPages?.[rightIdx] ?? rawRightPage) : null);
  const leftBadge = isSideBySideBilingual ? "Original" : translationBadge;
  const rightBadge = isSideBySideBilingual ? translationBadge : translationBadge;
  const visibleEndPage = !isSideBySideBilingual && rightIdx !== null ? rightIdx + 1 : leftIdx + 1;
  const readingProgressPct = Math.min(100, Math.round((visibleEndPage / Math.max(1, doc.pages.length)) * 100));
  const estimatedMinutes = Math.max(1, Math.round(doc.wordCount / 180));

  const widthClass =
    bookStyle === "fullpage" || isFullscreen
      ? "w-full max-w-none"
      : bookStyle === "hardcover" || bookStyle === "magazine"
        ? "w-full max-w-6xl mx-auto"
        : "w-full max-w-4xl mx-auto";

  const body = (
    <div className={`${widthClass} space-y-3`}>
      {/* Top Book Header Bar with always-visible Fullscreen & Close (X) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{formatLabel}</span>
            <span>·</span>
            <span>{doc.wordCount} words</span>
            <span>·</span>
            <span>~{estimatedMinutes} min read</span>
            <span>·</span>
            <span>
              {isSideBySideBilingual
                ? `Page ${leftIdx + 1} of ${doc.pages.length} · Side-by-Side`
                : rightPage
                ? `Pages ${leftIdx + 1}–${rightIdx! + 1} of ${doc.pages.length}`
                : `Page ${leftIdx + 1} of ${doc.pages.length}`}
            </span>
          </div>
          <h2 dir="auto" className="font-multilingual-serif text-base sm:text-xl font-bold text-foreground truncate">
            {doc.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleBookmark && (
            <Button
              type="button"
              variant={isBookmarked ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleBookmark}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? "Remove page bookmark" : "Bookmark this page"}
              className="gap-1.5"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen((f) => !f)}
            className="gap-1.5"
            aria-label={isFullscreen ? "Exit full screen" : "Full screen view"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Full" : "Full Screen"}</span>
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              setIsFullscreen(false);
              onClose();
            }}
            aria-label="Close book"
            className="gap-1 px-3 font-semibold shadow-sm"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </Button>
        </div>
      </div>

      {/* Subtle Reading Progress Bar */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/80">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${readingProgressPct}%` }}
            role="progressbar"
            aria-label="Reading progress"
            aria-valuenow={readingProgressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">
          {readingProgressPct}% read
        </span>
      </div>

      {/* Hard-copy Book Surface */}
      {bookStyle === "hardcover" ? (
        <div className="kindle-hardcover-frame rounded-2xl p-2.5 sm:p-4">
          <div
            key={`hc-${leftIdx}-${flipNonce}`}
            className={`grid ${rightPage ? "lg:grid-cols-2" : "grid-cols-1"} rounded-xl overflow-hidden border border-black/20 ${flipClass}`}
          >
            <div className={`relative p-5 sm:p-8 ${theme.surface} ${rightPage ? "kindle-spine-left border-b lg:border-b-0 lg:border-r border-black/15" : ""}`}>
              <BookPageContent
                page={leftPage}
                docTitle={doc.title}
                pageNumber={leftIdx + 1}
                totalPages={doc.pages.length}
                theme={theme}
                fontSize={fontSize}
                fontSerif={fontSerif}
                activeParagraphIndex={getActiveParaIdx(leftIdx)}
                badgeLabel={leftBadge}
                isTranslating={!isSideBySideBilingual && isTranslating && !translatedPages?.[leftIdx]}
              />
            </div>
            {rightPage && (
              <div className={`relative p-5 sm:p-8 ${theme.surface} kindle-spine-right`}>
                <BookPageContent
                  page={rightPage}
                  docTitle={doc.title}
                  pageNumber={isSideBySideBilingual ? leftIdx + 1 : rightIdx! + 1}
                  totalPages={doc.pages.length}
                  theme={theme}
                  fontSize={fontSize}
                  fontSerif={fontSerif}
                  activeParagraphIndex={getActiveParaIdx(isSideBySideBilingual ? leftIdx : rightIdx!)}
                  badgeLabel={rightBadge}
                  isTranslating={
                    isTranslating &&
                    !translatedPages?.[isSideBySideBilingual ? leftIdx : rightIdx!]
                  }
                />
              </div>
            )}
          </div>
        </div>
      ) : bookStyle === "spiral" ? (
        <div
          key={`sp-${leftIdx}-${flipNonce}`}
          className={`relative flex rounded-2xl border shadow-xl overflow-hidden ${theme.surface} ${theme.border} ${flipClass}`}
        >
          <div
            aria-hidden="true"
            className="w-7 sm:w-9 shrink-0 bg-slate-800/15 border-r border-slate-500/25 flex flex-col items-center justify-around py-6 gap-4"
          >
            {Array.from({ length: 10 }).map((_, idx) => (
              <span
                key={idx}
                className="w-4 sm:w-5 h-2.5 rounded-full border-2 border-slate-500 bg-slate-200 shadow-inner"
              />
            ))}
          </div>
          <div className="flex-1 min-w-0 p-5 sm:p-9 pl-6 sm:pl-10 border-l-2 border-rose-400/45 kindle-notebook-lines">
            <BookPageContent
              page={leftPage}
              docTitle={doc.title}
              pageNumber={leftIdx + 1}
              totalPages={doc.pages.length}
              theme={theme}
              fontSize={fontSize}
              fontSerif={fontSerif}
              activeParagraphIndex={getActiveParaIdx(leftIdx)}
              badgeLabel={translationBadge}
              isTranslating={isTranslating && !translatedPages?.[leftIdx]}
            />
          </div>
        </div>
      ) : bookStyle === "magazine" ? (
        <article
          key={`mg-${leftIdx}-${flipNonce}`}
          className={`rounded-xl border-2 shadow-xl p-5 sm:p-10 ${theme.surface} ${theme.border} ${flipClass}`}
        >
          <div className="border-y-2 border-current/25 py-1.5 mb-5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-semibold opacity-75">
            <span>Nethaji Reader Edition</span>
            <span>Issue · Page {leftIdx + 1}</span>
          </div>
          <BookPageContent
            page={leftPage}
            docTitle={doc.title}
            pageNumber={leftIdx + 1}
            totalPages={doc.pages.length}
            theme={theme}
            fontSize={fontSize}
            fontSerif={fontSerif}
            magazineColumns
            activeParagraphIndex={getActiveParaIdx(leftIdx)}
            badgeLabel={translationBadge}
            isTranslating={isTranslating && !translatedPages?.[leftIdx]}
          />
        </article>
      ) : (
        <article
          key={`pb-${leftIdx}-${flipNonce}`}
          className={`rounded-2xl border p-5 sm:p-9 ${theme.surface} ${theme.border} ${
            bookStyle === "paperback" ? "kindle-paper-stack" : "shadow-lg"
          } ${flipClass}`}
        >
          <BookPageContent
            page={leftPage}
            docTitle={doc.title}
            pageNumber={leftIdx + 1}
            totalPages={doc.pages.length}
            theme={theme}
            fontSize={fontSize}
            fontSerif={fontSerif}
            activeParagraphIndex={getActiveParaIdx(leftIdx)}
            badgeLabel={translationBadge}
            isTranslating={isTranslating && !translatedPages?.[leftIdx]}
          />
        </article>
      )}

      {/* Bottom Page Flip Navigation Bar */}
      <div className="rounded-xl border border-border bg-card px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => flipTo(leftIdx - step, "prev")}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Flip Back
        </Button>

        <div className="flex items-center gap-2">
          <select
            aria-label="Jump to page"
            value={leftIdx}
            onChange={(e) => {
              const target = Number(e.target.value);
              flipTo(target, target >= leftIdx ? "next" : "prev");
            }}
            className="rounded-lg border border-border bg-background text-foreground px-2.5 py-1 text-xs font-semibold"
          >
            {doc.pages.map((_, i) => (
              <option key={i} value={i}>
                Page {i + 1} of {doc.pages.length}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline text-[11px] text-muted-foreground">
            Tip: Use ← → keys to flip · Esc to close
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => flipTo(leftIdx + step, "next")}
          className="gap-1"
        >
          Flip Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${doc.title} full screen reader`}
        className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6"
      >
        {body}
      </div>,
      document.body,
    );
  }

  return body;
};

export default BookFlipViewer;