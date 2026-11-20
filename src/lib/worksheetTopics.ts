/** Preserve complete chapter labels, including commas inside suggested titles. */
export function parseWorksheetTopics(value: string, suggestions: readonly string[]): string[] {
  const knownTopics = [...suggestions].sort((a, b) => b.length - a.length);
  const topics: string[] = [];
  let remaining = value.trim();

  while (remaining) {
    const known = knownTopics.find((topic) =>
      remaining.toLowerCase().startsWith(topic.toLowerCase()) &&
      (remaining.length === topic.length || /^\s*,/.test(remaining.slice(topic.length)))
    );
    if (known) {
      topics.push(remaining.slice(0, known.length));
      remaining = remaining.slice(known.length).replace(/^\s*,\s*/, "").trim();
      continue;
    }

    let depth = 0;
    let end = 0;
    for (; end < remaining.length; end++) {
      const char = remaining[end];
      if (char === "(" || char === "[") depth++;
      if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
      if (char === "," && depth === 0) break;
    }
    const topic = remaining.slice(0, end).trim();
    if (topic) topics.push(topic);
    remaining = remaining.slice(end + 1).trim();
  }
  return topics;
}

export function toggleWorksheetTopic(value: string, topic: string, suggestions: readonly string[]): string {
  const topics = parseWorksheetTopics(value, suggestions);
  const selected = topics.some((item) => item.toLowerCase() === topic.toLowerCase());
  return (selected
    ? topics.filter((item) => item.toLowerCase() !== topic.toLowerCase())
    : [...topics, topic]).join(", ");
}