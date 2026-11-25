import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Volume2, Pause, Play, Square, ChevronDown, ChevronUp } from "lucide-react";
import {
  isSpeechSilent,
  rankVoicesForReader,
  sanitizeForSpeech,
  splitForStoryteller,
  STORYTELLER_CONFIG,
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
  getTextSegments: (includeAnswers: boolean) => string[];
  /** Label shown on the toggle */
  label?: string;
  /** Whether to show the "Include Answers" switch (for worksheets/question papers) */
  showAnswersToggle?: boolean;
  /** Align toggle and panel to the left or right edge */
  align?: "left" | "right";
  className?: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({
  getTextSegments,
  label = "🔊 Voice Reader",
  showAnswersToggle = true,
  align = "left",
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [mode, setMode] = useState<VoicePresetMode>(() => loadSavedPrefs().mode);
  const [speed, setSpeed] = useState(() =>
    loadSavedPrefs().mode === "storyteller" ? STORYTELLER_CONFIG.defaultSpeed : 1,
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => loadSavedPrefs().voiceURI);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentsRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const stoppedRef = useRef(false);
  const pauseTimerRef = useRef<number | null>(null);

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
      const ranked = rankVoicesForReader(window.speechSynthesis.getVoices());
      setVoices(ranked);
    };
    updateVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", updateVoices);
    return () => {
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
        utt.lang = chosenVoice.lang;
      } else {
        utt.lang = "en-IN";
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
      utt.onerror = handleNextPhrase;
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    };

    speakPhrase(0);
  }, [speed, mode, resolveSelectedVoice]);

  const handlePlay = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    clearPauseTimer();
    window.speechSynthesis.cancel();
    stoppedRef.current = false;

    const segments = getTextSegments(includeAnswers);
    segmentsRef.current = segments;
    setTotalSegments(segments.length);
    setCurrentIdx(0);
    idxRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);

    speakSegment(segments, 0);
  }, [isPaused, clearPauseTimer, getTextSegments, includeAnswers, speakSegment]);

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
    idxRef.current = 0;
  }, [clearPauseTimer]);

  const handleModeChange = (nextMode: VoicePresetMode) => {
    setMode(nextMode);
    setSpeed(nextMode === "storyteller" ? STORYTELLER_CONFIG.defaultSpeed : 1);
    if (isPlaying || isPaused) handleStop();
  };

  const progress = totalSegments > 0 ? Math.round((currentIdx / totalSegments) * 100) : 0;

  return (
    <div className={`no-print ${align === "right" ? "flex flex-col items-end" : ""} ${className}`}>
      {/* Toggle button */}
      <Button
        variant="outline"
        onClick={() => setExpanded(!expanded)}
        className="gap-2 border-gray-300"
      >
        <Volume2 className="h-4 w-4" />
        {label}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {/* Expanded panel */}
      {expanded && (
        <div className={`mt-3 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl shadow-sm space-y-3 ${align === "right" ? "w-full sm:w-80 text-left" : ""}`}>
          {/* Reading Style: Standard vs Storyteller */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-700">🎭 Style</span>
            <div className="flex gap-1.5" role="group" aria-label="Reading style">
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
          <div className="space-y-1">
            <label htmlFor="voice-reader-select" className="block text-sm font-semibold text-gray-700">
              🗣️ Voice
            </label>
            <select
              id="voice-reader-select"
              value={selectedVoiceURI}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                if (isPlaying || isPaused) handleStop();
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-violet-400 focus:outline-none"
            >
              <option value="">
                {voices.length > 0 ? `Auto — ${voices[0].name}` : "Default Browser Voice"}
              </option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* With/Without Answers toggle */}
          {showAnswersToggle && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">📝 Include Answers</span>
              <div className="flex items-center gap-2">
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
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">🐢 Speed</span>
            <div className="flex gap-1.5">
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

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <Button
                size="sm"
                onClick={handlePlay}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Play className="h-4 w-4" />
                {isPaused ? "Resume" : "Play"}
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

          {/* Progress */}
          {(isPlaying || isPaused) && totalSegments > 0 && (
            <div>
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
            </div>
          )}

          <p className="text-xs text-gray-400 italic">
            {mode === "storyteller"
              ? "Storyteller mode · Gentler pace, warmer tone & rhythmic pauses"
              : "Uses browser voice · Free & unlimited · Works offline too"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceReader;
