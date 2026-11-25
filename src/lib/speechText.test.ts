import { describe, expect, it } from "vitest";
import { isSpeechSilent, sanitizeForSpeech } from "./speechText";

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
