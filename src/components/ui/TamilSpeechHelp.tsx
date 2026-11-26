import { useState } from "react";
import { AlertTriangle, Settings, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const instructions = {
  Windows: "Open Settings → Time & language → Language & region → Add a language → Tamil. Open its Language options and download Text-to-speech if offered. Restart your browser afterward. Availability depends on your Windows version and speech provider.",
  Android: "Open Settings and search for Text-to-speech output. Select Speech Services by Google → engine settings → Install voice data → Tamil (India), if available. Download the voice, then reopen your browser.",
  "iPhone / iPad": "Open Settings → Accessibility → Spoken Content (or Read & Speak) → Voices. Download a Tamil voice if listed, then reopen Safari. Not every system voice is available to browser speech.",
  Mac: "Open System Settings → Accessibility → Spoken Content (or Read & Speak) → System voice → Manage Voices. Download Tamil if listed, then restart your browser. Availability varies by macOS version.",
};

function detectedDevice(): keyof typeof instructions {
  const agent = navigator.userAgent;
  if (/Android/i.test(agent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(agent) || (/Mac/i.test(agent) && navigator.maxTouchPoints > 1)) return "iPhone / iPad";
  if (/Mac/i.test(agent)) return "Mac";
  return "Windows";
}

export default function TamilSpeechHelp({ onRetry }: { onRetry: () => void }) {
  const [showHelp, setShowHelp] = useState(false);
  const [device, setDevice] = useState<keyof typeof instructions>(detectedDevice);
  const [audioError, setAudioError] = useState("");

  const explain = () => {
    const synth = window.speechSynthesis;
    const voice = synth.getVoices().find((v) => /^en(?:[-_]|$)/i.test(v.lang));
    if (!voice) {
      setAudioError("No English explanation voice is available either. Please use the written setup instructions.");
      return;
    }
    synth.cancel();
    const prompt = new SpeechSynthesisUtterance("A Tamil reading voice is not available on this device. Select Tamil speech setup for installation instructions, then select Check again after enabling the voice.");
    prompt.voice = voice;
    prompt.lang = voice.lang.replace(/_/g, "-");
    prompt.onerror = () => setAudioError("The spoken explanation could not play. Please use the written setup instructions.");
    setAudioError("");
    synth.speak(prompt);
  };

  return (
    <div role="alert" className="rounded-md border border-accent/40 bg-accent/10 p-3 text-foreground space-y-3">
      <p className="flex items-start gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />Tamil voice unavailable on this device. Enable or install a Tamil speech voice to listen.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowHelp(!showHelp)} aria-expanded={showHelp}><Settings className="h-4 w-4 mr-2" />Tamil speech setup</Button>
        <Button size="sm" variant="outline" onClick={explain}><Volume2 className="h-4 w-4 mr-2" />Hear help in English</Button>
        <Button size="sm" variant="outline" onClick={onRetry}><RefreshCw className="h-4 w-4 mr-2" />Check again</Button>
      </div>
      {showHelp && <div className="space-y-2 text-sm">
        <label className="flex flex-wrap items-center gap-2">Your device
          <select aria-label="Tamil speech setup device" className="rounded-md border border-input bg-background text-foreground p-2" value={device} onChange={(event) => setDevice(event.target.value as keyof typeof instructions)}>
            {Object.keys(instructions).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <p>{instructions[device]}</p>
        <p className="text-muted-foreground">The website cannot install voices or open system settings automatically. If Tamil is not offered, try another supported device or browser; changing browsers alone does not guarantee a Tamil voice.</p>
      </div>}
      {audioError && <p className="text-sm">{audioError}</p>}
    </div>
  );
}