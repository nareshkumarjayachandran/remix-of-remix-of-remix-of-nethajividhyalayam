import { useEffect, useState } from "react";
import { Eye, FileText, Loader2, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KindlePage } from "@/lib/kindleFileParser";

export interface ThemeColors {
  surface: string;
  muted: string;
  highlight: string;
  border: string;
}

interface BookPageContentProps {
  page: KindlePage;
  docTitle: string;
  pageNumber: number;
  totalPages: number;
  theme: ThemeColors;
  fontSize: number;
  fontSerif: boolean;
  magazineColumns?: boolean;
  activeParagraphIndex: number;
  badgeLabel?: string;
  isTranslating?: boolean;
}

const BookPageContent = ({
  page,
  docTitle,
  pageNumber,
  totalPages,
  theme,
  fontSize,
  fontSerif,
  magazineColumns = false,
  activeParagraphIndex,
  badgeLabel,
  isTranslating = false,
}: BookPageContentProps) => {
  const [pdfImageUrl, setPdfImageUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfViewMode, setPdfViewMode] = useState<"visual" | "text">("visual");
  const [zoom, setZoom] = useState<number | "fit">("fit");

  useEffect(() => {
    setZoom("fit");
    setPdfViewMode("visual");
    if (!page.renderVisualPage) {
      setPdfImageUrl("");
      setPdfLoading(false);
      return;
    }
    let cancelled = false;
    setPdfLoading(true);
    page
      .renderVisualPage(1.6)
      .then((url) => {
        if (!cancelled) setPdfImageUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setPdfImageUrl("");
          setPdfViewMode("text");
        }
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const fontClass = fontSerif ? "font-multilingual-serif" : "font-multilingual-sans";
  const visualImageSrc = page.renderVisualPage ? pdfImageUrl : page.imageUrl;
  const showVisualImage = Boolean(
    (page.renderVisualPage && pdfViewMode === "visual") || (!page.renderVisualPage && page.imageUrl),
  );

  return (
    <div className={`flex flex-col h-full ${fontClass}`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b ${theme.border}`}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {badgeLabel && (
            <span className="inline-flex items-center rounded-md bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-bold shrink-0">
              {badgeLabel}
            </span>
          )}
          <h3 dir="auto" className="text-base sm:text-lg font-bold leading-snug break-words">
            {page.title && page.title !== docTitle ? page.title : docTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {page.renderVisualPage && (
            <div className="inline-flex rounded-md border border-current/20 overflow-hidden text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPdfViewMode("visual")}
                className={`px-2 py-0.5 inline-flex items-center gap-1 ${
                  pdfViewMode === "visual" ? "bg-primary text-primary-foreground" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Eye className="h-3 w-3" /> Page View
              </button>
              <button
                type="button"
                onClick={() => setPdfViewMode("text")}
                className={`px-2 py-0.5 inline-flex items-center gap-1 ${
                  pdfViewMode === "text" ? "bg-primary text-primary-foreground" : "opacity-75 hover:opacity-100"
                }`}
              >
                <FileText className="h-3 w-3" /> Text
              </button>
            </div>
          )}
          <span className={`text-xs font-semibold ${theme.muted}`}>
            {pageNumber} / {totalPages}
          </span>
        </div>
      </div>

      {showVisualImage && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs bg-background/80 text-foreground"
              onClick={() => setZoom("fit")}
            >
              <Maximize className="h-3 w-3 mr-1" /> Fit Page
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Zoom out"
              className="h-7 px-2 bg-background/80 text-foreground"
              onClick={() => setZoom((z) => Math.max(60, (z === "fit" ? 100 : z) - 25))}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-semibold min-w-[3rem] text-center">
              {zoom === "fit" ? "Fit" : `${zoom}%`}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Zoom in"
              className="h-7 px-2 bg-background/80 text-foreground"
              onClick={() => setZoom((z) => Math.min(250, (z === "fit" ? 100 : z) + 25))}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="overflow-auto rounded-xl border border-current/15 bg-white p-2 text-center shadow-inner">
            {pdfLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-600 text-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Rendering full page…</span>
              </div>
            ) : visualImageSrc ? (
              <img
                src={visualImageSrc}
                alt={`${docTitle} page ${pageNumber}`}
                style={zoom === "fit" ? undefined : { width: `${zoom}%`, maxWidth: "none" }}
                className={zoom === "fit" ? "w-full h-auto mx-auto rounded-md" : "h-auto mx-auto rounded-md"}
              />
            ) : null}
          </div>
        </div>
      )}

      {page.tableRows && page.tableRows.length > 0 && (
        <div className="mb-5 overflow-x-auto rounded-xl border border-current/20">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-primary/15">
                {(page.tableRows[0] ?? []).map((cell, ci) => (
                  <th key={ci} dir="auto" className="px-3 py-2 font-semibold border-b border-current/20 whitespace-nowrap">
                    {cell || `Column ${ci + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.tableRows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-current/10 last:border-0 odd:bg-current/[0.03]">
                  {row.map((cell, ci) => (
                    <td key={ci} dir="auto" className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page.htmlContent && (
        <div
          dir="auto"
          style={{ fontSize: `${fontSize}px` }}
          className={`kindle-rich-html leading-relaxed ${magazineColumns ? "md:columns-2 md:gap-8" : ""}`}
          dangerouslySetInnerHTML={{ __html: page.htmlContent }}
        />
      )}

      {!page.htmlContent && !(page.renderVisualPage && pdfViewMode === "visual") && (
        <div
          style={{ fontSize: `${fontSize}px` }}
          className={`space-y-4 leading-relaxed ${magazineColumns ? "md:columns-2 md:gap-8" : ""}`}
        >
          {isTranslating && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>Translating page…</span>
            </div>
          )}
          {page.paragraphs.map((para, i) => {
            const isSpoken = activeParagraphIndex === i;
            return (
              <p
                key={i}
                dir="auto"
                className={`rounded-lg px-2 py-1 break-words transition-colors ${
                  magazineColumns ? "break-inside-avoid" : ""
                } ${isSpoken ? theme.highlight : ""}`}
              >
                {para}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookPageContent;