import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bookmark, BookOpen, ChevronDown, Columns2, Languages, Loader2, Minus, Plus, Search, ShieldCheck, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import VoiceReader from "@/components/ui/VoiceReader";
import BookFlipViewer, { type BookStyle } from "@/components/kindle/BookFlipViewer";
import type { ThemeColors } from "@/components/kindle/BookPageContent";
import {
  ALL_SPEECH_LANGUAGES,
  FOREIGN_SPEECH_LANGUAGES,
  formatSpeechLanguageDisplay,
  INDIAN_SPEECH_LANGUAGES,
  SPEECH_LANGUAGE_META,
  type SpeechLanguage,
} from "@/lib/speechText";
import {
  extractKindleSpeechSegments,
  parseKindleFile,
  type KindleDocument,
  type KindlePage,
} from "@/lib/kindleFileParser";
import { KINDLE_SAMPLE_BOOKS } from "@/lib/kindleSamples";
import {
  fetchKindleLibraryItems,
  openKindleLibraryItem,
  type KindleLibraryItem,
} from "@/lib/kindleLibrary";
import {
  buildTranslatedPage,
  detectDocumentLanguage,
  translateKindlePage,
} from "@/lib/kindleTranslation";

type PaperTheme = "light" | "sepia" | "dark";
type ReadScope = "page" | "book";
type ViewLanguage = "original" | SpeechLanguage;

const QUICK_TRANSLATE_LANGS: SpeechLanguage[] = ["en", "ta", "hi"];
const BOOKMARKS_STORAGE_KEY = "nv-kindle-bookmarks-v1";

function loadBookmarks(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clean: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v)) clean[k] = v.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0);
    }
    return clean;
  } catch {
    return {};
  }
}

const THEME_STYLES: Record<PaperTheme, ThemeColors> = {
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

const BOOK_STYLES: { id: BookStyle; label: string }[] = [
  { id: "hardcover", label: "Hardcover 2-Page" },
  { id: "paperback", label: "Paperback Flip" },
  { id: "spiral", label: "Spiral Notebook" },
  { id: "magazine", label: "Magazine" },
  { id: "fullpage", label: "Full Page" },
];

const KindleReader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doc, setDoc] = useState<KindleDocument | null>(KINDLE_SAMPLE_BOOKS[0] ?? null);
  const [libraryItems, setLibraryItems] = useState<KindleLibraryItem[]>([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [bookStyle, setBookStyle] = useState<BookStyle>("hardcover");
  const [paperTheme, setPaperTheme] = useState<PaperTheme>("sepia");
  const [fontSize, setFontSize] = useState(18);
  const [fontSerif, setFontSerif] = useState(true);
  const [readScope, setReadScope] = useState<ReadScope>("page");
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(-1);
  const [viewLang, setViewLang] = useState<ViewLanguage>("original");
  const [voiceLang, setVoiceLang] = useState<SpeechLanguage>("en");
  const [bilingualSplit, setBilingualSplit] = useState(true);
  const [translatedPages, setTranslatedPages] = useState<Record<number, KindlePage>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, number[]>>(loadBookmarks);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const activeCleanupRef = useRef<(() => void) | undefined>(undefined);
  const openedQueryItemRef = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      activeCleanupRef.current?.();
    };
  }, []);

  const openDocument = (nextDoc: KindleDocument, defaultStyle?: BookStyle) => {
    activeCleanupRef.current?.();
    activeCleanupRef.current = nextDoc.cleanup;
    setDoc(nextDoc);
    setPageIdx(0);
    setActiveSegmentIdx(-1);
    setViewLang("original");
    setVoiceLang(detectDocumentLanguage(nextDoc));
    setTranslatedPages({});
    setTranslationError("");
    setErrorMsg("");
    setSearchQuery("");
    setBookStyle(defaultStyle ?? "hardcover");
  };

  const handleOpenLibraryItem = useCallback(async (item: KindleLibraryItem) => {
    setErrorMsg("");
    setLoadingMsg(`Opening ${item.title}…`);
    try {
      const parsed = await openKindleLibraryItem(item, (status) => setLoadingMsg(status));
      parsed.pages.forEach((p) => {
        if (p.imageUrl) objectUrlsRef.current.push(p.imageUrl);
      });
      openDocument(parsed, "hardcover");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not open this library item.");
    } finally {
      setLoadingMsg("");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchKindleLibraryItems()
      .then((items) => {
        if (!cancelled) setLibraryItems(items);
      })
      .catch(() => {
        // Keep starter books available even if library fetch fails
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const itemId = searchParams.get("item");
    if (!itemId || openedQueryItemRef.current === itemId || libraryItems.length === 0) return;
    const found = libraryItems.find((item) => item.id === itemId);
    if (found) {
      openedQueryItemRef.current = itemId;
      void handleOpenLibraryItem(found);
    }
  }, [searchParams, libraryItems, handleOpenLibraryItem]);

  const closeDocument = () => {
    activeCleanupRef.current?.();
    activeCleanupRef.current = undefined;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setDoc(null);
    setPageIdx(0);
    setActiveSegmentIdx(-1);
    setViewLang("original");
    setTranslatedPages({});
    setTranslationError("");
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setErrorMsg("");
    setLoadingMsg(`Opening ${file.name}…`);
    try {
      const parsed = await parseKindleFile(file, (status) => setLoadingMsg(status));
      parsed.pages.forEach((p) => {
        if (p.imageUrl) objectUrlsRef.current.push(p.imageUrl);
      });
      openDocument(parsed, "hardcover");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not open this file.");
    } finally {
      setLoadingMsg("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const theme = THEME_STYLES[paperTheme];
  const docNativeLang = doc ? detectDocumentLanguage(doc) : "en";
  const docBookmarks = useMemo(() => (doc ? bookmarks[doc.id] ?? [] : []), [bookmarks, doc]);
  const isCurrentPageBookmarked = docBookmarks.includes(pageIdx);

  const toggleBookmark = () => {
    if (!doc) return;
    setBookmarks((prev) => {
      const existing = prev[doc.id] ?? [];
      const nextList = existing.includes(pageIdx)
        ? existing.filter((p) => p !== pageIdx)
        : [...existing, pageIdx].sort((a, b) => a - b);
      const next = { ...prev, [doc.id]: nextList };
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!doc || !q) return [];
    const results: { pageIndex: number; snippet: string }[] = [];
    doc.pages.forEach((page, idx) => {
      const activePage = viewLang !== "original" ? translatedPages[idx] ?? page : page;
      const text = [activePage.title ?? "", ...activePage.paragraphs].join(" ");
      const pos = text.toLowerCase().indexOf(q);
      if (pos !== -1) {
        const start = Math.max(0, pos - 30);
        const end = Math.min(text.length, pos + q.length + 50);
        const prefix = start > 0 ? "…" : "";
        const suffix = end < text.length ? "…" : "";
        results.push({ pageIndex: idx, snippet: `${prefix}${text.slice(start, end).trim()}${suffix}` });
      }
    });
    return results;
  }, [doc, searchQuery, viewLang, translatedPages]);

  // Translate visible page(s) whenever viewLang or current page changes
  useEffect(() => {
    if (!doc || viewLang === "original" || viewLang === docNativeLang) {
      setTranslatedPages({});
      setIsTranslating(false);
      setTranslationError("");
      return;
    }

    let cancelled = false;
    const indices =
      bookStyle === "hardcover" && !bilingualSplit && pageIdx + 1 < doc.pages.length
        ? [Math.floor(pageIdx / 2) * 2, Math.floor(pageIdx / 2) * 2 + 1].filter(
            (i) => i < doc.pages.length,
          )
        : [pageIdx];

    setIsTranslating(true);
    setTranslationError("");

    Promise.all(
      indices.map(async (idx) => {
        const translated = await translateKindlePage(doc, idx, viewLang);
        return [idx, buildTranslatedPage(doc.pages[idx]!, translated)] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        setTranslatedPages((prev) => {
          const next = { ...prev };
          for (const [idx, p] of entries) next[idx] = p;
          return next;
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setTranslationError(
            err instanceof Error ? err.message : "Could not translate this page.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doc, viewLang, docNativeLang, pageIdx, bookStyle, bilingualSplit]);

  const handleSelectViewLang = (next: ViewLanguage) => {
    const resolved: ViewLanguage = next === docNativeLang ? "original" : next;
    setTranslatedPages({});
    setTranslationError("");
    setViewLang(resolved);
    setVoiceLang(resolved === "original" ? docNativeLang : resolved);
  };

  const handleVoiceLangChange = (nextLang: SpeechLanguage) => {
    const resolvedView: ViewLanguage = nextLang === docNativeLang ? "original" : nextLang;
    setVoiceLang(nextLang);
    if (resolvedView !== viewLang) {
      setTranslatedPages({});
      setTranslationError("");
      setViewLang(resolvedView);
    }
  };

  const isOriginalTwoPageSpread = Boolean(
    doc &&
      bookStyle === "hardcover" &&
      viewLang === "original" &&
      isDesktop &&
      doc.pages.length > 1,
  );

  const getSpeechSegments = useCallback(
    async (_includeAnswers: boolean, language: SpeechLanguage = voiceLang) => {
      if (!doc) return [];

      // Use original text directly when speaking in the document's own language and no translation is active
      if (viewLang === "original" && language === docNativeLang) {
        if (readScope === "book") {
          return extractKindleSpeechSegments(doc);
        }
        if (isOriginalTwoPageSpread) {
          const leftIdx = Math.floor(pageIdx / 2) * 2;
          const spreadIndices =
            leftIdx + 1 < doc.pages.length ? [leftIdx, leftIdx + 1] : [leftIdx];
          return extractKindleSpeechSegments(doc, spreadIndices);
        }
        return extractKindleSpeechSegments(doc, pageIdx);
      }

      const targetIndices =
        readScope === "page" ? [pageIdx] : doc.pages.map((_, idx) => idx);

      const translatedDocPages = await Promise.all(
        targetIndices.map(async (idx) => {
          const translated = await translateKindlePage(doc, idx, language);
          return [idx, buildTranslatedPage(doc.pages[idx]!, translated)] as const;
        }),
      );

      if (language === viewLang) {
        setTranslatedPages((prev) => {
          const next = { ...prev };
          for (const [idx, p] of translatedDocPages) next[idx] = p;
          return next;
        });
      }

      const segments: string[] = [];
      for (const [idx, page] of translatedDocPages) {
        if (idx === 0 && (!page.title || page.title === doc.title)) {
          segments.push(doc.title);
        }
        if (page.title && page.title !== doc.title) segments.push(page.title);
        for (const para of page.paragraphs) {
          const clean = para.trim();
          if (clean) segments.push(clean);
        }
      }
      return segments;
    },
    [doc, readScope, pageIdx, voiceLang, viewLang, docNativeLang, isOriginalTwoPageSpread],
  );

  const handleSegmentChange = useCallback((idx: number, isSpeaking: boolean) => {
    setActiveSegmentIdx(isSpeaking ? idx : -1);
  }, []);

  const goToPage = (next: number) => {
    if (!doc) return;
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
          key={`${doc?.id ?? "closed"}-${pageIdx}-${readScope}-${voiceLang}-${isOriginalTwoPageSpread ? "spread" : "single"}`}
          getTextSegments={getSpeechSegments}
          showAnswersToggle={false}
          availableLanguages={ALL_SPEECH_LANGUAGES}
          selectedLanguage={voiceLang}
          onLanguageChange={handleVoiceLangChange}
          align="full"
          defaultExpanded
          hintText="Listen & Translate in Tamil, English, Hindi & 25+ Languages"
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

          <div className="flex flex-wrap items-center justify-between gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" aria-label="Starter Books">
                  <BookOpen className="h-4 w-4" />
                  {libraryItems.length > 0 ? `School Library (${libraryItems.length}) & Starter Books` : "Starter Books"}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto">
                {libraryItems.length > 0 && (
                  <>
                    <DropdownMenuLabel className="text-xs">School Library (Books &amp; Worksheets)</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={doc?.id ?? ""}
                      onValueChange={(id) => {
                        const item = libraryItems.find((entry) => `library-${entry.id}` === id);
                        if (item) {
                          setSearchParams({ item: item.id }, { replace: true });
                          void handleOpenLibraryItem(item);
                        }
                      }}
                    >
                      {libraryItems.map((item) => (
                        <DropdownMenuRadioItem
                          key={item.id}
                          value={`library-${item.id}`}
                          className="font-multilingual-sans whitespace-normal"
                        >
                          <span className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {item.category === "worksheet" ? "Worksheet" : "Book"}
                              {item.standard !== "All" ? ` · Class ${item.standard}` : ""}
                            </span>
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel className="text-xs">Starter Books</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={doc?.id ?? ""}
                  onValueChange={(id) => {
                    const sample = KINDLE_SAMPLE_BOOKS.find((book) => book.id === id);
                    if (sample) {
                      if (searchParams.has("item")) setSearchParams({}, { replace: true });
                      openDocument(sample);
                    }
                  }}
                >
                  {KINDLE_SAMPLE_BOOKS.map((sample) => (
                    <DropdownMenuRadioItem key={sample.id} value={sample.id} className="font-multilingual-sans whitespace-normal">
                      {sample.title}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <Link to="/kindle-admin">
                <ShieldCheck className="h-3.5 w-3.5" /> Staff Upload
              </Link>
            </Button>
          </div>
        </div>

        {doc ? (
          <>
            {/* Compact, edge-aligned reading toolbar */}
            <div role="toolbar" aria-label="Book reading controls" className="space-y-3 border-y border-border py-3">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Book Style:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                        <BookOpen className="h-3.5 w-3.5" />
                        {BOOK_STYLES.find((style) => style.id === bookStyle)?.label}
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup value={bookStyle} onValueChange={(value) => {
                        const style = BOOK_STYLES.find((item) => item.id === value);
                        if (style) setBookStyle(style.id);
                      }}>
                        {BOOK_STYLES.map((style) => (
                          <DropdownMenuRadioItem key={style.id} value={style.id}>{style.label}</DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Languages className="h-3.5 w-3.5" /> Read &amp; Translate:
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button variant={viewLang === "original" ? "default" : "ghost"} size="sm" className="h-8 px-2 text-xs" aria-pressed={viewLang === "original"} onClick={() => handleSelectViewLang("original")}>Original</Button>
                    {QUICK_TRANSLATE_LANGS.map((code) => (
                      <Button
                        key={code}
                        variant={viewLang === code || (viewLang === "original" && code === docNativeLang) ? "default" : "ghost"}
                        size="sm"
                        className="font-multilingual-sans h-8 px-2 text-xs"
                        aria-pressed={viewLang === code || (viewLang === "original" && code === docNativeLang)}
                        onClick={() => handleSelectViewLang(code)}
                      >
                        {code === "en" ? "English" : SPEECH_LANGUAGE_META[code].nativeLabel}
                      </Button>
                    ))}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={viewLang !== "original" && !QUICK_TRANSLATE_LANGS.includes(viewLang) ? "default" : "outline"}
                          size="sm"
                          className="font-multilingual-sans h-8 gap-1 px-2 text-xs"
                          aria-label="More translation languages"
                        >
                          {viewLang !== "original" && !QUICK_TRANSLATE_LANGS.includes(viewLang)
                            ? SPEECH_LANGUAGE_META[viewLang].nativeLabel
                            : "25+ More"}
                          <ChevronDown className="h-3 w-3 opacity-75" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                        <DropdownMenuLabel className="text-xs">Indian Languages</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={viewLang === "original" ? docNativeLang : viewLang} onValueChange={(val) => handleSelectViewLang(val as SpeechLanguage)}>
                          {INDIAN_SPEECH_LANGUAGES.map((code) => (
                            <DropdownMenuRadioItem key={code} value={code} className="font-multilingual-sans text-xs">
                              {formatSpeechLanguageDisplay(code, "option")}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">World Foreign Languages</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={viewLang === "original" ? docNativeLang : viewLang} onValueChange={(val) => handleSelectViewLang(val as SpeechLanguage)}>
                          {FOREIGN_SPEECH_LANGUAGES.map((code) => (
                            <DropdownMenuRadioItem key={code} value={code} className="font-multilingual-sans text-xs">
                              {formatSpeechLanguageDisplay(code, "option")}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border/60 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Paper:</span>
                  {(["light", "sepia", "dark"] as PaperTheme[]).map((t) => (
                    <Button key={t} variant={paperTheme === t ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs" aria-pressed={paperTheme === t} onClick={() => setPaperTheme(t)}>
                      {t === "light" ? "Paper" : t === "sepia" ? "Kindle Sepia" : "Night"}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                  <Button
                    variant={searchOpen ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-xs"
                    aria-expanded={searchOpen}
                    onClick={() => setSearchOpen((o) => !o)}
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Find</span>
                  </Button>
                  {docBookmarks.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs" aria-label="Saved bookmarks">
                          <Bookmark className="h-3.5 w-3.5 fill-current" />
                          <span>{docBookmarks.length}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">Bookmarked Pages</DropdownMenuLabel>
                        {docBookmarks.map((bIdx) => (
                          <DropdownMenuRadioItem
                            key={bIdx}
                            value={String(bIdx)}
                            onSelect={() => goToPage(bIdx)}
                            className="text-xs"
                          >
                            Page {bIdx + 1}{doc.pages[bIdx]?.title ? ` · ${doc.pages[bIdx]?.title}` : ""}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <div className="inline-flex h-8 items-center overflow-hidden rounded-md border border-border">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" aria-label="Decrease font size" title="Decrease font size" onClick={() => setFontSize((s) => Math.max(14, s - 2))}><Minus className="h-3.5 w-3.5" /></Button>
                    <span className="w-10 text-center text-xs font-semibold tabular-nums">{fontSize}px</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" aria-label="Increase font size" title="Increase font size" onClick={() => setFontSize((s) => Math.min(28, s + 2))}><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 w-14 px-2 text-xs" onClick={() => setFontSerif((v) => !v)}>{fontSerif ? "Serif" : "Sans"}</Button>
                  <div className="inline-flex overflow-hidden rounded-md border border-border">
                    <Button variant={readScope === "page" ? "default" : "ghost"} size="sm" className="h-8 rounded-none px-2 text-xs" aria-pressed={readScope === "page"} onClick={() => setReadScope("page")}>{isOriginalTwoPageSpread ? "Read 2 Pages" : "Read Page"}</Button>
                    <Button variant={readScope === "book" ? "default" : "ghost"} size="sm" className="h-8 rounded-none px-2 text-xs" aria-pressed={readScope === "book"} onClick={() => setReadScope("book")}>Full Book</Button>
                  </div>
                </div>
              </div>

              {searchOpen && (
                <div className="rounded-lg border border-border bg-card p-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search words or phrases in this book…"
                      aria-label="Search in book"
                      className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {searchQuery.trim() && (
                    <div className="max-h-40 overflow-y-auto space-y-1 border-t border-border/60 pt-2">
                      {searchMatches.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No matching passages found.</p>
                      ) : (
                        searchMatches.map((m) => (
                          <button
                            key={m.pageIndex}
                            type="button"
                            onClick={() => goToPage(m.pageIndex)}
                            className="w-full text-left rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors flex items-start gap-2"
                          >
                            <span className="font-semibold text-primary shrink-0">P.{m.pageIndex + 1}</span>
                            <span className="text-muted-foreground line-clamp-1">{m.snippet}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {bookStyle === "hardcover" && viewLang !== "original" && (
                <div className="flex justify-end">
                  <div className="inline-flex overflow-hidden rounded-md border border-border">
                    <Button variant={bilingualSplit ? "secondary" : "ghost"} size="sm" className="h-8 gap-1 rounded-none px-2 text-xs" aria-pressed={bilingualSplit} onClick={() => setBilingualSplit(true)}><Columns2 className="h-3.5 w-3.5" /> Side-by-Side</Button>
                    <Button variant={!bilingualSplit ? "secondary" : "ghost"} size="sm" className="h-8 rounded-none px-2 text-xs" aria-pressed={!bilingualSplit} onClick={() => setBilingualSplit(false)}>Full Page</Button>
                  </div>
                </div>
              )}
              {translationError && <p role="alert" className="text-xs font-semibold text-destructive">{translationError}</p>}
            </div>

            <BookFlipViewer
              doc={doc}
              pageIdx={pageIdx}
              bookStyle={bookStyle}
              theme={theme}
              fontSize={fontSize}
              fontSerif={fontSerif}
              readScope={readScope}
              activeSegmentIdx={activeSegmentIdx}
              formatLabel={FORMAT_LABELS[doc.format]}
              bilingualMode={bookStyle === "hardcover" && viewLang !== "original" && bilingualSplit}
              translatedPages={viewLang !== "original" ? translatedPages : undefined}
              translationBadge={
                viewLang !== "original"
                  ? formatSpeechLanguageDisplay(viewLang, "badge")
                  : undefined
              }
              isTranslating={isTranslating}
              isBookmarked={isCurrentPageBookmarked}
              onToggleBookmark={toggleBookmark}
              onPageChange={goToPage}
              onClose={closeDocument}
            />
          </>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-primary/70 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-foreground">No book currently open</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Choose any file above (PDF, Word, Excel, e-Book, Text, or Image) or pick a Starter Book to start reading and flipping pages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KindleReader;