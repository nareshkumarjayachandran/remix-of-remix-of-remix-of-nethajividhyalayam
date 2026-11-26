import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import TamilSpeechHelp from "@/components/ui/TamilSpeechHelp";
import { Volume2, Pause, Play, Square, ChevronDown, ChevronUp } from "lucide-react";
import {
  formatSpeechLanguageDisplay,
  isSpeechSilent,
  rankVoicesForReader,
  sanitizeForSpeech,
  SPEECH_LANGUAGE_META,
  splitForStoryteller,
  STORYTELLER_CONFIG,
  type SpeechLanguage,
  type VoicePresetMode,
} from "@/lib/speechText";

const PREFS_STORAGE_KEY = "nv-voice-reader-prefs";

function loadSavedPrefs(): { mode: VoicePresetMode; voiceURI: string } {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { mode: "standard", voiceURI: "" };
    const parsed = JSON.parse(raw) as Partial<{ mode: VoicePresetMode; voiceURI: string }>;
    return {
      mode: parsed.mode === "storyteller" ? "storyteller" : "standard",
      voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : "",
    };
  } catch {
    return { mode: "standard", voiceURI: "" };
  }
}

interface VoiceReaderProps {
  /** Flat text segments to read — caller extracts from their data model */
  getTextSegments: (
    includeAnswers: boolean,
    language?: SpeechLanguage,
  ) => string[] | Promise<string[]>;
  /** Label shown on the toggle */
  label?: string;
  /** Whether to show the "Include Answers" switch (for worksheets/question papers) */
  showAnswersToggle?: boolean;
  /** Optional list of reading languages (e.g. English, Tamil, Hindi on blogs) */
  availableLanguages?: SpeechLanguage[];
  /** Optional controlled reading language (synced with parent view) */
  selectedLanguage?: SpeechLanguage;
  /** Optional callback fired when user selects a language */
  onLanguageChange?: (language: SpeechLanguage) => void;
  /** Align toggle and panel to the left or right edge, or stretch full width */
  align?: "left" | "right" | "full";
  /** Optional helper text shown on the full-width toggle bar when collapsed */
  hintText?: string;
  /** Start with the controls panel expanded */
  defaultExpanded?: boolean;
  /** Optional callback notified whenever the spoken segment index changes */
  onSegmentChange?: (segmentIndex: number, isSpeaking: boolean) => void;
  className?: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({
  getTextSegments,
  label = "🔊 Voice Reader",
  showAnswersToggle = true,
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
  align = "left",
  hintText = "Tap to listen in English, Tamil or Hindi",
  defaultExpanded = false,
  onSegmentChange,
  className = "",
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [internalLanguage, setInternalLanguage] = useState<SpeechLanguage>(selectedLanguage ?? "en");
  const language = selectedLanguage ?? internalLanguage;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [mode, setMode] = useState<VoicePresetMode>(() => loadSavedPrefs().mode);
  const [speed, setSpeed] = useState(() =>
    loadSavedPrefs().mode === "storyteller" ? STORYTELLER_CONFIG.defaultSpeed : 1,
  );
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesChecked, setVoicesChecked] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => loadSavedPrefs().voiceURI);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentsRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const stoppedRef = useRef(false);
  const pauseTimerRef = useRef<number | null>(null);

  const hasLanguageSelector = Boolean(availableLanguages && availableLanguages.length > 1);
  const useLanguageDropdown = Boolean(availableLanguages && availableLanguages.length > 6);
  const voices = React.useMemo(
    () => rankVoicesForReader(allVoices, hasLanguageSelector ? language : undefined),
    [allVoices, hasLanguageSelector, language],
  );
  const tamilUnavailable = language === "ta" && (voicesChecked && voices.length === 0 || Boolean(speechError));
  const refreshVoices = useCallback(() => {
    setAllVoices(window.speechSynthesis.getVoices());
    setVoicesChecked(true);
    setSpeechError("");
  }, []);

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  // Load available browser voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0) {
        setAllVoices(loaded);
      }
    };
    updateVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", updateVoices);
    const retryTimer = window.setTimeout(updateVoices, 300);
    const settledTimer = window.setTimeout(() => setVoicesChecked(true), 1200);
    return () => {
      window.clearTimeout(retryTimer);
      window.clearTimeout(settledTimer);
      window.speechSynthesis.removeEventListener?.("voiceschanged", updateVoices);
    };
  }, []);

  // Persist voice & mode preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ mode, voiceURI: selectedVoiceURI }),
      );
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [mode, selectedVoiceURI]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPauseTimer();
      window.speechSynthesis.cancel();
    };
  }, [clearPauseTimer]);

  const resolveSelectedVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    if (selectedVoiceURI) {
      const match = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (match) return match;
    }
    return voices[0] ?? null;
  }, [voices, selectedVoiceURI]);

  const speakSegment = useCallback((segments: string[], idx: number) => {
    if (idx >= segments.length || stoppedRef.current) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIdx(0);
      setCurrentText("");
      onSegmentChange?.(-1, false);
      return;
    }

    // Blank lines such as `________` must be read as one "dash", not
    // "underscore, underscore, …" — and blank-only segments are skipped.
    const text = sanitizeForSpeech(segments[idx]);
    if (isSpeechSilent(text)) {
      idxRef.current = idx + 1;
      setCurrentIdx(idx + 1);
      speakSegment(segments, idx + 1);
      return;
    }

    setCurrentText(text);
    onSegmentChange?.(idx, true);
    const phrases = mode === "storyteller" ? splitForStoryteller(text) : [text];
    const chosenVoice = resolveSelectedVoice();

    const speakPhrase = (phraseIdx: number) => {
      if (stoppedRef.current) return;
      if (phraseIdx >= phrases.length) {
        const advance = () => {
          if (stoppedRef.current) return;
          idxRef.current = idx + 1;
          setCurrentIdx(idx + 1);
          speakSegment(segments, idx + 1);
        };
        if (mode === "storyteller" && idx + 1 < segments.length) {
          pauseTimerRef.current = window.setTimeout(advance, STORYTELLER_CONFIG.segmentPauseMs);
        } else {
          advance();
        }
        return;
      }

      const utt = new SpeechSynthesisUtterance(phrases[phraseIdx]);
      utt.rate = speed;
      utt.pitch = mode === "storyteller" ? STORYTELLER_CONFIG.pitch : 1;
      if (chosenVoice) {
        utt.voice = chosenVoice;
        utt.lang = chosenVoice.lang.replace(/_/g, "-");
      } else {
        utt.lang = SPEECH_LANGUAGE_META[language].bcp47;
      }

      const handleNextPhrase = () => {
        if (stoppedRef.current) return;
        if (mode === "storyteller" && phraseIdx + 1 < phrases.length) {
          pauseTimerRef.current = window.setTimeout(
            () => speakPhrase(phraseIdx + 1),
            STORYTELLER_CONFIG.phrasePauseMs,
          );
        } else {
          speakPhrase(phraseIdx + 1);
        }
      };

      utt.onend = handleNextPhrase;
      utt.onerror = (event) => {
        if (stoppedRef.current) return;
        const errCode = event?.error;
        if (errCode === "canceled" || errCode === "interrupted") return;
        if (
          errCode === "language-unavailable" ||
          errCode === "voice-unavailable" ||
          errCode === "synthesis-unavailable" ||
          errCode === "synthesis-failed"
        ) {
          stoppedRef.current = true;
          clearPauseTimer();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentIdx(0);
          setCurrentText("");
          onSegmentChange?.(-1, false);
          const meta = SPEECH_LANGUAGE_META[language];
          setSpeechError(
            `Your device does not have a ${meta.label} (${meta.bcp47}) voice installed. On Windows, open Settings → Time & Language → Speech / Language & Region and install "${meta.label} (India)" with Text-to-Speech, or try Microsoft Edge / an Android phone.`,
          );
          return;
        }
        handleNextPhrase();
      };
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    };

    speakPhrase(0);
  }, [speed, mode, language, resolveSelectedVoice, onSegmentChange, clearPauseTimer]);

  const handlePlay = useCallback(async () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    clearPauseTimer();
    window.speechSynthesis.cancel();
    stoppedRef.current = false;

    setPrepareError("");
    setSpeechError("");
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Voice reading is not supported in this browser.");
      return;
    }
    // Refresh voices right before playing in case the browser loaded them lazily
    const freshVoices = window.speechSynthesis.getVoices();
    if (language === "ta" && rankVoicesForReader(freshVoices, "ta").length === 0) {
      setAllVoices(freshVoices);
      setVoicesChecked(true);
      return;
    }
    if (freshVoices.length > 0 && allVoices.length === 0) {
      setAllVoices(freshVoices);
    }
    let segments: string[];
    try {
      const result = getTextSegments(includeAnswers, language);
      if (result instanceof Promise) {
        setIsPreparing(true);
        segments = await result;
      } else {
        segments = result;
      }
    } catch (err) {
      setPrepareError(err instanceof Error ? err.message : "Could not prepare the reading.");
      setIsPreparing(false);
      return;
    }
    setIsPreparing(false);
    if (stoppedRef.current) return;
    segmentsRef.current = segments;
    setTotalSegments(segments.length);
    setCurrentIdx(0);
    idxRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);

    speakSegment(segments, 0);
  }, [isPaused, clearPauseTimer, getTextSegments, includeAnswers, language, speakSegment, allVoices.length]);

  const handlePause = useCallback(() => {
    clearPauseTimer();
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, [clearPauseTimer]);

  const handleStop = useCallback(() => {
    stoppedRef.current = true;
    clearPauseTimer();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIdx(0);
    setCurrentText("");
    idxRef.current = 0;
    onSegmentChange?.(-1, false);
  }, [clearPauseTimer, onSegmentChange]);

  const handleLanguageChange = (nextLang: SpeechLanguage) => {
    setInternalLanguage(nextLang);
    onLanguageChange?.(nextLang);
    setSelectedVoiceURI("");
    setSpeechError("");
    if (isPlaying || isPaused) handleStop();
  };

  const handleModeChange = (nextMode: VoicePresetMode) => {
    setMode(nextMode);
    setSpeed(nextMode === "storyteller" ? STORYTELLER_CONFIG.defaultSpeed : 1);
    if (isPlaying || isPaused) handleStop();
  };

  const progress = totalSegments > 0 ? Math.round((currentIdx / totalSegments) * 100) : 0;

  const full = align === "full";
  const groupClass = `rounded-xl border border-violet-100 bg-white/70 p-3 space-y-2 ${
    full ? "h-full" : ""
  }`;

  return (
    <div
      className={`no-print ${
        align === "right"
          ? "flex flex-col items-end"
          : full
            ? "flex flex-col w-full"
            : ""
      } ${className}`}
    >
      {/* Toggle button */}
      <Button
        variant="outline"
        onClick={() => setExpanded(!expanded)}
        className={`gap-2 border-gray-300 ${
          align === "full" ? "w-full justify-between px-4 h-11 bg-white text-gray-800 hover:bg-violet-50 hover:text-gray-900" : ""
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          {label}
        </span>
        {align === "full" && (
          <span className="hidden sm:inline text-xs font-medium text-gray-500">
            {expanded ? "Hide controls" : hintText}
          </span>
        )}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {/* Expanded panel */}
      {expanded && (
        <div
          className={`font-multilingual-sans mt-3 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl shadow-sm ${
            align === "right"
              ? "w-full sm:w-80 text-left space-y-3"
              : full
                ? "w-full text-left space-y-3"
                : "space-y-3"
          }`}
        >
          <div
            className={
              full
                ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-stretch"
                : "space-y-3"
            }
          >
          {/* Language Selector */}
          {hasLanguageSelector && availableLanguages && (
            <div className={groupClass}>
              <label
                htmlFor={useLanguageDropdown ? "voice-reader-lang-select" : undefined}
                className="block text-sm font-semibold text-gray-700"
              >
                🌐 Language
              </label>
              {useLanguageDropdown ? (
                <select
                  id="voice-reader-lang-select"
                  aria-label="Reading language"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as SpeechLanguage)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-violet-400 focus:outline-none"
                >
                  <optgroup label="Indian Languages">
                    {availableLanguages
                      .filter((code) => SPEECH_LANGUAGE_META[code].group === "indian")
                      .map((code) => (
                        <option key={code} value={code}>
                          {formatSpeechLanguageDisplay(code, "option")}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="World Foreign Languages">
                    {availableLanguages
                      .filter((code) => SPEECH_LANGUAGE_META[code].group === "foreign")
                      .map((code) => (
                        <option key={code} value={code}>
                          {formatSpeechLanguageDisplay(code, "option")}
                        </option>
                      ))}
                  </optgroup>
                </select>
              ) : (
                <div className="flex flex-wrap gap-1" role="group" aria-label="Reading language">
                  {availableLanguages.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLanguageChange(code)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                        language === code
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-violet-300"
                      }`}
                    >
                      {SPEECH_LANGUAGE_META[code].nativeLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reading Style: Standard vs Storyteller */}
          <div className={groupClass}>
            <span className="block text-sm font-semibold text-gray-700">🎭 Style</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Reading style">
              <button
                type="button"
                onClick={() => handleModeChange("standard")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  mode === "standard"
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-violet-300"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("storyteller")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  mode === "storyteller"
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-violet-300"
                }`}
              >
                ✨ Storyteller
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className={`${groupClass} space-y-1`}>
            <label htmlFor="voice-reader-select" className="block text-sm font-semibold text-gray-700">
              🗣️ Voice
            </label>
            <select
              id="voice-reader-select"
              value={voices.some((v) => v.voiceURI === selectedVoiceURI) ? selectedVoiceURI : ""}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                if (isPlaying || isPaused) handleStop();
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-violet-400 focus:outline-none"
            >
              <option value="">
                {voices.length > 0
                  ? `Auto — ${voices[0].name}`
                  : `Default ${SPEECH_LANGUAGE_META[language].label} Voice`}
              </option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            {hasLanguageSelector && language !== "en" && language !== "ta" && voices.length === 0 && (
              <p className="text-[11px] text-amber-700">
                No {SPEECH_LANGUAGE_META[language].label} voice found on this device. Install the {SPEECH_LANGUAGE_META[language].label} speech pack in device settings (or use Edge / Android) to hear {SPEECH_LANGUAGE_META[language].label}.
              </p>
            )}
          </div>

          {/* With/Without Answers toggle */}
          {showAnswersToggle && (
            <div className={groupClass}>
              <span className="block text-sm font-semibold text-gray-700">📝 Include Answers</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500">{includeAnswers ? "With Answers" : "Questions Only"}</span>
                <Switch
                  checked={includeAnswers}
                  onCheckedChange={(v) => {
                    setIncludeAnswers(v);
                    if (isPlaying || isPaused) handleStop();
                  }}
                />
              </div>
            </div>
          )}

          {/* Speed */}
          <div className={groupClass}>
            <span className="block text-sm font-semibold text-gray-700">🐢 Speed</span>
            <div className="flex flex-wrap gap-1.5">
              {[0.7, 0.85, 1, 1.2].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSpeed(s);
                    if (isPlaying || isPaused) handleStop();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    speed === s
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-violet-300"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          </div>

          {tamilUnavailable && <TamilSpeechHelp onRetry={refreshVoices} />}

          {/* Controls + Progress */}
          <div
            className={`flex flex-col gap-3 ${
              full ? "sm:flex-row sm:items-center" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <Button
                  size="sm"
                  onClick={() => void handlePlay()}
                  disabled={isPreparing}
                  className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Play className="h-4 w-4" />
                  {isPreparing ? "Translating…" : isPaused ? "Resume" : "Play"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePause}
                  variant="outline"
                  className="gap-1.5 border-violet-300 text-violet-700"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              {(isPlaying || isPaused) && (
                <Button
                  size="sm"
                  onClick={handleStop}
                  variant="outline"
                  className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>
            {prepareError && (
              <p role="alert" className="text-xs font-semibold text-red-600">{prepareError}</p>
            )}
            {speechError && language !== "ta" && (
              <p role="alert" className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {speechError}
              </p>
            )}

            {(isPlaying || isPaused) && totalSegments > 0 && (
              <div className={`space-y-2 ${full ? "flex-1" : ""}`}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Reading… {currentIdx}/{totalSegments}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {hasLanguageSelector && currentText && (
                  <p className="text-xs text-gray-700 bg-white/80 border border-violet-100 rounded-lg p-2 leading-relaxed">
                    {currentText}
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 italic">
            {mode === "storyteller"
              ? "Storyteller mode · Gentler pace, warmer tone & rhythmic pauses"
              : hasLanguageSelector && language !== "en"
                ? useLanguageDropdown
                  ? `Reading in ${SPEECH_LANGUAGE_META[language].label} (${SPEECH_LANGUAGE_META[language].bcp47}) · Uses device voice`
                  : `Pre-saved ${SPEECH_LANGUAGE_META[language].label} translation · Instant & offline`
                : "Uses browser voice · Free & unlimited · Works offline too"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceReader;
