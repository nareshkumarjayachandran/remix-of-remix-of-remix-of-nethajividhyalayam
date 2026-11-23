import { describe, expect, it } from "vitest";
import { calculateTodayPanchangam, getChennaiDateParts } from "@/lib/panchangam";

const currentDay = new Date("2026-11-23T07:05:00Z");

describe("Chennai current-day calendar and panchangam", () => {
  it("shows Monday 23 November 2026 in IST", () => {
    expect(getChennaiDateParts(currentDay)).toEqual({ year: 2026, month: 11, day: 23, weekday: 1 });
    expect(calculateTodayPanchangam(currentDay).date).toBe("Monday, 23 November 2026");
  });

  it("rolls the civil date over at midnight IST, not midnight UTC", () => {
    expect(getChennaiDateParts(new Date("2026-11-23T18:29:59Z")).day).toBe(23);
    expect(getChennaiDateParts(new Date("2026-11-23T18:30:00Z")).day).toBe(24);
  });

  it("shows Karthigai 7 in the Parabhava year, not the old Krodhi year", () => {
    const today = calculateTodayPanchangam(currentDay);
    expect(today.tamilMonth).toBe("கார்த்திகை (Karthigai)");
    expect(today.tamilDate).toBe(7);
    expect(today.tamilYear).toBe("பராபவ (Parabhava)");
    expect(today.kaliYear).toBe(5128);
  });

  it("uses sidereal lunar positions for Bharani and Variyan on 23 November", () => {
    const today = calculateTodayPanchangam(currentDay);
    expect(today.tithi).toBe("சதுர்தசி (Chaturdashi)");
    expect(today.nakshatra).toBe("பரணி (Bharani)");
    expect(today.yogam).toBe("வரியான் (Variyan)");
    expect(today.karanam).toBe("கரம் (Garam)");
  });

  it("calculates Chennai sunrise, sunset and Monday Rahu Kalam", () => {
    const today = calculateTodayPanchangam(currentDay);
    expect(today.sunrise).toBe("06:11 AM");
    expect(today.sunset).toBe("05:39 PM");
    expect(today.rahuKalam).toBe("07:37 AM – 09:03 AM");
    expect(calculateTodayPanchangam(new Date("2026-01-01T07:05:00Z")).sunrise).toBe("06:31 AM");
  });

  it("updates lunar details during the day as a karana changes", () => {
    expect(calculateTodayPanchangam(currentDay).karanam).toBe("கரம் (Garam)");
    expect(calculateTodayPanchangam(new Date("2026-11-23T08:30:00Z")).karanam).toBe("வணிஜம் (Vanijam)");
  });

  it("changes the Tamil year on Chithirai 1, not January 1", () => {
    const before = calculateTodayPanchangam(new Date("2026-04-13T07:05:00Z"));
    const after = calculateTodayPanchangam(new Date("2026-04-14T07:05:00Z"));
    expect(before.tamilYear).toBe("விசுவாவசு (Visvavasu)");
    expect(after.tamilYear).toBe("பராபவ (Parabhava)");
    expect(after.tamilDate).toBe(1);
    expect(after.tamilMonth).toBe("சித்திரை (Chithirai)");
  });

  it("keeps January in Margazhi, rather than incorrectly choosing Panguni", () => {
    expect(calculateTodayPanchangam(new Date("2026-01-01T07:05:00Z")).tamilMonth).toBe("மார்கழி (Margazhi)");
  });
});