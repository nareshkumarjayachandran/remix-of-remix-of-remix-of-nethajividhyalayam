/** Format submission timestamps in the school's timezone, not server UTC. */
export function formatSchoolEmailTimestamp(now: Date) {
  return {
    dateStr: now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric",
    }),
    timeStr: now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }) + " IST",
  };
}