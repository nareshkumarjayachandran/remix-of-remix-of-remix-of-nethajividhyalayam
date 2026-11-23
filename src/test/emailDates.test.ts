import { describe, expect, it } from "vitest";
import { formatSchoolEmailTimestamp } from "../../supabase/functions/_shared/emailDates";

describe("school email timestamps", () => {
  it("shows Indian time instead of the reported 08:26:04 server time", () => {
    expect(formatSchoolEmailTimestamp(new Date("2026-11-23T08:26:04Z"))).toEqual({
      dateStr: "23 November 2026",
      timeStr: "01:56:04 pm IST",
    });
  });
  it("uses the Indian calendar date after midnight in Chennai", () => {
    expect(formatSchoolEmailTimestamp(new Date("2026-11-23T20:00:00Z")).dateStr)
      .toBe("24 November 2026");
  });
});