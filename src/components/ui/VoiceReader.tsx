import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX, Pause, Play, Square, ChevronDown, ChevronUp } from "lucide-react";

interface VoiceReaderProps {
  /** Flat text segments to read — caller extracts from their data model */
  getTextSegments: (includeAnswers: boolean) => string[];
  /** Label shown on the toggle */
  label?: string;
  className?: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ getTextSegments, label = "🔊 Voice Reader", className = "" }) => {
  const [expanded, setExpanded] = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentsRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const stoppedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakSegment = useCallback((segments: string[], idx: number) => {
    if (idx >= segments.length || stoppedRef.current) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIdx(0);
      return;
    }

    const text = segments[idx];
    if (!text?.trim()) {
      idxRef.current = idx + 1;
      setCurrentIdx(idx + 1);
      speakSegment(segments, idx + 1);
      return;
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speed;
    utt.lang = "en-IN";
    utt.onend = () => {
      if (!stoppedRef.current) {
        idxRef.current = idx + 1;
        setCurrentIdx(idx + 1);
        speakSegment(segments, idx + 1);
      }
    };
    utt.onerror = () => {
      if (!stoppedRef.current) {
        idxRef.current = idx + 1;
        setCurrentIdx(idx + 1);
        speakSegment(segments, idx + 1);
      }
    };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [speed]);

  const handlePlay = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

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
  }, [isPaused, getTextSegments, includeAnswers, speakSegment]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIdx(0);
    idxRef.current = 0;
  }, []);

  const progress = totalSegments > 0 ? Math.round((currentIdx / totalSegments) * 100) : 0;

  return (
    <div className={`no-print ${className}`}>
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
        <div className="mt-3 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl shadow-sm space-y-3">
          {/* With/Without Answers toggle */}
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
            Uses browser voice · Free & unlimited · Works offline too
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceReader;
