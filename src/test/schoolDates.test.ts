import { describe, expect, it } from "vitest";
import { getAcademicYear, getAcademicYearFull, getYearsOfExcellence } from "@/lib/schoolDates";

describe("automatic school dates", () => {
  it("keeps January through May in the previous June-to-May academic year", () => {
    expect(getAcademicYear(new Date(2026, 0, 1))).toBe("2025-26");
    expect(getAcademicYear(new Date(2026, 4, 31))).toBe("2025-26");
  });

  it("starts the next academic year in June and provides a full-year label", () => {
    expect(getAcademicYear(new Date(2026, 5, 1))).toBe("2026-27");
    expect(getAcademicYearFull(new Date(2026, 5, 1))).toBe("2026–2027");
  });

  it("counts completed years from the school founding date of June 11, 2002", () => {
    expect(getYearsOfExcellence(new Date(2026, 5, 10))).toBe(23);
    expect(getYearsOfExcellence(new Date(2026, 5, 11))).toBe(24);
  });
});