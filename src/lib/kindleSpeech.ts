import type { KindleDocument, KindlePage } from "./kindleFileParser";

export interface KindleSpeechSegment {
  text: string;
  pageIndex: number;
  paragraphIndex: number | null;
  translated: boolean;
}

/** Speech and highlighting share explicit positions, never inferred title offsets. */
export function buildKindleSpeechSegments(
  doc: KindleDocument,
  indices: number[],
  translatedPages?: Record<number, KindlePage>,
): KindleSpeechSegment[] {
  const segments: KindleSpeechSegment[] = [];
  for (const pageIndex of indices) {
    const page = translatedPages?.[pageIndex] ?? doc.pages[pageIndex];
    if (!page) continue;
    const translated = Boolean(translatedPages?.[pageIndex]);
    const addTitle = (text: string) => segments.push({ text, pageIndex, paragraphIndex: null, translated });
    if (pageIndex === 0 && (!translated || !page.title || page.title === doc.title)) addTitle(doc.title);
    if (page.title && page.title !== doc.title) addTitle(page.title);
    page.paragraphs.forEach((paragraph, paragraphIndex) => {
      const text = paragraph.trim();
      if (text) segments.push({ text, pageIndex, paragraphIndex, translated });
    });
  }
  return segments;
}