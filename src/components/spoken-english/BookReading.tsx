import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft, Volume2, Play, ChevronRight, ChevronLeft, Globe,
  BookOpen, Mic, MicOff, RotateCcw, Star, Check, X as XIcon,
  Sparkles, Loader2, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BOOK_READING_DATA, BOOK_GRADES, getTypeLabel, getTypeColor,
  type ChapterContent, type CurriculumData,
} from "@/data/bookReadingData";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Props {
  grade: string;
  voiceKey: string;
  onBack: () => void;
  currentVoiceEmoji?: string;
  currentVoiceLabel?: string;
  onVoicePickerOpen?: () => void;
}

type BookScreen = "browse" | "reading";

const GRADE_SPEED: Record<string, number> = {
  "Pre-KG": 0.70, LKG: 0.72, UKG: 0.75, "1st": 0.78, "2nd": 0.80,
  "3rd": 0.83, "4th": 0.86, "5th": 0.88,
};

function browserTts(text: string, speed = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speed;
    utter.pitch = 1.0;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

function tamilTts(text: string, speed = 0.8): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ta-IN";
    utter.rate = speed;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

export default function BookReading({ grade, voiceKey, onBack, currentVoiceEmoji, currentVoiceLabel, onVoicePickerOpen }: Props) {
  const [bookScreen, setBookScreen] = useState<BookScreen>("browse");
  const [curriculum, setCurriculum] = useState<"samacheer" | "oxford">("samacheer");
  const [selectedGrade, setSelectedGrade] = useState(grade);
  const [selectedTerm, setSelectedTerm] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<ChapterContent | null>(null);
  const [chapterSentences, setChapterSentences] = useState<string[]>([]);
  const [chapterTamil, setChapterTamil] = useState<string[]>([]);
  const [chapterVocab, setChapterVocab] = useState<{ word: string; tamil: string; meaning: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showTamil, setShowTamil] = useState(true);
  const [showVocab, setShowVocab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tappedWord, setTappedWord] = useState<{ word: string; tamil: string; meaning: string } | null>(null);
  // Recording practice
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{ spoken: string; accuracy: number } | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const autoPlayRef = useRef(false);

  const currData = BOOK_READING_DATA[curriculum];
  const gradeData = currData?.grades[selectedGrade];
  const terms = gradeData?.terms || [];
  const chapters = terms[selectedTerm]?.chapters || [];
  const speed = GRADE_SPEED[selectedGrade] ?? 0.85;

  const stopAudio = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
  }, []);

  const loadChapter = useCallback(async (chapter: ChapterContent) => {
    setSelectedChapter(chapter);
    setCurrentLine(0);
    setPracticeResult(null);
    setTappedWord(null);

    if (chapter.sentences && chapter.sentences.length > 0) {
      setChapterSentences(chapter.sentences);
      setChapterTamil(chapter.tamilTranslations || []);
      setChapterVocab(chapter.vocabulary || []);
      setBookScreen("reading");
    } else {
      // Generate content with AI
      setIsLoading(true);
      setBookScreen("reading");
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/book-reading-ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            action: "generate_content",
            chapterTitle: chapter.title,
            chapterType: chapter.type,
            grade: selectedGrade,
            curriculum: currData.label,
          }),
        });
        if (!res.ok) throw new Error("Failed to generate content");
        const data = await res.json();
        setChapterSentences(data.sentences || []);
        setChapterTamil(data.tamilTranslations || []);
        setChapterVocab(data.vocabulary || []);
      } catch (e) {
        console.error("Failed to load chapter:", e);
        setChapterSentences(["Content could not be loaded. Please check your internet connection."]);
        setChapterTamil(["உள்ளடக்கத்தை ஏற்ற முடியவில்லை."]);
        setChapterVocab([]);
      }
      setIsLoading(false);
    }
  }, [selectedGrade, currData, SUPABASE_URL, SUPABASE_KEY]);

  // Speak current line
  const speakLine = useCallback(async (index: number) => {
    if (index >= chapterSentences.length) return;
    setIsPlaying(true);
    setCurrentLine(index);
    await browserTts(chapterSentences[index], speed);
    setIsPlaying(false);
  }, [chapterSentences, speed]);

  // Speak Tamil translation of current line
  const speakTamil = useCallback(async (index: number) => {
    if (index >= chapterTamil.length) return;
    setIsPlaying(true);
    await tamilTts(chapterTamil[index]);
    setIsPlaying(false);
  }, [chapterTamil]);

  // Auto-play all lines
  const autoPlayAll = useCallback(async () => {
    if (isAutoPlaying) {
      stopAudio();
      return;
    }
    setIsAutoPlaying(true);
    autoPlayRef.current = true;

    for (let i = currentLine; i < chapterSentences.length; i++) {
      if (!autoPlayRef.current) break;
      setCurrentLine(i);
      setIsPlaying(true);
      await browserTts(chapterSentences[i], speed);
      if (!autoPlayRef.current) break;
      // Small pause between sentences
      await new Promise(r => setTimeout(r, 400));
    }
    setIsPlaying(false);
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
  }, [isAutoPlaying, currentLine, chapterSentences, speed, stopAudio]);

  // Word tap handler
  const handleWordTap = useCallback((word: string) => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
    const found = chapterVocab.find(v => v.word.toLowerCase() === cleanWord);
    if (found) {
      setTappedWord(found);
    } else {
      setTappedWord({ word: cleanWord, tamil: "—", meaning: "Tap a highlighted word for its meaning" });
    }
  }, [chapterVocab]);

  // Recording for practice
  const startRecording = useCallback(async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) { alert("Speech recognition not supported. Use Chrome."); return; }
      stopAudio();
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.continuous = false;
      transcriptRef.current = "";
      recognition.onresult = (event: any) => {
        transcriptRef.current = event.results[0]?.[0]?.transcript || "";
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setPracticeResult(null);
    } catch { alert("Please allow microphone access."); }
  }, [stopAudio]);

  const stopRecording = useCallback(() => {
    return new Promise<string>((resolve) => {
      const rec = recognitionRef.current;
      if (!rec) { resolve(""); return; }
      rec.onend = () => resolve(transcriptRef.current);
      rec.stop();
      setIsRecording(false);
    });
  }, []);

  const handlePracticeToggle = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      const spoken = await stopRecording();
      // Simple accuracy check using Levenshtein-like comparison
      const target = chapterSentences[currentLine]?.toLowerCase().replace(/[^a-z\s]/g, "").trim() || "";
      const said = spoken.toLowerCase().replace(/[^a-z\s]/g, "").trim();
      const targetWords = target.split(/\s+/);
      const saidWords = said.split(/\s+/);
      let matches = 0;
      targetWords.forEach((w, i) => { if (saidWords[i] === w) matches++; });
      const accuracy = targetWords.length > 0 ? Math.round((matches / targetWords.length) * 100) : 0;
      setPracticeResult({ spoken, accuracy });
      setIsProcessing(false);
    } else {
      setPracticeResult(null);
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, chapterSentences, currentLine]);

  // Cleanup
  useEffect(() => {
    return () => { stopAudio(); };
  }, [stopAudio]);

  // ── Browse Screen ─────────────────────────────────────────────────────────
  if (bookScreen === "browse") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col overflow-x-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-5 text-white shadow-lg">
           <div className="flex items-center gap-2 max-w-md mx-auto">
            <button onClick={onBack} className="p-1 rounded-full bg-white/20 touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-extrabold text-xl">📖 Book Reading</p>
              <p className="text-amber-200 text-xs">Read • Listen • Learn with Tamil Help</p>
            </div>
            {onVoicePickerOpen && (
              <button onClick={onVoicePickerOpen} className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 hover:bg-white/30 transition-all">
                <span className="text-xs">{currentVoiceEmoji || "👩‍🏫"}</span>
                <span className="text-[10px] font-semibold">{currentVoiceLabel || "Voice"}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-4 overflow-y-auto">
          {/* Curriculum Tabs */}
          <div className="flex gap-2 justify-center">
            {(["samacheer", "oxford"] as const).map((c) => (
              <button
                key={c}
                onClick={() => { setCurriculum(c); setSelectedTerm(0); }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all",
                  curriculum === c
                    ? "bg-amber-600 border-amber-600 text-white shadow-md"
                    : "bg-white border-amber-200 text-amber-700 hover:border-amber-400"
                )}
              >
                {BOOK_READING_DATA[c].emoji} {BOOK_READING_DATA[c].label}
              </button>
            ))}
          </div>

          {/* Grade Selector */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2 text-center">👤 Select Grade</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {BOOK_GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGrade(g); setSelectedTerm(0); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                    selectedGrade === g
                      ? "bg-amber-600 border-amber-600 text-white scale-105 shadow-sm"
                      : "bg-white border-amber-200 text-amber-700 hover:border-amber-400"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Term Tabs */}
          {terms.length > 0 && (
            <div className="flex gap-2 justify-center">
              {terms.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTerm(i)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                    selectedTerm === i
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : "bg-white border-orange-200 text-orange-700 hover:border-orange-400"
                  )}
                >
                  📅 {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Chapter List */}
          {chapters.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-600 text-center">
                📚 {terms[selectedTerm]?.label} — {chapters.length} Chapter{chapters.length > 1 ? "s" : ""}
              </p>
              {chapters.map((ch, i) => {
                const hasContent = ch.sentences && ch.sentences.length > 0;
                return (
                  <button
                    key={i}
                    onClick={() => loadChapter(ch)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-amber-100 hover:border-amber-300 transition-all text-left flex items-center gap-3 active:scale-[0.98]"
                  >
                    <span className="text-3xl">{ch.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{ch.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {getTypeLabel(ch.type)}
                        </span>
                        {hasContent ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            ✅ Ready
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            ✨ AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-amber-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 text-sm">No chapters available for this grade/term yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Reading Screen ────────────────────────────────────────────────────────
  const vocabWords = new Set(chapterVocab.map(v => v.word.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className={cn("bg-gradient-to-r px-4 py-4 text-white shadow-lg", `bg-gradient-to-r ${getTypeColor(selectedChapter?.type || "lesson")}`)}>
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={() => { stopAudio(); setBookScreen("browse"); }} className="p-1 rounded-full bg-white/20 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center min-w-0">
            <p className="font-extrabold text-base truncate">{selectedChapter?.emoji} {selectedChapter?.title}</p>
            <p className="text-xs text-white/80">{selectedGrade} • {getTypeLabel(selectedChapter?.type || "lesson")}</p>
          </div>
          {onVoicePickerOpen && (
            <button onClick={onVoicePickerOpen} className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 hover:bg-white/30 transition-all">
              <span className="text-xs">{currentVoiceEmoji || "👩‍🏫"}</span>
              <span className="text-[10px] font-semibold">{currentVoiceLabel || "Voice"}</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">✨ Generating lesson content...</p>
          <p className="text-xs text-gray-400">Tamil translations included</p>
        </div>
      ) : (
        <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-3 overflow-y-auto">
          {/* Controls Bar */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              size="sm" variant="outline"
              onClick={autoPlayAll}
              disabled={isRecording}
              className={cn("gap-1 text-xs", isAutoPlaying ? "bg-red-50 border-red-300 text-red-700" : "border-amber-300 text-amber-700")}
            >
              {isAutoPlaying ? <><XIcon className="h-3 w-3" /> Stop</> : <><Play className="h-3 w-3" /> Read Aloud</>}
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => setShowTamil(!showTamil)}
              className={cn("gap-1 text-xs", showTamil ? "bg-green-50 border-green-300 text-green-700" : "border-gray-300 text-gray-600")}
            >
              <Globe className="h-3 w-3" /> {showTamil ? "Tamil ✓" : "Tamil"}
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => setShowVocab(!showVocab)}
              className={cn("gap-1 text-xs", showVocab ? "bg-purple-50 border-purple-300 text-purple-700" : "border-gray-300 text-gray-600")}
            >
              <BookOpen className="h-3 w-3" /> Words
            </Button>
          </div>

          {/* Vocabulary Panel */}
          {showVocab && chapterVocab.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 animate-fade-in">
              <p className="text-xs font-bold text-purple-600 mb-2">📝 Key Words</p>
              <div className="space-y-2">
                {chapterVocab.map((v, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-bold shrink-0">{v.word}</span>
                    <div>
                      <span className="text-xs text-purple-700 font-medium" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{v.tamil}</span>
                      <span className="text-xs text-gray-500 ml-1">— {v.meaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tapped Word Tooltip */}
          {tappedWord && (
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 animate-fade-in flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-800 text-sm">{tappedWord.word}</span>
                <span className="text-sm text-amber-600 ml-2" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{tappedWord.tamil}</span>
                {tappedWord.meaning !== "Tap a highlighted word for its meaning" && (
                  <p className="text-xs text-gray-500 mt-0.5">{tappedWord.meaning}</p>
                )}
              </div>
              <button onClick={() => setTappedWord(null)} className="text-amber-400 hover:text-amber-600">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Sentences */}
          <div className="space-y-2">
            {chapterSentences.map((sentence, i) => {
              const isActive = i === currentLine;
              return (
                <div
                  key={i}
                  className={cn(
                    "bg-white rounded-2xl p-4 border-2 transition-all duration-300",
                    isActive
                      ? "border-amber-400 shadow-lg shadow-amber-100 scale-[1.01]"
                      : "border-gray-100 hover:border-amber-200"
                  )}
                  onClick={() => setCurrentLine(i)}
                >
                  {/* English sentence with tappable words */}
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] bg-amber-100 text-amber-600 rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-base text-gray-800 leading-relaxed font-medium flex-1">
                      {sentence.split(/(\s+)/).map((part, pi) => {
                        const cleanWord = part.replace(/[.,!?;:'"]/g, "").toLowerCase();
                        const isVocab = vocabWords.has(cleanWord);
                        if (isVocab) {
                          return (
                            <span
                              key={pi}
                              onClick={(e) => { e.stopPropagation(); handleWordTap(part); }}
                              className="bg-amber-100 text-amber-800 rounded px-0.5 cursor-pointer hover:bg-amber-200 underline decoration-dotted decoration-amber-400 font-bold"
                            >
                              {part}
                            </span>
                          );
                        }
                        return <span key={pi}>{part}</span>;
                      })}
                    </p>
                  </div>

                  {/* Tamil translation */}
                  {showTamil && chapterTamil[i] && (
                    <div className="mt-2 ml-7 flex items-start gap-1">
                      <Globe className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700 leading-relaxed" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                        {chapterTamil[i]}
                      </p>
                    </div>
                  )}

                  {/* Action buttons for active line */}
                  {isActive && (
                    <div className="mt-3 ml-7 flex gap-2 flex-wrap">
                      <Button
                        size="sm" variant="outline"
                        onClick={(e) => { e.stopPropagation(); speakLine(i); }}
                        disabled={isPlaying || isRecording}
                        className="gap-1 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 h-7"
                      >
                        <Volume2 className="h-3 w-3" /> {isPlaying ? "Playing…" : "Listen"}
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        onClick={(e) => { e.stopPropagation(); browserTts(chapterSentences[i], Math.max(0.6, speed - 0.12)); }}
                        disabled={isPlaying || isRecording}
                        className="gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 h-7"
                      >
                        <Play className="h-3 w-3" /> Slow
                      </Button>
                      {showTamil && chapterTamil[i] && (
                        <Button
                          size="sm" variant="outline"
                          onClick={(e) => { e.stopPropagation(); speakTamil(i); }}
                          disabled={isPlaying || isRecording}
                          className="gap-1 text-xs border-green-200 text-green-700 hover:bg-green-50 h-7"
                        >
                          <Globe className="h-3 w-3" /> Tamil 🔊
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Practice Section */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-green-100">
            <p className="text-sm font-bold text-gray-700 text-center mb-3">
              🎤 Your Turn — Read Line {currentLine + 1} Aloud
            </p>
            <p className="text-center text-sm text-gray-500 mb-3 italic">
              "{chapterSentences[currentLine] || ""}"
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handlePracticeToggle}
                disabled={isProcessing || isPlaying}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isRecording
                    ? "bg-red-500 scale-110 shadow-red-200"
                    : "bg-gradient-to-br from-green-400 to-emerald-600 hover:scale-105 active:scale-95"
                )}
              >
                {isRecording ? (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                    <MicOff className="h-8 w-8 text-white relative z-10" />
                  </>
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </button>
              <p className="text-xs text-gray-500 font-medium">
                {isProcessing ? "⏳ Checking..." : isRecording ? "🔴 Recording... tap to stop" : "Tap to read aloud"}
              </p>
            </div>

            {/* Practice Result */}
            {practiceResult && (
              <div className="mt-4 space-y-2 animate-fade-in">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-blue-400 font-medium">You said:</p>
                  <p className="text-sm text-gray-700 italic">"{practiceResult.spoken}"</p>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        practiceResult.accuracy >= 80 ? "bg-green-400" :
                        practiceResult.accuracy >= 50 ? "bg-yellow-400" : "bg-red-400"
                      )}
                      style={{ width: `${practiceResult.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{practiceResult.accuracy}%</span>
                </div>
                <p className="text-center text-sm font-bold">
                  {practiceResult.accuracy >= 80
                    ? "🏆 Excellent! Great reading!"
                    : practiceResult.accuracy >= 50
                    ? "👍 Good try! Listen again and retry."
                    : "💪 Keep trying! Practice makes perfect."}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => setPracticeResult(null)}
                    className="flex-1 gap-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" /> Retry
                  </Button>
                  {currentLine < chapterSentences.length - 1 && (
                    <Button
                      size="sm"
                      onClick={() => { setCurrentLine(c => c + 1); setPracticeResult(null); }}
                      className="flex-1 gap-1 text-xs bg-green-500 hover:bg-green-600 text-white"
                    >
                      Next Line <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 pb-4">
            <Button
              size="sm" variant="outline"
              onClick={() => setCurrentLine(Math.max(0, currentLine - 1))}
              disabled={currentLine === 0}
              className="flex-1 gap-1 text-xs"
            >
              <ChevronLeft className="h-3 w-3" /> Previous
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => setCurrentLine(Math.min(chapterSentences.length - 1, currentLine + 1))}
              disabled={currentLine >= chapterSentences.length - 1}
              className="flex-1 gap-1 text-xs"
            >
              Next <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 justify-center flex-wrap pb-4">
            {chapterSentences.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentLine(i)}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  i === currentLine ? "bg-amber-500 w-4" :
                  i < currentLine ? "bg-amber-300 w-2" : "bg-gray-200 w-2"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
