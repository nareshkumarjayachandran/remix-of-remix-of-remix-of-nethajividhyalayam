import { describe, expect, it } from "vitest";
import {
  extractHtmlSpeechSegments,
  isSpeechSilent,
  rankVoicesForReader,
  sanitizeForSpeech,
  splitForStoryteller,
} from "./speechText";
import posts from "@/data/blogPosts.json";
import { getBlogTranslation } from "@/data/blogTranslations";

describe("sanitizeForSpeech", () => {
  it("reads a fill-in-the-blank line as one dash, not repeated underscores", () => {
    expect(sanitizeForSpeech("The capital of India is ________.")).toBe(
      "The capital of India is dash.",
    );
  });

  it("reads a blank at the start of a sentence as one dash", () => {
    expect(sanitizeForSpeech("_____ is the national animal of India.")).toBe(
      "dash is the national animal of India.",
    );
  });

  it("reads each blank in a two-blank sentence exactly once", () => {
    expect(sanitizeForSpeech("___ and ___ are vowels.")).toBe("dash and dash are vowels.");
  });

  it("reads hyphen and dash blank lines as one dash", () => {
    expect(sanitizeForSpeech("Name your pet: -----")).toBe("Name your pet: dash");
    expect(sanitizeForSpeech("Name your pet: - - - - -")).toBe("Name your pet: dash");
    expect(sanitizeForSpeech("Name your pet: ————")).toBe("Name your pet: dash");
  });

  it("keeps maths blanks and real hyphenated words intact", () => {
    expect(sanitizeForSpeech("Fill in: 2 + ___ = 5")).toBe("Fill in: 2 + dash = 5");
    expect(sanitizeForSpeech("well-known")).toBe("well-known");
    expect(sanitizeForSpeech("My favourite subject — Maths — is fun.")).toBe(
      "My favourite subject — Maths — is fun.",
    );
  });

  it("leaves ellipses and normal sentences untouched", () => {
    expect(sanitizeForSpeech("Wait...")).toBe("Wait...");
    expect(sanitizeForSpeech("Name the tallest plant in the garden.")).toBe(
      "Name the tallest plant in the garden.",
    );
  });

  it("collapses the extra spaces a blank line leaves behind", () => {
    expect(sanitizeForSpeech("A   ___   B")).toBe("A dash B");
    expect(sanitizeForSpeech("( ___ )")).toBe("( dash )");
  });

  it("returns empty text for empty or missing segments", () => {
    expect(sanitizeForSpeech("")).toBe("");
    expect(sanitizeForSpeech(null)).toBe("");
    expect(sanitizeForSpeech(undefined)).toBe("");
  });
});

describe("isSpeechSilent", () => {
  it("treats a blank-only segment as nothing to read", () => {
    expect(isSpeechSilent("________")).toBe(true);
    expect(isSpeechSilent("----")).toBe(true);
    expect(isSpeechSilent("   ")).toBe(true);
  });

  it("still reads real words", () => {
    expect(isSpeechSilent("Answer: Tiger")).toBe(false);
    expect(isSpeechSilent("The capital of India is dash.")).toBe(false);
  });
});

describe("extractHtmlSpeechSegments", () => {
  it("extracts headings, paragraphs, list items, and FAQ summaries while skipping CSS and SVG", () => {
    const html = `
      <style>.card { color: red; }</style>
      <svg><path d="M0 0h10v10z" /></svg>
      <article>
        <h1>Sensory Play Ideas</h1>
        <p>First paragraph for parents.</p>
        <ul><li><p>Nested list item</p></li><li>Simple item</li></ul>
        <details><summary>Is this safe?</summary><p>Yes, with supervision.</p></details>
      </article>
    `;
    expect(extractHtmlSpeechSegments(html, "Sensory Play Ideas")).toEqual([
      "Sensory Play Ideas",
      "First paragraph for parents.",
      "Nested list item",
      "Simple item",
      "Is this safe?",
      "Yes, with supervision.",
    ]);
  });

  it("prepends the fallback title when the HTML body does not start with it", () => {
    const html = "<p>Welcome to our school blog.</p>";
    expect(extractHtmlSpeechSegments(html, "School Annual Day")).toEqual([
      "School Annual Day",
      "Welcome to our school blog.",
    ]);
  });
});

describe("rankVoicesForReader", () => {
  it("places Natural/Enhanced English voices ahead of robotic defaults and excludes unrelated languages", () => {
    const voices = [
      { name: "eSpeak Basic", lang: "en-US", voiceURI: "espeak" },
      { name: "French Voice", lang: "fr-FR", voiceURI: "fr" },
      { name: "Microsoft Aria Online (Natural)", lang: "en-US", voiceURI: "aria" },
      { name: "Google Indian English", lang: "en-IN", voiceURI: "google-in" },
    ];
    const ranked = rankVoicesForReader(voices);
    expect(ranked.map((v) => v.voiceURI)).toEqual(["aria", "google-in", "espeak"]);
  });

  it("filters voices strictly to the requested Tamil or Hindi language when specified", () => {
    const voices = [
      { name: "Google Indian English", lang: "en-IN", voiceURI: "en-in" },
      { name: "Google தமிழ்", lang: "ta-IN", voiceURI: "ta-in" },
      { name: "Microsoft Valluvar Natural", lang: "ta-IN", voiceURI: "ta-natural" },
      { name: "Google हिन्दी", lang: "hi-IN", voiceURI: "hi-in" },
    ];
    expect(rankVoicesForReader(voices, "ta").map((v) => v.voiceURI)).toEqual([
      "ta-natural",
      "ta-in",
    ]);
    expect(rankVoicesForReader(voices, "hi").map((v) => v.voiceURI)).toEqual(["hi-in"]);
  });
});

describe("splitForStoryteller", () => {
  it("splits paragraphs into rhythmic phrases at sentence endings and em-dashes", () => {
    const text = "Once upon a time, a little bird sang. The moon smiled — and the stars danced!";
    expect(splitForStoryteller(text)).toEqual([
      "Once upon a time, a little bird sang.",
      "The moon smiled —",
      "and the stars danced!",
    ]);
  });

  it("splits Hindi sentences on the Devanagari danda (।)", () => {
    const text = "पहला वाक्य पूरा हुआ। दूसरा वाक्य शुरू हुआ।";
    expect(splitForStoryteller(text)).toEqual(["पहला वाक्य पूरा हुआ।", "दूसरा वाक्य शुरू हुआ।"]);
  });
});

describe("pre-saved offline blog translations", () => {
  it("provides non-empty Tamil and Hindi translations for every blog post", () => {
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      const ta = getBlogTranslation(post.slug, "ta");
      const hi = getBlogTranslation(post.slug, "hi");
      expect(ta, `Missing Tamil translation for ${post.slug}`).not.toBeNull();
      expect(hi, `Missing Hindi translation for ${post.slug}`).not.toBeNull();
      expect(ta!.length).toBeGreaterThan(20);
      expect(hi!.length).toBeGreaterThan(20);
    }
  });
});
