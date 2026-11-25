/**
 * Turns worksheet / question-paper text into something the browser voice
 * reads the way a teacher would say it out loud.
 *
 * The main job: blank lines such as `________`, `-----`, `- - - -` or `====`
 * must be spoken as ONE "dash", not "underscore, underscore, underscore…".
 */

/**
 * One or more blank-line characters (spaces between them allowed, e.g.
 * `- - - -`), at least two of them, so real hyphenated words such as
 * "well-known" and maths like "2 - 5" are left alone.
 * The `-` sits last inside each class so it stays a literal hyphen.
 * `=` is deliberately NOT a blank character — maths like "2 + ___ = 5"
 * must keep its equals sign.
 */
const BLANK_RUN =
  /[_＿﹍﹎﹏﹘─‐‑‒–—―-](?:\s*[_＿﹍﹎﹏﹘─‐‑‒–—―-]){1,}/g;

/**
 * Replace every blank line with a single spoken "dash", then tidy the
 * spacing around it so the sentence still reads naturally.
 */
export function sanitizeForSpeech(text: string | null | undefined): string {
  if (!text) return "";

  return String(text)
    .replace(BLANK_RUN, " dash ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?%])/g, "$1")
    .trim();
}

/** True when a segment only holds blank lines / punctuation and says nothing. */
export function isSpeechSilent(text: string | null | undefined): boolean {
  const clean = sanitizeForSpeech(text);
  return clean === "" || clean === "dash";
}

const READABLE_BLOCK_SELECTOR = "h1, h2, h3, h4, h5, h6, p, li, summary, blockquote";

/**
 * Extracts readable speech segments in document order from a blog post's HTML,
 * skipping <style>, <script>, <svg>, and duplicate nested blocks.
 */
export function extractHtmlSpeechSegments(
  html: string | null | undefined,
  fallbackTitle?: string,
): string[] {
  if (!html) return fallbackTitle ? [sanitizeForSpeech(fallbackTitle)].filter(Boolean) : [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, script, svg, noscript").forEach((el) => el.remove());

  const segments: string[] = [];
  const blocks = doc.body.querySelectorAll(READABLE_BLOCK_SELECTOR);

  blocks.forEach((el) => {
    if (el.querySelector(READABLE_BLOCK_SELECTOR)) return;
    const clean = sanitizeForSpeech(el.textContent);
    if (!isSpeechSilent(clean)) {
      segments.push(clean);
    }
  });

  const cleanTitle = sanitizeForSpeech(fallbackTitle);
  if (cleanTitle) {
    const normalize = (s: string) => s.toLowerCase().replace(/[’‘'"]/g, "'").trim();
    const first = segments[0];
    if (!first || normalize(first) !== normalize(cleanTitle)) {
      segments.unshift(cleanTitle);
    }
  }

  return segments;
}

export type VoicePresetMode = "standard" | "storyteller";

export const STORYTELLER_CONFIG = {
  defaultSpeed: 0.85,
  pitch: 1.08,
  phrasePauseMs: 320,
  segmentPauseMs: 550,
} as const;

export interface VoiceOptionLike {
  name: string;
  lang: string;
  voiceURI: string;
  default?: boolean;
}

function scoreVoice(v: VoiceOptionLike): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  if (name.includes("natural") || name.includes("neural") || name.includes("enhanced") || name.includes("premium")) {
    score += 40;
  }
  if (name.includes("aria") || name.includes("jenny") || name.includes("samantha") || name.includes("siri") || name.includes("ava")) {
    score += 20;
  }
  if (name.includes("google") || name.includes("microsoft")) {
    score += 10;
  }
  if (lang === "en-in") score += 25;
  else if (lang.startsWith("en-gb") || lang.startsWith("en-us")) score += 20;
  else if (lang.startsWith("en")) score += 15;
  else if (lang.startsWith("ta") || lang.startsWith("hi")) score += 10;
  if (v.default) score += 5;
  return score;
}

/**
 * Filters and ranks device voices so expressive Natural/Enhanced English and
 * local-language voices appear first in the Voice Selector.
 */
export function rankVoicesForReader<T extends VoiceOptionLike>(voices: T[]): T[] {
  if (!voices.length) return [];
  const preferred = voices.filter((v) => /^(en|ta|hi)\b/i.test(v.lang));
  const pool = preferred.length > 0 ? preferred : voices;
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a) || a.name.localeCompare(b.name));
}

/**
 * Breaks a paragraph into rhythmic phrases at sentence endings, semicolons, and
 * em-dashes so Storyteller mode can breathe gently between beats.
 */
export function splitForStoryteller(text: string): string[] {
  const clean = sanitizeForSpeech(text);
  if (!clean) return [];
  const parts = clean
    .split(/(?<=[.!?;—])\s+/)
    .map((p) => p.trim())
    .filter((p) => !isSpeechSilent(p));
  return parts.length > 0 ? parts : [clean];
}
