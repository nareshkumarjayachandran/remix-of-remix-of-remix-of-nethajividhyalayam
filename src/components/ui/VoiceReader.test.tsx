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