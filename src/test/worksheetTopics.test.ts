import { describe, expect, it } from "vitest";
import { parseWorksheetTopics, toggleWorksheetTopic } from "../lib/worksheetTopics";

describe("worksheet topic selection", () => {
  it.each([
    "Action Words (Jump, Clap)",
    "Shapes (Circle, Square)",
    "அ, ஆ, இ, ஈ",
    "Speed, Distance, Time (intro)",
    "Direct Speech (He said, \"Hello\")",
    "Chandrayaan, Mangalyaan, Gaganyaan",
  ])("selects and deselects the complete chapter %s", (chapter) => {
    const suggestions = [chapter, "Review"];
    const selected = toggleWorksheetTopic("Review", chapter, suggestions);
    expect(parseWorksheetTopics(selected, suggestions)).toEqual(["Review", chapter]);
    expect(toggleWorksheetTopic(selected, chapter, suggestions)).toBe("Review");
  });

  it("preserves manually entered topics when toggling suggested chapters", () => {
    const suggestions = ["Shapes (Circle, Square)"];
    expect(toggleWorksheetTopic("My own chapter, Shapes (Circle, Square)", suggestions[0], suggestions))
      .toBe("My own chapter");
  });

  it("matches the longest title and ignores case without duplicate selections", () => {
    const suggestions = ["Speed", "Speed, Distance, Time (intro)"];
    expect(parseWorksheetTopics("Speed, Distance, Time (intro), Speed", suggestions))
      .toEqual(["Speed, Distance, Time (intro)", "Speed"]);
    expect(toggleWorksheetTopic("SPEED", "Speed", suggestions)).toBe("");
  });
});