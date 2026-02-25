import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice profiles mapped by id
const VOICES: Record<string, { id: string; label: string }> = {
  // Female voices (teacher-like / friendly)
  laura:    { id: "FGY2WhTYpPnrIDTdsKH5", label: "Laura – Clear & Friendly (Female)" },
  jessica:  { id: "cgSgspJ2msm6clMCkdW9", label: "Jessica – Warm & Encouraging (Female)" },
  alice:    { id: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice – Bright & Clear (Female)" },
  matilda:  { id: "XrExE9yKIg1WjnnlVkGX", label: "Matilda – Gentle & Kind (Female)" },
  // Male voices
  liam:     { id: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam – Friendly Teacher (Male)" },
  charlie:  { id: "IKne3meq5aSn9XLyUdCD", label: "Charlie – Calm & Clear (Male)" },
  george:   { id: "JBFqnCBsd6RMkjVDRZzb", label: "George – Warm & Trustworthy (Male)" },
  eric:     { id: "cjVigY5qzO86Huf0OWal", label: "Eric – Steady & Encouraging (Male)" },
};

// Grade → speed mapping: lower grades get slower speech
// ElevenLabs valid range: 0.7 – 1.2
function gradeToSpeed(grade: string, requestedSpeed?: number): number {
  const SPEED_MIN = 0.7;
  const SPEED_MAX = 1.2;
  const clamp = (v: number) => Math.min(SPEED_MAX, Math.max(SPEED_MIN, v));

  if (requestedSpeed !== undefined && requestedSpeed !== null) return clamp(requestedSpeed);
  const slowGrades: Record<string, number> = {
    LKG: 0.75, UKG: 0.78, "1st": 0.80, "2nd": 0.83,
    "3rd": 0.85, "4th": 0.88, "5th": 0.90,
  };
  return clamp(slowGrades[grade] ?? 0.85);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voiceId, voiceKey, speed, grade } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not configured");

    // Input validation
    if (!text || typeof text !== "string" || text.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid or too long text input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve voice: explicit voiceId > voiceKey lookup > default Laura
    let selectedVoiceId = voiceId;
    if (!selectedVoiceId && voiceKey && VOICES[voiceKey]) {
      selectedVoiceId = VOICES[voiceKey].id;
    }
    if (!selectedVoiceId) selectedVoiceId = VOICES.laura.id;

    const finalSpeed = gradeToSpeed(grade, speed);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.80,
            similarity_boost: 0.85,
            style: 0.15,
            use_speaker_boost: true,
            speed: finalSpeed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS error [${response.status}]: ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "X-Voice-Id": selectedVoiceId,
      },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
