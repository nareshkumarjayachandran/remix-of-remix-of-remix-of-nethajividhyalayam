export type WorksheetLayout = "portrait" | "landscape" | "booklet";

export interface WorksheetQuestion {
  id: number;
  question?: string;
  answer?: string;
  options?: string[];
  left?: string[];
  right?: string[];
  answers?: string[];
  diagramLabels?: string[];
  colAHeader?: string;
  colBHeader?: string;
}

export interface WorksheetSection {
  type: string;
  heading: string;
  questions: WorksheetQuestion[];
}

export interface BookletQuestionEntry {
  question: WorksheetQuestion;
  qIdx: number;
}

export interface BookletSlice {
  sectionIndex: number;
  sectionType: string;
  heading: string;
  isContinuation: boolean;
  questions: BookletQuestionEntry[];
}

export interface BookletPages {
  page1: BookletSlice[];
  page2: BookletSlice[];
  page3: BookletSlice[];
  page4: BookletSlice[];
}

const QUESTION_WEIGHT: Record<string, number> = {
  fill_in_blanks: 1,
  true_false: 1,
  multiple_choice: 1.5,
  short_answer: 2,
  match_following: 3,
  diagram: 4,
};

function getQuestionWeight(sectionType: string): number {
  return QUESTION_WEIGHT[sectionType] ?? 1.5;
}

/**
 * Distributes worksheet sections across 4 booklet pages (Page 1..4) proportionally.
 * Page 1 holds less content because it carries the school header & student info.
 * Page 4 holds the remaining items plus the answer key / remarks / footer.
 */
export function distributeBookletPages(sections: WorksheetSection[]): BookletPages {
  const flatItems: {
    sectionIndex: number;
    sectionType: string;
    heading: string;
    qIdx: number;
    question: WorksheetQuestion;
    weight: number;
  }[] = [];

  sections.forEach((section, sectionIndex) => {
    const w = getQuestionWeight(section.type);
    (section.questions || []).forEach((question, qIdx) => {
      flatItems.push({
        sectionIndex,
        sectionType: section.type,
        heading: section.heading,
        qIdx,
        question,
        weight: w,
      });
    });
  });

  const totalWeight = flatItems.reduce((sum, item) => sum + item.weight, 0);
  const buckets: [typeof flatItems, typeof flatItems, typeof flatItems, typeof flatItems] = [
    [],
    [],
    [],
    [],
  ];

  if (totalWeight > 0) {
    // Cumulative cutoffs: Page 1 (~20%), Page 2 (~35% -> 55%), Page 3 (~35% -> 90%), Page 4 (rest)
    const cut1 = totalWeight * 0.2;
    const cut2 = totalWeight * 0.55;
    const cut3 = totalWeight * 0.9;

    let running = 0;
    for (const item of flatItems) {
      const midpoint = running + item.weight * 0.5;
      if (midpoint <= cut1 || buckets[0].length === 0) {
        buckets[0].push(item);
      } else if (midpoint <= cut2) {
        buckets[1].push(item);
      } else if (midpoint <= cut3) {
        buckets[2].push(item);
      } else {
        buckets[3].push(item);
      }
      running += item.weight;
    }
  }

  const seenSections = new Set<number>();

  const toSlices = (items: typeof flatItems): BookletSlice[] => {
    const slices: BookletSlice[] = [];
    for (const item of items) {
      const last = slices[slices.length - 1];
      if (last && last.sectionIndex === item.sectionIndex) {
        last.questions.push({ question: item.question, qIdx: item.qIdx });
      } else {
        const isContinuation = seenSections.has(item.sectionIndex);
        seenSections.add(item.sectionIndex);
        slices.push({
          sectionIndex: item.sectionIndex,
          sectionType: item.sectionType,
          heading: item.heading,
          isContinuation,
          questions: [{ question: item.question, qIdx: item.qIdx }],
        });
      }
    }
    return slices;
  };

  return {
    page1: toSlices(buckets[0]),
    page2: toSlices(buckets[1]),
    page3: toSlices(buckets[2]),
    page4: toSlices(buckets[3]),
  };
}

/**
 * Returns the 2-sided sheet imposition order for a 1-sheet folded 4-page booklet:
 * Side 1 (Outside): [Page 4 (Back), Page 1 (Front)]
 * Side 2 (Inside):  [Page 2 (Inside Left), Page 3 (Inside Right)]
 */
export function getBookletImpositionOrder(): [[4, 1], [2, 3]] {
  return [
    [4, 1],
    [2, 3],
  ];
}

export function getWordPageCss(layout: WorksheetLayout): string {
  if (layout === "landscape" || layout === "booklet") {
    return "@page { size: A4 landscape; margin: 1cm 1.2cm; }";
  }
  return "@page { size: A4 portrait; margin: 1.5cm 2cm; }";
}

export const DEFAULT_WORKSHEET_TIME_LABEL = "Time: 2 ½ Hours";

/**
 * Strips trailing comma-separated chapter/topic lists from auto-generated worksheet titles
 * so the header stays clean (e.g. "Nethaji Vidhyalayam Worksheet - Class 3rd - Social Studies - Term 1").
 */
export function formatCleanWorksheetTitle(title: string, topic?: string): string {
  const trimmed = (title || "").trim();
  if (!trimmed) return "";
  const cleanTopic = (topic || "").trim();
  if (cleanTopic) {
    const suffix = ` - ${cleanTopic}`;
    if (trimmed.toLowerCase().endsWith(suffix.toLowerCase())) {
      return trimmed.slice(0, trimmed.length - suffix.length).trim();
    }
  }
  const termMatch = trimmed.match(/^(.*?\bTerm\s*[123])\s*[-–—]\s+.+$/i);
  if (termMatch?.[1]) {
    return termMatch[1].trim();
  }
  return trimmed;
}