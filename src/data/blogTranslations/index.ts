import { sensoryPlayTranslations } from "./sensoryPlay";
import { socialSkillsTranslations } from "./socialSkills";
import { storytimeMagicTranslations } from "./storytimeMagic";
import { focusConcentrationTranslations } from "./focusConcentration";
import { healthyTiffinTranslations } from "./healthyTiffin";
import { bhagavadGitaTranslations } from "./bhagavadGita";
import { celebratingExcellenceTranslations } from "./celebratingExcellence";

export type TranslatedBlogLanguage = "ta" | "hi";

const BLOG_TRANSLATIONS: Record<string, Record<TranslatedBlogLanguage, string[]>> = {
  "sensory-play-ideas-toddler-brain-development": sensoryPlayTranslations,
  "build-social-skills-sharing-habits-preschoolers": socialSkillsTranslations,
  "storytime-magic-bedtime-stories-early-vocabulary": storytimeMagicTranslations,
  "help-primary-schooler-improve-focus-concentration": focusConcentrationTranslations,
  "healthy-tiffin-ideas-nutritious-lunchbox-recipes-kids": healthyTiffinTranslations,
  "bhagavad-gita-storytelling-for-young-minds": bhagavadGitaTranslations,
  "celebrating-excellence-students-shine-inter-school-competitions": celebratingExcellenceTranslations,
};

/** Returns pre-saved offline Tamil or Hindi speech segments for a blog slug, if available. */
export function getBlogTranslation(
  slug: string,
  language: TranslatedBlogLanguage,
): string[] | null {
  const entry = BLOG_TRANSLATIONS[slug];
  return entry ? entry[language] : null;
}