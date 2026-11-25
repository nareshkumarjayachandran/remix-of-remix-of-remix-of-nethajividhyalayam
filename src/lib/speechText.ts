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
export type SpeechLanguage =
  | "en"
  | "ta"
  | "hi"
  | "te"
  | "kn"
  | "ml"
  | "bn"
  | "mr"
  | "gu"
  | "pa"
  | "ur"
  | "or"
  | "as"
  | "sa"
  | "fr"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "ru"
  | "ja"
  | "zh"
  | "ko"
  | "ar"
  | "nl"
  | "tr"
  | "sv"
  | "th";

export interface SpeechLanguageMeta {
  code: SpeechLanguage;
  label: string;
  nativeLabel: string;
  bcp47: string;
  group: "indian" | "foreign";
}

export const SPEECH_LANGUAGE_META: Record<SpeechLanguage, SpeechLanguageMeta> = {
  en: { code: "en", label: "English", nativeLabel: "English", bcp47: "en-IN", group: "indian" },
  ta: { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", bcp47: "ta-IN", group: "indian" },
  hi: { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", bcp47: "hi-IN", group: "indian" },
  te: { code: "te", label: "Telugu", nativeLabel: "తెలుగు", bcp47: "te-IN", group: "indian" },
  kn: { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", bcp47: "kn-IN", group: "indian" },
  ml: { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", bcp47: "ml-IN", group: "indian" },
  bn: { code: "bn", label: "Bengali", nativeLabel: "বাংলা", bcp47: "bn-IN", group: "indian" },
  mr: { code: "mr", label: "Marathi", nativeLabel: "मराठी", bcp47: "mr-IN", group: "indian" },
  gu: { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", bcp47: "gu-IN", group: "indian" },
  pa: { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", bcp47: "pa-IN", group: "indian" },
  ur: { code: "ur", label: "Urdu", nativeLabel: "اردو", bcp47: "ur-IN", group: "indian" },
  or: { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", bcp47: "or-IN", group: "indian" },
  as: { code: "as", label: "Assamese", nativeLabel: "অসমীয়া", bcp47: "as-IN", group: "indian" },
  sa: { code: "sa", label: "Sanskrit", nativeLabel: "संस्कृतम्", bcp47: "sa-IN", group: "indian" },
  fr: { code: "fr", label: "French", nativeLabel: "Français", bcp47: "fr-FR", group: "foreign" },
  es: { code: "es", label: "Spanish", nativeLabel: "Español", bcp47: "es-ES", group: "foreign" },
  de: { code: "de", label: "German", nativeLabel: "Deutsch", bcp47: "de-DE", group: "foreign" },
  it: { code: "it", label: "Italian", nativeLabel: "Italiano", bcp47: "it-IT", group: "foreign" },
  pt: { code: "pt", label: "Portuguese", nativeLabel: "Português", bcp47: "pt-BR", group: "foreign" },
  ru: { code: "ru", label: "Russian", nativeLabel: "Русский", bcp47: "ru-RU", group: "foreign" },
  ja: { code: "ja", label: "Japanese", nativeLabel: "日本語", bcp47: "ja-JP", group: "foreign" },
  zh: { code: "zh", label: "Chinese (Mandarin)", nativeLabel: "中文", bcp47: "zh-CN", group: "foreign" },
  ko: { code: "ko", label: "Korean", nativeLabel: "한국어", bcp47: "ko-KR", group: "foreign" },
  ar: { code: "ar", label: "Arabic", nativeLabel: "العربية", bcp47: "ar-SA", group: "foreign" },
  nl: { code: "nl", label: "Dutch", nativeLabel: "Nederlands", bcp47: "nl-NL", group: "foreign" },
  tr: { code: "tr", label: "Turkish", nativeLabel: "Türkçe", bcp47: "tr-TR", group: "foreign" },
  sv: { code: "sv", label: "Swedish", nativeLabel: "Svenska", bcp47: "sv-SE", group: "foreign" },
  th: { code: "th", label: "Thai", nativeLabel: "ไทย", bcp47: "th-TH", group: "foreign" },
};

export const INDIAN_SPEECH_LANGUAGES: SpeechLanguage[] = [
  "en", "ta", "hi", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur", "or", "as", "sa",
];

export const FOREIGN_SPEECH_LANGUAGES: SpeechLanguage[] = [
  "fr", "es", "de", "it", "pt", "ru", "ja", "zh", "ko", "ar", "nl", "tr", "sv", "th",
];

export const ALL_SPEECH_LANGUAGES: SpeechLanguage[] = [
  ...INDIAN_SPEECH_LANGUAGES,
  ...FOREIGN_SPEECH_LANGUAGES,
];

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

function scoreVoice(v: VoiceOptionLike, targetLang?: SpeechLanguage): number {
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
  if (targetLang && targetLang !== "en") {
    const exact = SPEECH_LANGUAGE_META[targetLang].bcp47.toLowerCase();
    if (lang === exact) score += 30;
    else if (lang.startsWith(targetLang)) score += 20;
  } else {
    if (lang === "en-in") score += 25;
    else if (lang.startsWith("en-gb") || lang.startsWith("en-us")) score += 20;
    else if (lang.startsWith("en")) score += 15;
    else if (lang.startsWith("ta") || lang.startsWith("hi")) score += 10;
  }
  if (v.default) score += 5;
  return score;
}

/**
 * Filters and ranks device voices so expressive Natural/Enhanced English and
 * local-language voices appear first in the Voice Selector. When `language` is
 * supplied, returns only voices matching that language (empty if none exist).
 */
export function rankVoicesForReader<T extends VoiceOptionLike>(
  voices: T[],
  language?: SpeechLanguage,
): T[] {
  if (!voices.length) return [];
  if (language) {
    const pattern = new RegExp(`^${language}\\b`, "i");
    const matched = voices.filter((v) => pattern.test(v.lang));
    return [...matched].sort(
      (a, b) => scoreVoice(b, language) - scoreVoice(a, language) || a.name.localeCompare(b.name),
    );
  }
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
    .split(/(?<=[.!?;—।。！？؟])\s*/)
    .map((p) => p.trim())
    .filter((p) => !isSpeechSilent(p));
  return parts.length > 0 ? parts : [clean];
}
