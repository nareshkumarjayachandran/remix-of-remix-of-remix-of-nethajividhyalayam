import { fireEvent, render, screen, act, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VoiceReader from "./VoiceReader";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("Tamil speech fallback", () => {
  it("does not silently attempt Tamil playback without a Tamil voice and lets users recheck after installation", () => {
    vi.useFakeTimers();
    let voices: SpeechSynthesisVoice[] = [];
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { getVoices: () => voices, speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const getTextSegments = vi.fn(() => ["தமிழ்"]);
    render(<VoiceReader selectedLanguage="ta" availableLanguages={["en", "ta"]} getTextSegments={getTextSegments} defaultExpanded />);
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(speak).not.toHaveBeenCalled();
    expect(getTextSegments).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Tamil speech setup" }));
    expect(screen.getByRole("combobox", { name: "Tamil speech setup device" })).toBeInTheDocument();
    voices = [{ name: "Tamil", lang: "ta_IN", voiceURI: "tamil" } as SpeechSynthesisVoice];
    fireEvent.click(screen.getByRole("button", { name: "Check again" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("speech highlight synchronization", () => {
  it("highlights at actual speech start, clears at end, and preserves indices past silent segments", () => {
    const utterances: SpeechSynthesisUtterance[] = [];
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [], cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(),
      speak: (utterance: SpeechSynthesisUtterance) => utterances.push(utterance),
    });
    const onSegmentChange = vi.fn();
    render(<VoiceReader getTextSegments={() => ["First paragraph", "---", "Current paragraph"]} onSegmentChange={onSegmentChange} defaultExpanded />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(onSegmentChange).not.toHaveBeenCalledWith(0, true);
    const first = utterances[0];
    if (!first) throw new Error("Speech did not start");
    act(() => first.onstart?.({} as SpeechSynthesisEvent));
    expect(onSegmentChange).toHaveBeenLastCalledWith(0, true);
    act(() => first.onend?.({} as SpeechSynthesisEvent));
    expect(onSegmentChange).toHaveBeenLastCalledWith(-1, false);
    const next = utterances[1];
    if (!next) throw new Error("Next paragraph not queued");
    expect(next.text).toBe("Current paragraph");
    act(() => next.onstart?.({} as SpeechSynthesisEvent));
    expect(onSegmentChange).toHaveBeenLastCalledWith(2, true);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onSegmentChange).toHaveBeenLastCalledWith(-1, false);
  });
});