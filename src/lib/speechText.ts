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
