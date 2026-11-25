import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Minus,
  Plus,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceReader from "@/components/ui/VoiceReader";
import { ALL_SPEECH_LANGUAGES } from "@/lib/speechText";
import {
  extractKindleSpeechSegments,
  parseKindleFile,
  type KindleDocument,
} from "@/lib/kindleFileParser";
import { KINDLE_SAMPLE_BOOKS } from "@/lib/kindleSamples";

type PaperTheme = "light" | "sepia" | "dark";
type ReadScope = "page" | "book";

const THEME_STYLES: Record<PaperTheme, { surface: string; muted: string; highlight: string; border: string }> = {
  light: {
    surface: "bg-card text-foreground",
    muted: "text-muted-foreground",
    highlight: "bg-accent/15 ring-1 ring-accent/40",
    border: "border-border",
  },
  sepia: {
    surface: "bg-[#f6ecd9] text-[#3b2e1e]",
    muted: "text-[#7a6448]",
    highlight: "bg-[#e9d5a8] ring-1 ring-[#c4a265]",
    border: "border-[#e0cfa9]",
  },
  dark: {
    surface: "bg-[#17191f] text-[#e7e9ee]",
    muted: "text-[#9ca3b0]",
    highlight: "bg-[#2c3347] ring-1 ring-[#637099]",
    border: "border-[#2a2f3d]",
  },
};

const FORMAT_LABELS: Record<KindleDocument["format"], string> = {
  pdf: "PDF",
  word: "Word",
  excel: "Excel / CSV",
  epub: "e-Book",
  image: "Image + OCR",
  text: "Text",
  sample: "Sample Book",
};

const KindleReader = () => {
  const [doc, setDoc] = useState<KindleDocument>(KINDLE_SAMPLE_BOOKS[0]!);
  const [pageIdx, setPageIdx] = useState(0);
  const [paperTheme, setPaperTheme] = useState<PaperTheme>("sepia");
  const [fontSize, setFontSize] = useState(18);
  const [fontSerif, setFontSerif] = useState(true);
  const [readScope, setReadScope] = useState<ReadScope>("page");
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(-1);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setErrorMsg("");
    setLoadingMsg(`Opening ${file.name}…`);
    try {
      const parsed = await parseKindleFile(file, (status) => setLoadingMsg(status));
      parsed.pages.forEach((p) => {
        if (p.imageUrl) objectUrlsRef.current.push(p.imageUrl);
      });
      setDoc(parsed);
      setPageIdx(0);
      setActiveSegmentIdx(-1);
      setImageZoom(100);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not open this file.");
    } finally {
      setLoadingMsg("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentPage = doc.pages[pageIdx] ?? doc.pages[0]!;
  const theme = THEME_STYLES[paperTheme];
  const pageHeaderOffset =
    (pageIdx === 0 ? 1 : 0) + (currentPage.title && currentPage.title !== doc.title ? 1 : 0);

  const getSpeechSegments = useCallback(
    () => extractKindleSpeechSegments(doc, readScope === "page" ? pageIdx : undefined),
    [doc, readScope, pageIdx],
  );

  const handleSegmentChange = useCallback((idx: number, isSpeaking: boolean) => {
    setActiveSegmentIdx(isSpeaking ? idx : -1);
  }, []);

  const goToPage = (next: number) => {
    const clamped = Math.max(0, Math.min(doc.pages.length - 1, next));
    setPageIdx(clamped);
    setActiveSegmentIdx(-1);
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container-custom text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3">Kindle Reader</h1>
          <p className="text-base md:text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            Open PDF, Word, Excel, e-books, text, or images and listen aloud in Indian and world foreign languages.
          </p>
        </div>
      </section>

      <div className="container-custom py-8 space-y-6">
        {/* Full-width Voice Reader matching all blog pages */}
        <VoiceReader
          key={`${doc.id}-${pageIdx}-${readScope}`}
          getTextSegments={getSpeechSegments}
          showAnswersToggle={false}
          availableLanguages={ALL_SPEECH_LANGUAGES}
          align="full"
          defaultExpanded
          hintText="Listen in 28 Indian & World Foreign Languages"
          onSegmentChange={handleSegmentChange}
        />

        {/* Upload area + Sample library */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              isDragging ? "border-accent bg-accent/10" : "border-border bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              aria-label="Upload file to Kindle Reader"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.epub,.txt,.md,.html,.htm,.rtf,.jpg,.jpeg,.png,.webp,.gif,.bmp"
              onChange={(e) => void handleFile(e.target.files?.[0])}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <Upload className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base text-foreground">
                    Upload any book, document, spreadsheet, or image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, Word (.docx/.doc), Excel (.xlsx/.csv), e-Books (.epub), Text/Markdown/HTML &amp; Images (JPG, PNG, WebP)
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={Boolean(loadingMsg)}
                className="shrink-0 gap-2"
              >
                {loadingMsg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loadingMsg ? "Opening…" : "Choose File"}
              </Button>
            </div>
            {loadingMsg && (
              <p className="mt-3 text-xs font-medium text-primary">{loadingMsg}</p>
            )}
            {errorMsg && (
              <p role="alert" className="mt-3 text-xs font-semibold text-destructive">{errorMsg}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5 mr-1">
              <BookOpen className="h-3.5 w-3.5" /> Starter Books:
            </span>
            {KINDLE_SAMPLE_BOOKS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setDoc(sample);
                  setPageIdx(0);
                  setActiveSegmentIdx(-1);
                  setErrorMsg("");
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  doc.id === sample.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50"
                }`}
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Kindle Reading Controls */}
        <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Paper:</span>
            {(["light", "sepia", "dark"] as PaperTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPaperTheme(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                  paperTheme === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/40"
                }`}
              >
                {t === "light" ? "Paper" : t === "sepia" ? "Kindle Sepia" : "Night"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                aria-label="Decrease font size"
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="px-2 py-1 hover:bg-muted"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-xs font-semibold">{fontSize}px</span>
              <button
                type="button"
                aria-label="Increase font size"
                onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                className="px-2 py-1 hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFontSerif((v) => !v)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted"
            >
              {fontSerif ? "Serif" : "Sans"}
            </button>

            <div className="inline-flex rounded-lg border border-border overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReadScope("page")}
                className={`px-2.5 py-1 ${readScope === "page" ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                Read Page
              </button>
              <button
                type="button"
                onClick={() => setReadScope("book")}
                className={`px-2.5 py-1 ${readScope === "book" ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                Full Book
              </button>
            </div>
          </div>
        </div>

        {/* Kindle Page Viewer */}
        <article
          className={`rounded-2xl border shadow-lg transition-colors p-5 sm:p-10 max-w-4xl mx-auto ${theme.surface} ${theme.border}`}
        >
          <header className={`flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b ${theme.border}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>{FORMAT_LABELS[doc.format]}</span>
                <span>·</span>
                <span>{doc.wordCount} words</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1 break-words">{doc.title}</h2>
            </div>
            <span className={`text-xs font-semibold ${theme.muted}`}>
              Page {pageIdx + 1} of {doc.pages.length}
            </span>
          </header>

          {currentPage.title && currentPage.title !== doc.title && (
            <h3 className={`font-serif text-lg sm:text-xl font-semibold mb-4 ${theme.muted}`}>
              {currentPage.title}
            </h3>
          )}

          {currentPage.imageUrl && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setImageZoom((z) => Math.max(50, z - 25))}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-semibold">{imageZoom}%</span>
                <Button size="sm" variant="outline" onClick={() => setImageZoom((z) => Math.min(200, z + 25))}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="overflow-auto rounded-xl border border-border bg-black/5 p-2 text-center">
                <img
                  src={currentPage.imageUrl}
                  alt={doc.title}
                  style={{ width: `${imageZoom}%` }}
                  className="max-w-none mx-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {currentPage.tableRows && currentPage.tableRows.length > 0 && (
            <div className="mb-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    {(currentPage.tableRows[0] ?? []).map((cell, ci) => (
                      <th key={ci} className="px-3 py-2 font-semibold border-b border-border whitespace-nowrap">
                        {cell || `Column ${ci + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentPage.tableRows.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b border-border/60 last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div
            style={{ fontSize: `${fontSize}px` }}
            className={`space-y-4 leading-relaxed ${fontSerif ? "font-serif" : "font-sans"}`}
          >
            {currentPage.paragraphs.map((para, i) => {
              const isSpoken = readScope === "page" && activeSegmentIdx === pageHeaderOffset + i;
              return (
                <p
                  key={i}
                  className={`rounded-lg px-2 py-1 transition-colors ${isSpoken ? theme.highlight : ""}`}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Bottom page turner */}
          <footer className={`mt-8 pt-4 border-t flex items-center justify-between gap-2 ${theme.border}`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageIdx === 0}
              onClick={() => goToPage(pageIdx - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>

            <select
              aria-label="Jump to page"
              value={pageIdx}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="rounded-lg border border-border bg-background text-foreground px-2.5 py-1 text-xs font-semibold"
            >
              {doc.pages.map((p, i) => (
                <option key={i} value={i}>
                  Page {i + 1} of {doc.pages.length}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageIdx >= doc.pages.length - 1}
              onClick={() => goToPage(pageIdx + 1)}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default KindleReader;