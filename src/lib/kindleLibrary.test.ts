import { describe, expect, it } from "vitest";
import {
  buildKindleStoragePath,
  formatFileSize,
  validateKindleUploadInput,
} from "./kindleLibrary";
import { MAX_KINDLE_FILE_BYTES } from "./kindleFileParser";

describe("kindleLibrary helpers", () => {
  it("sanitizes uploaded file names into safe storage paths", () => {
    expect(buildKindleStoragePath("Grade 3 Math Worksheet (Term 1).pdf", 1700000000000)).toBe(
      "1700000000000-Grade-3-Math-Worksheet-Term-1-.pdf",
    );
    expect(buildKindleStoragePath("   ", 1700000000000)).toBe("1700000000000-document.txt");
  });

  it("rejects missing titles, missing files, empty files, and oversized files", () => {
    expect(validateKindleUploadInput("   ", { name: "a.pdf", size: 100 })).toMatch(/title/i);
    expect(validateKindleUploadInput("A".repeat(151), { name: "a.pdf", size: 100 })).toMatch(/150/);
    expect(validateKindleUploadInput("Tamil Reader", null)).toMatch(/file/i);
    expect(validateKindleUploadInput("Tamil Reader", { name: "empty.pdf", size: 0 })).toMatch(/empty/i);
    expect(
      validateKindleUploadInput("Huge Book", { name: "big.pdf", size: MAX_KINDLE_FILE_BYTES + 1 }),
    ).toMatch(/50 MB/);
    expect(validateKindleUploadInput("Class 3 Science Book", { name: "sci.pdf", size: 2048 })).toBeNull();
  });

  it("formats file sizes cleanly in B, KB, and MB", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});