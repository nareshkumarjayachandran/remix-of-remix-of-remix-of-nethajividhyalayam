import React, { useState, useCallback, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { offlineDb } from "@/lib/offlineDb";
import OfflineBanner from "@/components/ui/OfflineBanner";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import {
  BookOpen, Download, RefreshCw, Eye, EyeOff, Printer,
  Sparkles, Loader2, GraduationCap, FileText,
  PenLine, ChevronDown, Share2, ArrowLeft, CheckSquare, Map,
  Check, Palette, History, Trash2, Clock,
} from "lucide-react";
import VoiceReader from "@/components/ui/VoiceReader";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────
interface PaperQuestion {
  id: number;
  question?: string;
  answer?: string;
  explanation?: string;
  options?: string[];
  left?: string[];
  right?: string[];
  answers?: string[];
  marks?: number;
  diagramLabels?: string[];
  diagramType?: string;
  selected?: boolean;
}

interface PaperSubsection {
  type: string;
  heading: string;
  questions: PaperQuestion[];
}

interface PaperSection {
  partLabel: string;
  type: string;
  heading: string;
  marksPerQuestion: number;
  totalMarks: number;
  instructions: string;
  subsections: PaperSubsection[];
}

interface QuestionPaper {
  title: string;
  subtitle: string;
  examType: string;
  totalMarks: number;
  duration: string;
  term: string;
  grade: string;
  subject: string;
  curriculum?: string;
  generalInstructions: string[];
  sections: PaperSection[];
  answerKey?: {
    sections: { partLabel: string; answers: { id: number; answer: string; explanation?: string }[] }[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────
const EXAM_TYPES = [
  { id: "Midterm", label: "Midterm", emoji: "📋", marks: 50, duration: "1½ Hours" },
  { id: "Quarterly", label: "Quarterly", emoji: "📝", marks: 75, duration: "2 Hours" },
  { id: "Half-Yearly", label: "Half-Yearly", emoji: "📄", marks: 75, duration: "2½ Hours" },
  { id: "Annual", label: "Annual", emoji: "🏆", marks: 100, duration: "2½ Hours" },
];

const GRADES = ["1st", "2nd", "3rd", "4th", "5th"];
const SUBJECTS = ["Tamil", "English", "Maths", "EVS/Science", "Social Studies", "Hindi", "General Knowledge"];
const TERMS = ["Term 1", "Term 2", "Term 3"];
const LANGUAGES = ["English", "Tamil", "Hindi", "Bilingual"];
const BILINGUAL_PAIRS = [
  { id: "English+Tamil", label: "English & Tamil", labelTamil: "ஆங்கிலம் & தமிழ்" },
  { id: "Tamil+Hindi", label: "Tamil & Hindi", labelTamil: "தமிழ் & हिंदी" },
  { id: "English+Hindi", label: "English & Hindi", labelTamil: "ஆங்கிலம் & हिंदी" },
];
const CURRICULA = [
  { id: "Samacheer Kalvi", label: "Samacheer Kalvi", emoji: "📚", desc: "Tamil Nadu State Board" },
  { id: "Oxford Merry Birds", label: "Oxford Merry Birds", emoji: "🐦", desc: "Activity-based learning" },
];

const QUESTION_TYPES = [
  { id: "multiple_choice", label: "MCQ", emoji: "✅", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { id: "fill_in_blanks", label: "Fill Blanks", emoji: "✏️", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { id: "true_false", label: "True/False", emoji: "⚖️", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { id: "match_following", label: "Match", emoji: "🔗", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { id: "short_answer", label: "Short Answer", emoji: "📝", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  { id: "long_answer", label: "Long Answer", emoji: "📄", color: "bg-rose-100 text-rose-700 border-rose-300" },
  { id: "diagram", label: "Diagram/Map", emoji: "📐", color: "bg-amber-100 text-amber-700 border-amber-300" },
];

const QUESTION_PATTERNS = [
  { id: "state_board", label: "State Board", emoji: "🏛️", desc: "TN State Board exam pattern" },
  { id: "cbse", label: "CBSE", emoji: "📘", desc: "CBSE exam pattern" },
  { id: "icse", label: "ICSE", emoji: "📗", desc: "ICSE exam pattern" },
  { id: "custom", label: "Custom", emoji: "⚙️", desc: "Your own pattern" },
];

const HINDI_SYLLABUS_OPTIONS = [
  { id: "none", label: "Regular Hindi", emoji: "📖", desc: "Standard school Hindi" },
  { id: "parichay", label: "Parichay (परिचय)", emoji: "🔤", desc: "Hindi Prachar Sabha - Beginner" },
  { id: "prathama", label: "Prathama (प्रथमा)", emoji: "📗", desc: "Hindi Prachar Sabha - Elementary" },
  { id: "madhyama", label: "Madhyama (मध्यमा)", emoji: "📘", desc: "Hindi Prachar Sabha - Intermediate" },
  { id: "rashtrabhasha", label: "Rashtrabhasha (राष्ट्रभाषा)", emoji: "📕", desc: "Hindi Prachar Sabha - Advanced" },
  { id: "praveshika", label: "Praveshika (प्रवेशिका)", emoji: "📙", desc: "Hindi Prachar Sabha - Pre-degree" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Topic suggestions: key = `${curricShort}-${term}-${grade}-${subject}`
// curricShort: "MB" = Merry Birds, "SK" = Samacheer Kalvi
const QP_TOPIC_SUGGESTIONS: Record<string, string[]> = {
  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 1
  // ══════════════════════════════════════════════════════
  "SK-Term 1-1st-Tamil":    ["உயிர் எழுத்துக்கள்", "வல்லினம் மிகா இடம்", "பெயர்ச்சொல்", "மெய் எழுத்துக்கள்", "உயிர்மெய் எழுத்துக்கள்", "ஒரு சொல் - பல பொருள்", "எதிர்ச்சொல்", "ஒலி வேறுபாடு", "படம் பார்த்து எழுது", "எளிய வாக்கியம் அமை", "சொல் விளையாட்டு", "கவிதை படிக்கலாம்"],
  "SK-Term 2-1st-Tamil":    ["மெய் எழுத்துக்கள்", "உயிர்மெய் எழுத்துக்கள்", "வினைச்சொல்", "பெயர்ச்சொல் (உயிர்/பொருள்)", "எதிர்ச்சொல்", "ஓரெழுத்து ஒருமொழி", "இணைச்சொல்", "உவமை (போல, போன்ற)", "சொற்றொடர் அமை", "படம் பார்த்து கதை சொல்", "விடுகதைகள்", "பழமொழிகள்"],
  "SK-Term 3-1st-Tamil":    ["அகர வரிசை", "எதிர்ச்சொல்", "ஒரே மாதிரியான சொற்கள்", "சொல் வரிசை (அகரவரிசை)", "கட்டுரை (என் பள்ளி)", "கடிதம் எழுதுதல் (நண்பனுக்கு)", "பாடல் படிக்கலாம்", "புதிர்கள்", "படம் பார்த்து வாக்கியம்", "வாக்கிய அமைப்பு", "எளிய உரைநடை", "எழுத்துப் பிழை திருத்துதல்"],
  "SK-Term 1-1st-English":  ["My Body", "My School", "Animals and their Homes", "Articles (a, an)", "Singular and Plural", "Naming Words (Nouns)", "Common and Proper Nouns", "Vowels and Consonants", "Action Words (Verbs)", "Sight Words Practice", "Opposites (Antonyms)", "Picture Description", "Sentence Rearrangement", "Gender (Masculine/Feminine)"],
  "SK-Term 2-1st-English":  ["Action Words (Verbs)", "Describing Words (Adjectives)", "Days of the Week", "Opposites", "Rhyming Words", "Is/Am/Are", "Prepositions (in, on, under, near)", "Tenses – Present Simple (I eat, She reads)", "Question Words (What, Where, Who)", "Punctuation (Full Stop, Question Mark)", "Compound Words", "Pronouns (I, He, She, It)", "Sentence Making", "Story Retelling"],
  "SK-Term 3-1st-English":  ["Seasons", "Community Helpers", "Simple Sentences", "Punctuation (Full Stop, Question Mark)", "One and Many", "Reading Comprehension", "Conjunctions (and, but, or)", "Letter Writing (Informal – to a Friend)", "Synonyms (happy/glad)", "Antonyms (hot/cold)", "Singular & Plural (Irregular)", "Creative Writing (My Pet, My School)", "Comprehension Passage", "Dictation & Spelling"],
  "SK-Term 1-1st-Maths":    ["Numbers 1–100", "Addition (2-Digit)", "Subtraction", "Place Value (Ones, Tens)", "Number Names", "Before/After/Between", "Comparing Numbers (>, <, =)", "Skip Counting (2s, 5s, 10s)", "Shapes (2D)", "Patterns", "Ordinal Numbers", "Measurement (Length)"],
  "SK-Term 2-1st-Maths":    ["Shapes", "Measurement (Long/Short)", "Patterns", "Addition Word Problems", "Subtraction Word Problems", "Even and Odd Numbers", "Number Line", "Symmetry", "3D Shapes", "Data Handling (Pictograph)", "Fractions (Half)", "Mental Maths"],
  "SK-Term 3-1st-Maths":    ["Money", "Time (Clock)", "Data (Tally)", "Calendar Reading", "Weight and Capacity", "Multiplication (intro)", "Addition & Subtraction Review", "Number Patterns", "Geometry (Lines, Curves)", "Word Problems (Mixed)", "Estimation", "Maths Games"],
  "SK-Term 1-1st-EVS/Science": ["Plants Around Us", "Animals and their Young Ones", "My Body", "My Five Senses", "Living and Non-living", "Healthy Food", "Parts of a Plant", "Domestic and Wild Animals", "Water Sources", "Clean Environment"],
  "SK-Term 2-1st-EVS/Science": ["Food and Nutrition", "Water", "Air", "Birds and Features", "Insects", "Materials (Natural & Man-made)", "Safety Rules", "Seasons and Clothing", "Plants We Eat", "Personal Hygiene"],
  "SK-Term 3-1st-EVS/Science": ["Weather and Seasons", "Transport", "Community Helpers", "Day and Night", "Sound", "Light and Shadow", "Recycling", "Animals in Habitats", "Water Cycle (intro)", "Fun Experiments"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 2
  // ══════════════════════════════════════════════════════
  "SK-Term 1-2nd-Tamil":    ["உயிர்மெய் எழுத்துக்கள்", "பெயர்ச்சொல் வகைகள்", "கவிதை – தோட்டம்", "வினைச்சொல்", "இடைச்சொல்", "உவமை", "ஒரு சொல் - பல பொருள்", "இணைச்சொல்", "எதிர்ச்சொல்", "சொற்றொடர் அமை", "படம் பார்த்து கதை", "எழுத்துப் பயிற்சி"],
  "SK-Term 2-2nd-Tamil":    ["வினைச்சொல்", "உவமை", "பாடல் – தாய்மொழி", "பெயர்ச்சொல் (திணை, பால்)", "எதிர்ச்சொல்", "பழமொழிகள்", "கட்டுரை (என் தாய்)", "கடிதம் (அம்மாவுக்கு)", "சொல் விளையாட்டு", "வாக்கிய வகைகள்", "படிக்கும் பகுதி (உரைநடை)", "ஒருமை – பன்மை"],
  "SK-Term 3-2nd-Tamil":    ["சொல் விளையாட்டு", "எதிர்ச்சொல்", "புணர்ச்சி (intro)", "இணைச்சொல்", "பிரித்து எழுதுக", "சேர்த்து எழுதுக", "பொருத்துக", "கதை எழுது (சிறுகதை)", "விடுகதைகள்", "படம் பார்த்து எழுது", "எழுத்துப் பிழை திருத்தம்", "வாக்கியம் நிரப்புக"],
  "SK-Term 1-2nd-English":  ["Action Words (Verbs)", "The Crow and the Pitcher (Story)", "Nouns", "Singular and Plural", "Articles (a, an, the)", "Prepositions (in, on, under)", "Pronouns (I, He, She, It)", "Common & Proper Nouns", "Collective Nouns (a flock, a herd)", "Gender (Masculine/Feminine)", "Countable & Uncountable Nouns", "Synonyms & Antonyms", "Picture Composition", "Sentence Types (Statement, Question)"],
  "SK-Term 2-2nd-English":  ["Adjectives", "Pronouns", "Question Words (Who, What, Where)", "Tenses (Present Simple)", "Opposites (Antonyms)", "Comprehension Passage", "Tenses – Past Simple (I went, She ate)", "Adverbs (slowly, quickly)", "Prefix (un-, re-)", "Suffix (-ful, -ly, -ness)", "Homophones (to/two/too)", "Paragraph Writing", "Dictation & Spelling", "Dialogue Writing"],
  "SK-Term 3-2nd-English":  ["Rhyming Words", "Simple Story Writing", "Punctuation", "Letter Writing (Informal)", "Conjunctions (and, but, or)", "Picture Composition", "Tenses – Future Simple (I will go)", "Essay Writing (My Best Friend, My Pet)", "Diary Entry", "Comprehension (Prose)", "Direct Speech (He said, \"Hello\")", "Singular & Plural (Irregular: child/children)", "Word Building (root words)", "Reading Aloud Practice"],
  "SK-Term 1-2nd-Maths":    ["3-Digit Numbers", "Addition with Carry", "Subtraction with Borrow", "Place Value (Hundreds)", "Number Names", "Comparing & Ordering", "Even and Odd", "Skip Counting (3s, 4s)", "Shapes and Symmetry", "Measurement (cm, m)", "Patterns", "Word Problems"],
  "SK-Term 2-2nd-Maths":    ["Multiplication Tables 2–5", "Division (Basic)", "Fractions (Half, Quarter)", "Multiplication Word Problems", "Time (Hours & Half Hours)", "Money (Add & Subtract)", "Geometry (Lines intro)", "Data Handling (Pictograph)", "Number Patterns", "Mental Maths", "Estimation", "Division Word Problems"],
  "SK-Term 3-2nd-Maths":    ["Time and Calendar", "Money", "Data Handling (Tally Charts)", "Multiplication Tables 6–10", "Fractions (Comparing)", "Area (Counting Squares)", "Perimeter (intro)", "Weight (kg, g)", "Capacity (L, mL)", "4-Digit Numbers (intro)", "Roman Numerals (I–X)", "Problem Solving"],
  "SK-Term 1-2nd-EVS/Science": ["Food", "Water", "Air", "Balanced Diet", "Sources of Water", "Living and Non-living", "Habitats", "Teeth and Dental Care", "Personal Hygiene", "Vitamins and Minerals"],
  "SK-Term 2-2nd-EVS/Science": ["Plants (Photosynthesis)", "Animals (Adaptation)", "Soil", "Seeds and Germination", "Food Chain (intro)", "Pollution", "Birds and Migration", "Insects and Roles", "Materials (Solid, Liquid, Gas)", "Energy Sources"],
  "SK-Term 3-2nd-EVS/Science": ["Weather", "Simple Machines", "Light and Sound", "Magnets", "Human Body (Bones)", "Rocks and Minerals", "Natural Disasters", "Water Conservation", "Waste Management", "Fun Experiments"],
  "SK-Term 1-2nd-Social Studies": ["Our Country India", "Our State Tamil Nadu", "National Symbols", "States and Capitals", "Map Reading", "Landforms", "Rivers of India", "Himalayas", "Natural Resources", "Indian Ocean"],
  "SK-Term 2-2nd-Social Studies": ["Landforms", "Rivers of India", "Crops and Farming", "Communication", "Industries (intro)", "Village and City Life", "Markets and Trade", "Road Safety", "Environmental Conservation", "Occupations"],
  "SK-Term 3-2nd-Social Studies": ["Transport", "Occupations", "Government (intro)", "Indian Constitution (intro)", "Rights and Duties", "Freedom Fighters", "Indian Festivals", "Cultural Diversity", "Continents", "Disaster Management (intro)"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 3
  // ══════════════════════════════════════════════════════
  "SK-Term 1-3rd-Tamil":    ["நிலா (கவிதை)", "செய்யுள்", "பாடல் – நம் தமிழ்", "பெயர்ச்சொல் (இட/காலப் பெயர்)", "வினைச்சொல் வகைகள்", "உரைநடை புரிதல்", "எதிர்ச்சொல்", "ஒருமை – பன்மை", "இணைச்சொல்", "உவமை & அணி", "கட்டுரை (என் ஊர்)", "கடிதம் எழுதுதல்", "திருக்குறள்", "படிக்கும் பகுதி"],
  "SK-Term 2-3rd-Tamil":    ["உரைநடை", "பெயர்ச்சொல் வகைகள்", "வினைமுற்று", "காலம் (இறந்த/நிகழ்/எதிர்)", "வேற்றுமை உருபுகள்", "பழமொழிகள்", "மரபுத்தொடர்", "சொற்பொருள்", "விடுகதைகள்", "கதை எழுதுதல்", "தன்வரலாறு", "பத்தி எழுதுதல்", "நிரப்புக & பொருத்துக"],
  "SK-Term 3-3rd-Tamil":    ["புணர்ச்சி", "மடக்கு அணி", "தொகைச்சொல்", "பிரித்து எழுதுக", "சேர்த்து எழுதுக", "உவமை அணி", "எழுவாய் – பயனிலை", "செய்யுள் பொருள்", "அகராதிப் பயன்பாடு", "கட்டுரை எழுதுதல்", "சொல் வளம்", "கவிதை எழுதுதல்", "செய்தித்தாள் படிக்கலாம்"],
  "SK-Term 1-3rd-English":  ["Animals", "Flowers and Plants", "Community Helpers", "Nouns (Common, Proper, Collective)", "Singular and Plural (Irregular)", "Articles (a, an, the)", "Pronouns (Possessive: my, your, his)", "Adjectives (Comparison)", "Prepositions (at, by, for, with)", "Sentence Formation", "Vocabulary Building", "Story Writing", "Picture Composition", "Tenses (Present Simple & Continuous)"],
  "SK-Term 2-3rd-English":  ["Seasons and Weather", "Tenses (Past, Present, Future)", "Letter Writing (Informal)", "Pronouns (He, She, It, They)", "Prepositions", "Comprehension Passage", "Active and Passive Voice", "Direct and Indirect Speech", "Conjunctions (because, although, since)", "Homophones & Homonyms", "Prefix and Suffix", "Diary Entry", "Notice Writing", "Dialogue Writing"],
  "SK-Term 3-3rd-English":  ["Comprehension Passage", "Adjectives (Degrees of Comparison)", "Essay (My School)", "Conjunctions", "Punctuation (Comma, Apostrophe)", "Story Writing", "Subject-Verb Agreement", "Idioms and Phrases", "Comprehension (Poetry)", "Precis Writing", "Report Writing", "Creative Writing (Imaginary Story)", "Word Meanings & Definitions", "Spelling & Dictation"],
  "SK-Term 1-3rd-Maths":    ["4-Digit Numbers", "Multiplication (3-Digit x 1)", "Division", "Place Value (Thousands)", "Roman Numerals (I–L)", "Factors and Multiples", "Fractions (Like)", "Geometry (Lines, Rays)", "Patterns (Sequences)", "Measurement (km, m, cm)", "Data Handling (Bar Graph)", "Word Problems (Multi-step)"],
  "SK-Term 2-3rd-Maths":    ["Fractions", "Decimals (intro)", "Geometry (Angles)", "Addition & Subtraction of Fractions", "Multiplication (2-digit x 2-digit)", "Long Division", "Time (AM/PM, 24-hour)", "Money (Bills & Budgets)", "Symmetry", "Perimeter", "Number Patterns", "Estimation & Rounding"],
  "SK-Term 3-3rd-Maths":    ["Area and Perimeter", "Time and Distance", "Data Handling", "Volume (intro)", "Weight and Capacity", "Geometry (Triangles, Quadrilaterals)", "Decimals (Addition)", "Multiplication Tables (up to 12)", "Calendar Problems", "Roman Numerals Review", "Problem Solving Strategies", "Maths Olympiad"],
  "SK-Term 1-3rd-EVS/Science": ["Plants and their Parts", "Adaptation in Animals", "Soil and Rocks", "Photosynthesis", "Classification of Living Things", "Food and Nutrition", "Teeth and Digestion", "Bones and Muscles", "Water Conservation", "Air Composition"],
  "SK-Term 2-3rd-EVS/Science": ["Food Chain", "Water Cycle", "Air Pressure", "Types of Soil", "Pollination", "Animal Life Cycles", "Materials and Properties", "Magnets", "Force (Push and Pull)", "Environmental Pollution"],
  "SK-Term 3-3rd-EVS/Science": ["Human Body", "Force and Motion", "Light and Shadow", "Sound and Vibration", "Simple Machines", "Electricity (intro)", "Solar System", "Natural Disasters", "Conservation of Resources", "Science Projects"],
  "SK-Term 1-3rd-Social Studies": ["Maps and Directions", "Physical Features of India", "Our State Tamil Nadu", "Globe and Maps", "Landforms", "Water Bodies", "Compass Directions", "Map Symbols", "Districts of Tamil Nadu", "Neighbouring States"],
  "SK-Term 2-3rd-Social Studies": ["Climate", "Agriculture of India", "Industries", "Crops (Rabi, Kharif)", "Types of Industries", "Communication", "Rural and Urban Life", "Trade and Commerce", "Ports and Airports", "Indian Railways"],
  "SK-Term 3-3rd-Social Studies": ["Transport and Communication", "Our Government", "Environmental Care", "Local Government", "Indian Parliament", "Fundamental Rights", "Continents and Oceans", "Countries and Capitals", "International Organizations", "Environmental Protection"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 4
  // ══════════════════════════════════════════════════════
  "SK-Term 1-4th-Tamil":    ["இயற்கை (கவிதை)", "உரைநடை", "தமிழ் இலக்கணம்", "காலம் (இறந்த/நிகழ்/எதிர்)", "வினா வகைகள்", "வேற்றுமை உருபுகள்", "அணிகள் (உவமை, உருவகம்)", "திருக்குறள் (அறத்துப்பால்)", "கட்டுரை (இயற்கை காப்போம்)", "கடிதம் (முறையான & அனுசார)", "கதை எழுதுதல்", "பாடல் பொருள் விளக்கம்", "மரபுத்தொடர் & பழமொழி"],
  "SK-Term 2-4th-Tamil":    ["வீரமாமுனிவர்", "செய்யுள்", "பாரதியார் பாடல்", "சந்திப் பிழை திருத்தம்", "சொல் வகைகள் (தொழிற்பெயர், வினையெச்சம்)", "உவமை & உருவகம்", "பத்தி எழுதுதல்", "நாட்குறிப்பு எழுதுதல்", "செய்தி எழுதுதல்", "உரையாடல் எழுதுதல்", "புணர்ச்சி விதிகள்", "படிக்கும் பகுதி"],
  "SK-Term 3-4th-Tamil":    ["திருக்குறள்", "அன்றாட வாழ்வில் தமிழ்", "மரபுவழி சொற்கள்", "தொகை நிலைத் தொடர்", "அணி இலக்கணம்", "வினா எழுதுதல்", "சுருக்கி எழுதுதல்", "விளம்பரம் எழுதுதல்", "பேச்சுப் பயிற்சி", "கவிதை எழுதுதல்", "மொழிபெயர்ப்பு (எளிய)", "இலக்கண மதிப்பீடு"],
  "SK-Term 1-4th-English":  ["Environment", "Alice in Wonderland (excerpts)", "Active and Passive Voice", "Tenses (Past, Present, Future)", "Letter Writing (Formal & Informal)", "Comprehension Passage", "Nouns (Abstract, Material)", "Pronouns (Reflexive, Relative)", "Adjectives (Order of Adjectives)", "Subject-Verb Agreement", "Modals (can, may, must, should)", "Homophones & Homonyms", "Story Completion", "Idioms & Phrases"],
  "SK-Term 2-4th-English":  ["Space", "Direct and Indirect Speech", "Paragraph Writing", "Conjunctions (because, although)", "Prefix and Suffix", "Notice Writing", "Tenses (Continuous & Perfect)", "Clauses (Main and Subordinate)", "Adverbs (Manner, Place, Time)", "Comprehension (Unseen Passage)", "Diary Entry", "Message Writing", "One Word Substitution", "Interjections & Exclamations"],
  "SK-Term 3-4th-English":  ["Famous Personalities", "Prepositions", "Essay Writing", "Synonyms and Antonyms", "Report Writing", "Dialogue Writing", "Precis Writing", "Formal Letter (Complaint, Request)", "Creative Writing (Autobiography of a Pen)", "Poetry Appreciation", "Proverbs & Their Meanings", "Degrees of Comparison", "Editing & Omission Exercises", "Comprehension (Poetry & Prose)"],
  "SK-Term 1-4th-Maths":    ["Large Numbers (Lakhs, Crores)", "Factors and Multiples (LCM, HCF)", "Fractions", "Place Value (Indian & International)", "Roman Numerals (I–C)", "Prime and Composite Numbers", "Divisibility Rules", "Addition & Subtraction of Fractions", "Geometry (Angles)", "Patterns and Sequences", "Estimation and Rounding", "Word Problems (Multi-step)"],
  "SK-Term 2-4th-Maths":    ["Decimals", "Percentage (intro)", "Geometry – Angles", "Multiplication of Decimals", "Division of Decimals", "Fractions to Decimals", "Profit and Loss (intro)", "Perimeter of Polygons", "Area of Rectangle & Square", "Data Handling (Bar Graph)", "Symmetry & Rotation", "BODMAS Rule"],
  "SK-Term 3-4th-Maths":    ["Area and Perimeter", "Volume", "Data Handling – Bar Graphs", "Speed, Distance, Time (intro)", "Unitary Method", "Ratio (intro)", "Geometry (Circles)", "Nets of 3D Shapes", "Calendar and Time Problems", "Average", "Maths Puzzles", "Review & Assessment"],
  "SK-Term 1-4th-EVS/Science": ["Human Body – Organ Systems", "Food Chain", "Rocks and Minerals", "Digestive System", "Respiratory System", "Circulatory System", "Types of Rocks", "Soil Erosion", "Food Preservation", "Microorganisms"],
  "SK-Term 2-4th-EVS/Science": ["Reproduction in Plants", "Solar System", "Force and Pressure", "Seed Dispersal", "Planets and Features", "Gravity", "Friction", "Simple Machines", "Energy (Kinetic, Potential)", "Renewable Energy"],
  "SK-Term 3-4th-EVS/Science": ["Light (Reflection)", "Sound", "Electricity (intro)", "Mirrors and Lenses", "Musical Instruments & Sound", "Electric Circuits", "Conductors & Insulators", "Natural Resources Conservation", "Weather Instruments", "Science in Daily Life"],
  "SK-Term 1-4th-Social Studies": ["Physical Features of India", "Climate Zones", "Soils and Vegetation", "Mountain Ranges", "Rivers of India", "Plateaus and Plains", "Natural Vegetation Types", "Wildlife Sanctuaries", "Mineral Resources", "Map Reading"],
  "SK-Term 2-4th-Social Studies": ["Agriculture", "Industries", "Transport and Trade", "Major Crops of India", "Types of Industries", "Import and Export", "Means of Transport", "Digital India", "Banking and Savings", "Cooperative Societies"],
  "SK-Term 3-4th-Social Studies": ["Our Constitution (intro)", "Human Rights", "World Continents", "Fundamental Rights & Duties", "Indian Parliament", "Local Self Government", "World Countries & Capitals", "United Nations", "International Boundaries", "Environmental Laws"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 5
  // ══════════════════════════════════════════════════════
  "SK-Term 1-5th-Tamil":    ["வீரமாமுனிவர்", "பாரதியார் கவிதை", "திருக்குறள் (அதிகாரம் 1–5)", "இலக்கணம் – வேற்றுமை", "வினா வகைகள்", "அணிகள் (உவமை, உருவகம், தற்குறிப்பேற்றம்)", "கட்டுரை (தமிழின் சிறப்பு)", "முறையான கடிதம்", "உரையாடல் எழுதுதல்", "செய்யுள் விளக்கம்", "மொழிபெயர்ப்பு", "அறிக்கை எழுதுதல்", "பேச்சுப் பயிற்சி"],
  "SK-Term 2-5th-Tamil":    ["ஔவையார் பாடல்கள்", "உரைநடை", "இலக்கணம் – சொல் வகைகள்", "காலம் (எல்லா வடிவங்கள்)", "சந்திப் பிழை & எழுத்துப் பிழை", "புணர்ச்சி விதிகள்", "நாட்குறிப்பு எழுதுதல்", "செய்தி எழுதுதல்", "பத்தி எழுதுதல்", "சுருக்கி எழுதுதல்", "விளம்பரம் எழுதுதல்", "அகராதிப் பயன்பாடு", "படிக்கும் பகுதி"],
  "SK-Term 3-5th-Tamil":    ["திருவாசகம்", "நவீன கவிதை", "தமிழ் இலக்கண – தொடர்", "அணி இலக்கணம் (மொத்த மதிப்பீடு)", "கவிதை எழுதுதல்", "கதை எழுதுதல்", "விவாதம் எழுதுதல்", "மொழிபெயர்ப்பு", "சொல் வளம் & மரபுத்தொடர்", "திருக்குறள் (பொருட்பால்)", "படைப்பாற்றல் எழுத்து", "இலக்கண & இலக்கிய மதிப்பீடு"],
  "SK-Term 1-5th-English":  ["Famous Personalities", "Clauses and Phrases", "Essay Writing", "Tenses (All Forms – Simple, Continuous, Perfect)", "Letter Writing (Formal & Informal)", "Subject-Verb Agreement", "Active and Passive Voice", "Direct and Indirect Speech", "Modals (shall, will, would, could)", "Figures of Speech (Simile, Metaphor)", "Vocabulary – Idioms & Proverbs", "Paragraph Writing", "Autobiography Writing", "Comprehension (Prose & Poetry)"],
  "SK-Term 2-5th-English":  ["Environment and Conservation", "Reported Speech", "Formal Letter", "Active and Passive Voice", "Comprehension (Prose & Poetry)", "Diary Entry", "Tenses (Perfect Continuous)", "Conditional Sentences (If...then)", "Degrees of Comparison", "Editing & Omission", "Precis Writing", "Message & Email Writing", "One Word Substitution", "Comprehension (Unseen Passage)"],
  "SK-Term 3-5th-English":  ["Technology and Science", "Idioms and Proverbs", "Story Writing", "Dialogue Writing", "Notice and Message Writing", "Precis Writing", "Report Writing", "Debate Writing", "Poetry Appreciation & Analysis", "Clauses (Adverb, Adjective, Noun)", "Transformation of Sentences", "Punctuation (Colon, Semicolon, Dash)", "Creative Writing (Speech, Script)", "Spelling & Grammar Review"],
  "SK-Term 1-5th-Maths":    ["LCM and HCF", "Ratio and Proportion", "Percentage", "Prime Factorization", "Unitary Method", "Fractions (All Operations)", "Decimals (All Operations)", "Geometry (Triangles)", "Mensuration (Area of Triangle)", "Number System (Indian & International)", "BODMAS", "Word Problems (Advanced)"],
  "SK-Term 2-5th-Maths":    ["Profit and Loss", "Simple Interest", "Algebra (intro)", "Discount and Tax", "Variables and Expressions", "Linear Equations", "Geometry (Circles)", "Data Handling (Pie Charts, Mean, Median)", "Speed, Distance, Time", "Symmetry and Transformation", "Integers (intro)", "Patterns & Sequences"],
  "SK-Term 3-5th-Maths":    ["Geometry (Quadrilaterals)", "Data Handling – Pie Charts", "Patterns", "Volume and Surface Area", "Coordinate Geometry (intro)", "Probability (intro)", "Ratio (Advanced)", "Exponents (intro)", "Maths Olympiad Practice", "Revision (Fractions, Decimals, %)", "Logical Reasoning", "Mental Maths"],
  "SK-Term 1-5th-EVS/Science": ["Reproduction in Plants and Animals", "Human Digestive System", "Ecosystems", "Nervous System", "Excretory System", "Cell Structure (intro)", "Food Chains and Webs", "Biodiversity", "Adaptation", "Nutrition (Vitamins, Minerals, Proteins)"],
  "SK-Term 2-5th-EVS/Science": ["Electricity and Circuits", "Light (Lenses)", "Matter (States)", "Series & Parallel Circuits", "Reflection & Refraction", "Changes of State", "Chemical vs Physical Changes", "Acids, Bases, Salts (intro)", "Magnetism", "Energy Conservation"],
  "SK-Term 3-5th-EVS/Science": ["Environment and Conservation", "Space", "Technology in Daily Life", "Climate Change", "Waste Management (3Rs)", "Satellites & Space Stations", "Internet & Communication", "Renewable Energy", "Water Purification", "Science Projects"],
  "SK-Term 1-5th-Social Studies": ["Ancient Civilizations", "Indian Constitution", "Natural Resources", "Indus Valley Civilization", "Vedic Period", "Fundamental Rights & Duties", "Directive Principles", "Minerals and Mining", "Forests and Wildlife", "Maps and Scales"],
  "SK-Term 2-5th-Social Studies": ["Freedom Struggle of India", "Five Year Plans", "World Geography", "Mahatma Gandhi", "Quit India Movement", "Economic Planning", "Continents in Detail", "Major Countries", "World Climate Zones", "Population and Urbanization"],
  "SK-Term 3-5th-Social Studies": ["Human Rights and Democracy", "Global Warming", "United Nations", "Elections and Voting", "International Courts", "Greenhouse Effect", "Ozone Layer", "UN Agencies (UNICEF, UNESCO)", "India's Foreign Policy", "Sustainable Development Goals"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 1
  // ══════════════════════════════════════════════════════
  "MB-Term 1-1st-English":          ["The Little Red Hen", "Phonics – Consonant Blends", "Articles a/an", "Naming Words (Nouns)", "Singular and Plural", "Rhyming Words", "Vowels and Consonants", "Common and Proper Nouns", "Action Words (Verbs)", "Sight Words Practice", "Picture Description", "Sentence Rearrangement", "Opposites (Antonyms)", "Gender (Masculine/Feminine)"],
  "MB-Term 2-1st-English":          ["The Magic Drum (Story)", "Nouns (Common & Proper)", "Action Verbs", "Is/Am/Are", "Opposites", "Picture Composition", "Prepositions (in, on, under, near)", "Describing Words (big, tall, red)", "Tenses – Present Simple (I eat, She reads)", "Question Words (What, Where, Who)", "Punctuation (Full Stop, Question Mark)", "Compound Words", "Days and Months", "Story Retelling"],
  "MB-Term 3-1st-English":          ["The Honest Woodcutter", "Adjectives", "Simple Sentences & Punctuation", "Prepositions (in, on, under)", "Reading Comprehension", "Story Sequencing", "Conjunctions (and, but, or)", "Letter Writing (Informal – to a Friend)", "Synonyms (happy/glad)", "Antonyms (hot/cold)", "Singular and Plural (Irregular)", "Creative Writing (My Pet, My School)", "Comprehension Passage (Short)", "Dictation & Spelling"],
  "MB-Term 1-1st-Maths":            ["Numbers 1–100", "Addition (2-Digit)", "Subtraction", "Place Value (Ones, Tens)", "Number Names", "Before/After/Between", "Comparing Numbers (>, <, =)", "Ordinal Numbers (1st–10th)", "Skip Counting (2s, 5s, 10s)", "Shapes (2D)", "Patterns (Repeating, Growing)", "Measurement (Length)"],
  "MB-Term 2-1st-Maths":            ["Multiplication (2x, 3x)", "Shapes and Patterns", "Measurement (CM)", "Addition Word Problems", "Subtraction Word Problems", "Number Line", "Even and Odd Numbers", "Symmetry", "Data Handling (Pictograph)", "3D Shapes (Cube, Cone, Cylinder)", "Fractions (Half, Quarter)", "Mental Maths"],
  "MB-Term 3-1st-Maths":            ["Division (intro)", "Money", "Time (Hours)", "Calendar Reading", "Weight and Capacity", "Multiplication Tables (2–5)", "Addition & Subtraction (3-Digit)", "Number Patterns", "Geometry (Lines, Curves)", "Data Handling (Tally Marks)", "Word Problems (Mixed)", "Review & Assessment"],
  "MB-Term 1-1st-EVS/Science":      ["Plants Around Us", "Animals and their Young Ones", "Air and Water", "My Body and Senses", "Living and Non-living Things", "Healthy Food", "Parts of a Plant", "Domestic and Wild Animals", "Water Sources", "Clean Environment"],
  "MB-Term 2-1st-EVS/Science":      ["Food and Nutrition", "Our Senses", "Soil", "Birds and their Features", "Insects", "Materials (Natural & Man-made)", "Safety Rules", "Seasons and Clothing", "Plants We Eat", "Personal Hygiene"],
  "MB-Term 3-1st-EVS/Science":      ["Weather", "Light and Shadow", "Simple Machines", "Day and Night", "Sound", "Recycling", "Animals in Different Habitats", "Water Cycle (intro)", "Environment Pollution", "Fun Science Experiments"],
  "MB-Term 1-1st-Social Studies":   ["My Home", "My School", "Community Helpers", "My Family", "My Address", "Rules and Responsibilities", "Neighbours", "Things We Need", "Festivals We Celebrate", "Good Manners"],
  "MB-Term 2-1st-Social Studies":   ["Our Village and City", "Transport and Communication", "Markets", "Occupations", "Post Office", "Hospital", "Police Station", "Road Safety", "Public Places", "Maps (intro)"],
  "MB-Term 3-1st-Social Studies":   ["Our Country India", "National Symbols", "Festivals", "National Leaders", "States of India", "Indian Monuments", "Independence Day", "Republic Day", "Unity in Diversity", "Our National Flag"],
  "MB-Term 1-1st-General Knowledge":["Days, Months, Seasons", "National Symbols of India", "Famous Personalities", "Animals and their Sounds", "Fruits from Different Countries", "Indian Currency", "Colours of Rainbow", "Parts of a Computer", "National Anthem", "Famous Monuments"],
  "MB-Term 2-1st-General Knowledge":["Animals – Interesting Facts", "Space (Sun, Moon, Stars)", "Sports and Games", "Musical Instruments", "Festivals of India", "Birds and their Habitats", "Water Animals", "Healthy vs Junk Food", "Emergency Numbers", "Indian States & Capitals"],
  "MB-Term 3-1st-General Knowledge":["Inventions (Telephone, Bulb)", "India's History (intro)", "World Capitals (easy)", "Famous Scientists", "Olympic Sports", "Countries and Flags", "Natural Disasters", "Solar System", "World Records", "Environmental Awareness"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 2
  // ══════════════════════════════════════════════════════
  "MB-Term 1-2nd-English":          ["The Hen and the Bee (Story)", "Nouns – Singular & Plural", "Rhyming Words", "Articles (a, an, the)", "Prepositions", "Tenses (Present Simple)", "Pronouns (I, He, She, It)", "Common and Proper Nouns", "Collective Nouns (a flock, a herd)", "Gender (Masculine/Feminine)", "Countable & Uncountable Nouns", "Sentence Types (Statement, Question)", "Synonyms & Antonyms", "Picture Composition"],
  "MB-Term 2-2nd-English":          ["The Clever Crow (Story)", "Pronouns (I, He, She, They)", "Question Words", "Opposites (Antonyms)", "Conjunctions (and, but)", "Comprehension Passage", "Tenses – Past Simple (I went, She ate)", "Adjectives (Describing Words)", "Adverbs (slowly, quickly)", "Prefix (un-, re-)", "Suffix (-ful, -ly, -ness)", "Homophones (to/two/too)", "Paragraph Writing", "Dictation & Spelling"],
  "MB-Term 3-2nd-English":          ["A Rainy Day (Poem)", "Adjectives", "Simple Story Writing", "Letter Writing (Informal)", "Punctuation", "Picture Composition", "Tenses – Future Simple (I will go)", "Essay Writing (My Best Friend, My Pet)", "Diary Entry", "Comprehension (Prose)", "Direct Speech (He said, \"Hello\")", "Singular & Plural (Irregular: child/children)", "Word Building (root words)", "Reading Aloud Practice"],
  "MB-Term 1-2nd-Maths":            ["3-Digit Numbers", "Addition with Carry", "Subtraction with Borrow", "Place Value (Hundreds, Tens, Ones)", "Number Names (up to 999)", "Comparing & Ordering Numbers", "Even and Odd Numbers", "Skip Counting (3s, 4s)", "Shapes and Symmetry", "Measurement (cm, m)", "Patterns (Number & Shape)", "Word Problems (Addition/Subtraction)"],
  "MB-Term 2-2nd-Maths":            ["Multiplication Tables 2–5", "Division (Basic)", "Fractions (Half, Quarter)", "Multiplication Word Problems", "Division Word Problems", "Time (Hours & Half Hours)", "Money (Addition & Subtraction)", "Geometry (Lines, Angles intro)", "Data Handling (Pictograph)", "Number Patterns", "Mental Maths", "Estimation"],
  "MB-Term 3-2nd-Maths":            ["Time and Calendar", "Money", "Data Handling (Tally)", "Multiplication Tables 6–10", "Fractions (Comparing)", "Area (Counting Squares)", "Perimeter (intro)", "Weight (kg, g)", "Capacity (L, mL)", "4-Digit Numbers (intro)", "Roman Numerals (I–X)", "Revision & Problem Solving"],
  "MB-Term 1-2nd-EVS/Science":      ["Food and Health", "Water Cycle", "Animals (Adaptation)", "Balanced Diet", "Vitamins and Minerals", "Sources of Water", "Living and Non-living Things", "Habitats (Forest, Desert, Water)", "Teeth and Dental Care", "Personal Hygiene"],
  "MB-Term 2-2nd-EVS/Science":      ["Plants (Photosynthesis intro)", "Air (Uses)", "Soil Types", "Seeds and Germination", "Food Chain (intro)", "Pollution (Air, Water)", "Birds and Migration", "Insects and their Roles", "Materials (Solids, Liquids, Gases)", "Energy Sources"],
  "MB-Term 3-2nd-EVS/Science":      ["Weather and Seasons", "Simple Machines", "Light and Sound", "Magnets", "Human Body (Skeletal System)", "Rocks and Minerals", "Natural Disasters", "Conservation of Water", "Waste Management", "Fun Experiments"],
  "MB-Term 1-2nd-Social Studies":   ["Our Country India", "Landforms (Mountains, Plains)", "Rivers of India", "States and Union Territories", "Northern Plains", "Coastal Areas", "Maps and Directions", "Indian Ocean", "Himalayas", "Natural Resources"],
  "MB-Term 2-2nd-Social Studies":   ["Crops and Farming", "Occupations", "Transport", "Communication (Old and New)", "Industries (intro)", "Village and City Life", "Markets and Trade", "Banking (intro)", "Road Safety Rules", "Environmental Conservation"],
  "MB-Term 3-2nd-Social Studies":   ["Our Government", "National Symbols", "Environment Care", "Indian Constitution (intro)", "Rights and Duties", "Famous Freedom Fighters", "Indian Festivals", "Cultural Diversity", "World Map (Continents)", "Disaster Management (intro)"],
  "MB-Term 1-2nd-General Knowledge":["Inventions and Inventors", "World Records", "National Awards", "Famous Indian Scientists", "Currencies of the World", "Largest/Smallest/Tallest", "Indian Dances", "Musical Instruments", "Famous Books and Authors", "Abbreviations (UN, WHO)"],
  "MB-Term 2-2nd-General Knowledge":["Space Exploration", "Famous Scientists", "Countries and Capitals", "Olympic Games", "Nobel Prize Winners", "Wonders of the World", "Indian Rivers and Dams", "Birds (National Birds)", "Computer Basics", "First in India/World"],
  "MB-Term 3-2nd-General Knowledge":["World Leaders", "Sports Champions", "India's Heritage Sites", "Environmental Days", "Famous Temples and Monuments", "Indian Railways", "Important Dates in History", "World Organisations", "Science in Daily Life", "Current Affairs"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 3
  // ══════════════════════════════════════════════════════
  "MB-Term 1-3rd-English":          ["The Camel's Hump (Poem)", "Tenses (Past, Present, Future)", "Letter Writing (Formal & Informal)", "Nouns (Collective, Abstract)", "Singular & Plural (Irregular)", "Comprehension Passage", "Articles (a, an, the)", "Pronouns (Possessive: my, your)", "Adjectives (Comparison: tall, taller, tallest)", "Prepositions (at, by, for, with)", "Sentence Formation", "Vocabulary Building", "Story Writing", "Picture Composition"],
  "MB-Term 2-3rd-English":          ["The Brave Little Tailor", "Adverbs", "Comprehension Passage", "Prepositions", "Synonyms and Antonyms", "Paragraph Writing", "Active and Passive Voice", "Direct and Indirect Speech", "Conjunctions (because, although, since)", "Homophones & Homonyms", "Prefix and Suffix", "Diary Entry", "Notice Writing", "Dialogue Writing"],
  "MB-Term 3-3rd-English":          ["Robinson Crusoe (excerpts)", "Conjunctions", "Essay Writing", "Punctuation (Comma, Apostrophe, Exclamation)", "Story Writing", "Degrees of Comparison", "Subject-Verb Agreement", "Idioms and Phrases", "Comprehension (Poetry)", "Precis Writing", "Report Writing", "Creative Writing (Imaginary Story)", "Word Meanings & Definitions", "Spelling & Dictation"],
  "MB-Term 1-3rd-Maths":            ["4-Digit Numbers", "Multiplication (3-digit x 1)", "Division", "Place Value (Thousands)", "Roman Numerals (I–L)", "Factors and Multiples", "Fractions (Like Fractions)", "Geometry (Lines, Rays, Segments)", "Patterns (Number Sequences)", "Measurement (km, m, cm)", "Data Handling (Bar Graph)", "Word Problems (Multi-step)"],
  "MB-Term 2-3rd-Maths":            ["Fractions", "Decimals (intro)", "Geometry (Angles)", "Addition & Subtraction of Fractions", "Multiplication (2-digit x 2-digit)", "Division (Long Division)", "Time (AM/PM, 24-hour)", "Money (Bills & Budgets)", "Symmetry and Reflection", "Perimeter", "Number Patterns", "Estimation & Rounding"],
  "MB-Term 3-3rd-Maths":            ["Area and Perimeter", "Time and Distance", "Data Handling", "Volume (intro)", "Weight and Capacity", "Geometry (Triangles, Quadrilaterals)", "Decimals (Addition)", "Multiplication Tables (up to 12)", "Calendar & Date Problems", "Roman Numerals Review", "Problem Solving Strategies", "Maths Olympiad Practice"],
  "MB-Term 1-3rd-EVS/Science":      ["Plants and their Parts", "Adaptation in Animals", "Soil and Rocks", "Photosynthesis", "Living Things Classification", "Food and Nutrition", "Teeth and Digestion", "Bones and Muscles", "Water (Sources and Conservation)", "Air Composition"],
  "MB-Term 2-3rd-EVS/Science":      ["Food Chain and Ecosystem", "Water Cycle", "Air Pressure", "Types of Soil", "Pollination and Seed Dispersal", "Animal Life Cycles", "Materials and Properties", "Magnets and Magnetism", "Force (Push and Pull)", "Environmental Pollution"],
  "MB-Term 3-3rd-EVS/Science":      ["Human Body Systems", "Force and Motion", "Light and Shadow", "Sound and Vibration", "Simple Machines (Lever, Pulley)", "Electricity (Conductors, Insulators)", "Solar System", "Natural Disasters", "Conservation of Resources", "Science Experiments & Projects"],
  "MB-Term 1-3rd-Social Studies":   ["Maps and Directions", "Our State Tamil Nadu", "Physical Features of India", "Globe and Maps", "Landforms of India", "Water Bodies", "Compass Directions", "Symbols on Maps", "Districts of Tamil Nadu", "Neighbouring States"],
  "MB-Term 2-3rd-Social Studies":   ["Climate of India", "Agriculture", "Transport and Communication", "Crops of India (Rabi, Kharif)", "Industries (Small, Large)", "Means of Communication", "Rural and Urban Life", "Trade and Commerce", "Ports and Airports", "Indian Railways"],
  "MB-Term 3-3rd-Social Studies":   ["Industries of India", "Our Government", "World Geography (basic)", "Local Government (Panchayat, Municipality)", "Indian Parliament", "Fundamental Rights", "Continents and Oceans", "Countries and Capitals", "International Organizations", "Environmental Protection"],
  "MB-Term 1-3rd-General Knowledge":["Famous Scientists", "World Capitals", "Sports Champions", "Inventions and Inventors", "National Parks of India", "Indian Space Missions", "Currencies of the World", "Famous Books", "Computer Parts", "Important Days & Dates"],
  "MB-Term 2-3rd-General Knowledge":["India's Freedom Struggle", "Inventions", "Animals – Fun Facts", "World Records", "Indian Classical Dance Forms", "Musical Instruments", "Rivers and Dams", "States and Their Capitals", "Famous Temples", "Science Quiz"],
  "MB-Term 3-3rd-General Knowledge":["Nobel Prize Winners", "World Heritage Sites", "Technology Today", "Olympic Medal Winners", "Environmental Champions", "Indian Defence Forces", "World Organisations (UN, WHO)", "Famous Paintings", "General Science Facts", "Current Affairs"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 4
  // ══════════════════════════════════════════════════════
  "MB-Term 1-4th-English":          ["Alice in Wonderland (Chapter 1)", "Active and Passive Voice", "Paragraph Writing", "Tenses (Past, Present, Future)", "Letter Writing (Formal & Informal)", "Comprehension", "Nouns (Abstract, Material)", "Pronouns (Reflexive, Relative)", "Adjectives (Order of Adjectives)", "Subject-Verb Agreement", "Modals (can, may, must, should)", "Homophones & Homonyms", "Story Completion", "Idioms & Phrases"],
  "MB-Term 2-4th-English":          ["The Jungle Book (Story)", "Direct and Indirect Speech", "Dialogue Writing", "Prefix and Suffix", "Conjunctions (because, although)", "Notice Writing", "Tenses (Continuous & Perfect)", "Clauses (Main and Subordinate)", "Adverbs (Manner, Place, Time)", "Comprehension (Unseen Passage)", "Diary Entry", "Message Writing", "One Word Substitution", "Interjections & Exclamations"],
  "MB-Term 3-4th-English":          ["Gulliver's Travels (excerpts)", "Prepositions", "Report Writing", "Synonyms and Antonyms", "Essay Writing", "Subject-Verb Agreement", "Precis Writing", "Formal Letter (Complaint, Request)", "Creative Writing (Autobiography of a Pen)", "Poetry Appreciation", "Proverbs & Their Meanings", "Degrees of Comparison", "Editing & Omission Exercises", "Reading Comprehension (Poetry & Prose)"],
  "MB-Term 1-4th-Maths":            ["Large Numbers (Lakhs, Crores)", "Factors and Multiples (LCM, HCF)", "Fractions", "Place Value (Indian & International)", "Roman Numerals (I–C)", "Prime and Composite Numbers", "Divisibility Rules", "Addition & Subtraction of Fractions", "Geometry (Angles – Acute, Obtuse, Right)", "Patterns and Sequences", "Estimation and Rounding", "Word Problems (Multi-step)"],
  "MB-Term 2-4th-Maths":            ["Decimals", "Percentage (intro)", "Geometry – Angles and Lines", "Multiplication of Decimals", "Division of Decimals", "Converting Fractions to Decimals", "Profit and Loss (intro)", "Perimeter of Polygons", "Area of Rectangle & Square", "Data Handling (Bar Graph, Pie Chart intro)", "Symmetry & Rotation", "BODMAS Rule"],
  "MB-Term 3-4th-Maths":            ["Area and Perimeter", "Volume (Cuboid, Cube)", "Data Handling – Bar Graphs", "Speed, Distance, Time (intro)", "Unitary Method", "Ratio (intro)", "Geometry (Circles)", "Nets of 3D Shapes", "Calendar and Time Problems", "Average", "Maths Puzzles & Olympiad", "Review & Assessment"],
  "MB-Term 1-4th-EVS/Science":      ["Human Body – Organ Systems", "Food Chain and Food Web", "Rocks and Minerals", "Digestive System", "Respiratory System", "Circulatory System", "Types of Rocks", "Soil Erosion", "Food Preservation", "Microorganisms (Bacteria, Fungi)"],
  "MB-Term 2-4th-EVS/Science":      ["Reproduction in Plants", "Solar System", "Force and Pressure", "Seed Dispersal Methods", "Planets and their Features", "Gravity", "Friction", "Simple Machines (All Types)", "Energy (Kinetic, Potential)", "Renewable and Non-renewable Energy"],
  "MB-Term 3-4th-EVS/Science":      ["Light (Reflection)", "Sound", "Electricity (intro)", "Mirrors and Lenses", "Musical Instruments and Sound", "Electric Circuits", "Conductors and Insulators", "Natural Resources Conservation", "Weather Instruments", "Science in Everyday Life"],
  "MB-Term 1-4th-Social Studies":   ["Physical Features of India", "Climate Zones", "Soils and Vegetation", "Mountain Ranges of India", "Rivers of India (Origin, Course)", "Plateaus and Plains", "Natural Vegetation Types", "Wildlife Sanctuaries", "Mineral Resources", "Map Reading Skills"],
  "MB-Term 2-4th-Social Studies":   ["Agriculture and Industries", "Transport and Trade", "Occupations", "Major Crops of India", "Types of Industries", "Import and Export", "Means of Transport (Evolution)", "Digital India", "Banking and Savings", "Cooperative Societies"],
  "MB-Term 3-4th-Social Studies":   ["Our Constitution (intro)", "Human Rights", "World – Continents and Oceans", "Fundamental Rights & Duties", "Indian Parliament (Lok Sabha, Rajya Sabha)", "Local Self Government", "World Countries & Capitals", "United Nations", "International Boundaries", "Environmental Laws"],
  "MB-Term 1-4th-General Knowledge":["Space Exploration", "World Leaders", "Indian History (Mughal Era)", "ISRO Missions", "Chandrayaan & Mangalyaan", "World Presidents & PMs", "Mughal Emperors", "Indian Art and Architecture", "Famous Indian Women", "Awards and Honours"],
  "MB-Term 2-4th-General Knowledge":["Famous Scientists and Inventions", "UNESCO Heritage Sites", "Sports Records", "Nobel Prize Winners", "World Heritage Sites in India", "Cricket World Cup Winners", "Olympic Records", "Largest/Longest/Highest", "Computer and Internet", "Indian Classical Music"],
  "MB-Term 3-4th-General Knowledge":["Technology Milestones", "Environment and Climate", "Current Affairs (easy)", "AI and Robotics (intro)", "Climate Change", "Recent Events India", "International Days", "Endangered Species", "Indian Defence", "GK Quiz Practice"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 5
  // ══════════════════════════════════════════════════════
  "MB-Term 1-5th-English":          ["Adventures of Tom Sawyer", "Clauses and Phrases", "Essay Writing", "Tenses (All Forms – Simple, Continuous, Perfect)", "Letter Writing (Formal & Informal)", "Comprehension (Prose & Poetry)", "Active and Passive Voice", "Direct and Indirect Speech", "Modals (shall, will, would, could)", "Subject-Verb Agreement", "Figures of Speech (Simile, Metaphor)", "Vocabulary – Idioms & Proverbs", "Paragraph Writing", "Autobiography Writing"],
  "MB-Term 2-5th-English":          ["Treasure Island (Story)", "Reported Speech", "Formal Letter Writing", "Active and Passive Voice", "Diary Entry", "Notice Writing", "Tenses (Perfect Continuous)", "Conditional Sentences (If...then)", "Degrees of Comparison", "Editing & Omission", "Precis Writing", "Message & Email Writing", "One Word Substitution", "Comprehension (Unseen Passage)"],
  "MB-Term 3-5th-English":          ["Oliver Twist (excerpts)", "Idioms and Proverbs", "Story Writing", "Dialogue Writing", "Precis Writing", "Subject-Verb Agreement", "Report Writing", "Debate Writing", "Poetry Appreciation & Analysis", "Clauses (Adverb, Adjective, Noun)", "Transformation of Sentences", "Punctuation (Colon, Semicolon, Dash)", "Creative Writing (Speech, Script)", "Spelling & Grammar Review"],
  "MB-Term 1-5th-Maths":            ["LCM and HCF", "Ratio and Proportion", "Percentage", "Prime Factorization", "Unitary Method", "Fractions (Addition, Subtraction, Multiplication)", "Decimals (All Operations)", "Geometry (Triangles – Types & Properties)", "Mensuration (Area of Triangle)", "Number System (Indian & International)", "BODMAS", "Word Problems (Advanced)"],
  "MB-Term 2-5th-Maths":            ["Profit and Loss", "Simple Interest", "Algebra (intro)", "Discount and Tax", "Variables and Expressions", "Linear Equations", "Geometry (Circles – Circumference, Area)", "Data Handling (Pie Charts, Mean, Median)", "Speed, Distance, Time", "Symmetry and Transformation", "Integers (intro)", "Patterns & Sequences"],
  "MB-Term 3-5th-Maths":            ["Geometry (Quadrilaterals)", "Data Handling – Pie Charts", "Patterns and Sequences", "Volume and Surface Area", "Coordinate Geometry (intro)", "Probability (intro)", "Ratio and Proportion (Advanced)", "Exponents (intro)", "Maths Olympiad Practice", "Revision (Fractions, Decimals, Percentage)", "Logical Reasoning", "Mental Maths Championship"],
  "MB-Term 1-5th-EVS/Science":      ["Reproduction in Plants and Animals", "Human Digestive System", "Ecosystems", "Nervous System", "Excretory System", "Cell Structure (intro)", "Food Chains and Webs", "Biodiversity", "Adaptation (Plants & Animals)", "Nutrition (Vitamins, Minerals, Proteins)"],
  "MB-Term 2-5th-EVS/Science":      ["Electricity and Circuits", "Light (Lenses)", "Matter (States)", "Series and Parallel Circuits", "Reflection and Refraction", "Changes of State", "Chemical Changes vs Physical Changes", "Acids, Bases, Salts (intro)", "Magnetism", "Energy Conservation"],
  "MB-Term 3-5th-EVS/Science":      ["Environment and Conservation", "Space – Planets and Satellites", "Technology in Daily Life", "Climate Change", "Waste Management (3Rs)", "Satellites and Space Stations", "Internet and Communication", "Renewable Energy", "Water Purification", "Science Projects & Experiments"],
  "MB-Term 1-5th-Social Studies":   ["Ancient Civilizations", "Indian Constitution", "Natural Resources", "Indus Valley Civilization", "Vedic Period", "Fundamental Rights & Duties", "Directive Principles", "Minerals and Mining", "Forests and Wildlife", "Maps and Scales"],
  "MB-Term 2-5th-Social Studies":   ["Freedom Struggle of India", "Five Year Plans", "World Geography", "Mahatma Gandhi", "Quit India Movement", "Economic Planning", "Continents in Detail", "Major Countries", "World Climate Zones", "Population and Urbanization"],
  "MB-Term 3-5th-Social Studies":   ["Human Rights and Democracy", "Global Warming", "United Nations", "Elections and Voting", "International Courts", "Greenhouse Effect", "Ozone Layer", "UN Agencies (UNICEF, UNESCO)", "India's Foreign Policy", "Sustainable Development Goals"],
  "MB-Term 1-5th-General Knowledge":["Nobel Prize Winners", "India's Space Missions", "World Records", "Chandrayaan, Mangalyaan, Gaganyaan", "Guinness Records", "Famous Indians Abroad", "International Awards", "Indian Defence Forces", "Nuclear Energy", "Famous Quotes"],
  "MB-Term 2-5th-General Knowledge":["Famous Inventions and Inventors", "World Heritage Sites", "Sports Champions", "Technology Pioneers", "UNESCO Sites in India", "Commonwealth Games", "Asian Games", "Computer Science Basics", "Indian Postal Service", "General Science Quiz"],
  "MB-Term 3-5th-General Knowledge":["Current Affairs India", "Technology and AI", "Environmental Heroes", "Recent Government Schemes", "Digital India", "Greta Thunberg & Climate Activists", "Indian Start-ups", "World Health (WHO)", "Famous Museums", "GK Olympiad Practice"],

  // ══════════════════════════════════════════════════════
  // HINDI TOPICS (Samacheer & Merry Birds) — CLASS 1–5
  // ══════════════════════════════════════════════════════
  "SK-Term 1-1st-Hindi":    ["स्वर (अ, आ, इ, ई)", "व्यंजन (क-ङ)", "मेरा परिवार", "गिनती 1-10", "फल के नाम", "जानवरों के नाम", "रंगों के नाम", "शरीर के अंग", "मेरा नाम लिखो", "चित्र देखो शब्द लिखो"],
  "SK-Term 2-1st-Hindi":    ["व्यंजन (च-ञ)", "फल और सब्जियाँ", "जानवर", "सब्जियों के नाम", "पक्षियों के नाम", "विलोम शब्द (बड़ा/छोटा)", "मेरा विद्यालय", "वाहनों के नाम", "दिनों के नाम", "सरल शब्द पढ़ो"],
  "SK-Term 3-1st-Hindi":    ["व्यंजन (ट-न)", "रंग", "मेरा विद्यालय", "व्यंजन (प-ह)", "दो अक्षर के शब्द", "सरल वाक्य बनाओ", "चित्र देखो कहानी सुनाओ", "त्योहार", "अच्छी आदतें", "कविता पढ़ो"],
  "SK-Term 1-2nd-Hindi":    ["मात्राएँ (आ, इ, ई)", "सरल वाक्य", "गिनती 1-20", "विलोम शब्द", "वचन (एकवचन/बहुवचन)", "लिंग (स्त्रीलिंग/पुल्लिंग)", "संज्ञा (नाम शब्द)", "चित्र वर्णन", "शब्द जोड़ो", "सही शब्द चुनो"],
  "SK-Term 2-2nd-Hindi":    ["मात्राएँ (उ, ऊ, ए)", "विलोम शब्द", "शरीर के अंग", "पर्यायवाची शब्द", "सर्वनाम (मैं, तुम, वह)", "क्रिया (काम वाले शब्द)", "तीन अक्षर के शब्द", "कहानी पढ़ो और प्रश्न उत्तर दो", "पत्र लेखन (अनौपचारिक)", "श्रुतलेख"],
  "SK-Term 3-2nd-Hindi":    ["मात्राएँ (ऐ, ओ, औ)", "पर्यायवाची शब्द", "त्योहार", "अनुस्वार (अं) और विसर्ग (अः)", "संयुक्त अक्षर", "वाक्य बनाओ", "कविता लेखन (सरल)", "कहानी लेखन", "चित्र देखो कहानी लिखो", "वर्ण विच्छेद", "शब्द भंडार", "रिक्त स्थान भरो"],
  "SK-Term 1-3rd-Hindi":    ["संज्ञा", "सर्वनाम", "कहानी - चतुर लोमड़ी", "संज्ञा के भेद (व्यक्तिवाचक, जातिवाचक, भाववाचक)", "विशेषण", "क्रिया", "विलोम शब्द", "पर्यायवाची शब्द", "वचन", "लिंग", "अनुच्छेद लेखन", "पत्र लेखन", "मुहावरे (सरल)", "वाक्य शुद्धि"],
  "SK-Term 2-3rd-Hindi":    ["विशेषण", "क्रिया", "पत्र लेखन", "काल (भूत, वर्तमान, भविष्य)", "वाक्य के भेद (कथन, प्रश्न, आज्ञा)", "समानार्थी शब्द", "कारक (ने, को, से)", "अनेक शब्दों के लिए एक शब्द", "कहानी लेखन", "संवाद लेखन", "अपठित गद्यांश", "श्रुतलेख"],
  "SK-Term 3-3rd-Hindi":    ["वचन", "लिंग", "निबंध - मेरा देश", "उपसर्ग (अन-, बे-, सु-)", "प्रत्यय (-पन, -ता, -आई)", "मुहावरे", "लोकोक्तियाँ", "पत्र लेखन (औपचारिक)", "कविता लेखन", "दिनचर्या लेखन", "चित्र वर्णन", "व्याकरण समीक्षा"],
  "SK-Term 1-4th-Hindi":    ["काल (भूत, वर्तमान, भविष्य)", "मुहावरे", "अनुच्छेद लेखन", "काल के भेद (सामान्य, अपूर्ण, पूर्ण)", "कारक और विभक्ति", "क्रिया विशेषण", "संज्ञा के भेद (विस्तार)", "अनेकार्थी शब्द", "निबंध लेखन", "संवाद लेखन", "सूचना लेखन", "कहानी पूर्ण करो", "विज्ञापन लेखन"],
  "SK-Term 2-4th-Hindi":    ["समास", "उपसर्ग और प्रत्यय", "कविता - प्रकृति", "समास के भेद (तत्पुरुष, द्वंद्व)", "संधि (स्वर संधि)", "अलंकार (उपमा, रूपक)", "पत्र लेखन (शिकायत, आवेदन)", "डायरी लेखन", "अपठित गद्यांश", "वाक्य रूपांतरण", "शब्द भंडार", "कविता की समझ"],
  "SK-Term 3-4th-Hindi":    ["संधि", "अलंकार", "कहानी लेखन", "संधि विच्छेद", "समास विग्रह", "मुहावरे और लोकोक्तियाँ", "निबंध (प्रदूषण, पर्यावरण)", "विज्ञापन लेखन", "रिपोर्ट लेखन", "कविता लेखन", "सारांश लेखन", "संपादन", "व्याकरण मूल्यांकन"],
  "SK-Term 1-5th-Hindi":    ["क्रिया विशेषण", "समुच्चय बोधक", "औपचारिक पत्र", "क्रिया विशेषण के भेद", "वाच्य (कर्तृवाच्य, कर्मवाच्य)", "संधि (व्यंजन संधि)", "समास (बहुव्रीहि, अव्ययीभाव)", "निबंध (विज्ञान, प्रौद्योगिकी)", "अपठित गद्यांश", "संवाद लेखन", "विवाद/वाद-विवाद", "अलंकार (अनुप्रास, यमक)", "सारांश लेखन"],
  "SK-Term 2-5th-Hindi":    ["रस", "छंद", "संवाद लेखन", "रस के भेद (श्रृंगार, वीर, करुण)", "छंद (दोहा, चौपाई)", "मुहावरे और लोकोक्तियाँ", "वाक्य रूपांतरण", "पत्र (प्रधानाचार्य को)", "डायरी लेखन", "ईमेल लेखन", "अपठित पद्यांश", "कविता की सराहना"],
  "SK-Term 3-5th-Hindi":    ["अपठित गद्यांश", "व्याकरण समीक्षा", "निबंध - विज्ञान", "कहानी लेखन (कल्पनात्मक)", "विवाद लेखन", "रिपोर्ट लेखन", "भाषण लेखन", "काव्य विश्लेषण", "संपादन", "वाक्य परिवर्तन", "शब्द भंडार मूल्यांकन", "साहित्य समीक्षा", "मुहावरे & लोकोक्तियाँ समीक्षा"],
  "MB-Term 1-1st-Hindi":    ["स्वर (अ-औ)", "व्यंजन (क-ङ)", "मेरा नाम", "गिनती 1-10", "फल के नाम", "जानवरों के नाम", "रंगों के नाम", "शरीर के अंग", "मेरा परिवार", "चित्र देखो शब्द लिखो"],
  "MB-Term 2-1st-Hindi":    ["व्यंजन (च-न)", "सरल शब्द", "जानवर", "पक्षियों के नाम", "सब्जियों के नाम", "विलोम शब्द (बड़ा/छोटा)", "दिनों के नाम", "मेरा विद्यालय", "वाहनों के नाम", "सरल वाक्य पढ़ो"],
  "MB-Term 3-1st-Hindi":    ["व्यंजन (प-ह)", "फल और सब्जियाँ", "रंग", "दो अक्षर के शब्द", "सरल वाक्य बनाओ", "त्योहार", "अच्छी आदतें", "चित्र देखो कहानी सुनाओ", "कविता पढ़ो", "मात्राएँ (intro)"],
  "MB-Term 1-2nd-Hindi":    ["मात्राएँ (आ, इ, ई)", "सरल वाक्य", "मेरा परिवार", "विलोम शब्द", "वचन (एकवचन/बहुवचन)", "लिंग", "संज्ञा (नाम शब्द)", "चित्र वर्णन", "शब्द जोड़ो", "सही शब्द चुनो"],
  "MB-Term 2-2nd-Hindi":    ["मात्राएँ (उ, ऊ, ए)", "विलोम शब्द", "त्योहार", "पर्यायवाची शब्द", "सर्वनाम", "क्रिया", "कहानी पढ़ो", "पत्र लेखन (अनौपचारिक)", "श्रुतलेख", "तीन अक्षर के शब्द"],
  "MB-Term 3-2nd-Hindi":    ["मात्राएँ (ऐ, ओ, औ)", "पर्यायवाची शब्द", "मेरा विद्यालय", "अनुस्वार (अं)", "संयुक्त अक्षर", "वाक्य बनाओ", "कविता लेखन", "कहानी लेखन", "चित्र देखो कहानी लिखो", "शब्द भंडार"],
  "MB-Term 1-3rd-Hindi":    ["संज्ञा और सर्वनाम", "कहानी पढ़ो", "गिनती 1-50", "संज्ञा के भेद", "विशेषण", "क्रिया", "विलोम शब्द", "पर्यायवाची", "वचन & लिंग", "अनुच्छेद लेखन", "पत्र लेखन", "मुहावरे (सरल)"],
  "MB-Term 2-3rd-Hindi":    ["विशेषण और क्रिया", "पत्र लेखन", "शरीर के अंग", "काल (भूत, वर्तमान, भविष्य)", "वाक्य के भेद", "कारक", "कहानी लेखन", "संवाद लेखन", "अपठित गद्यांश", "श्रुतलेख", "समानार्थी शब्द", "शब्द शुद्धि"],
  "MB-Term 3-3rd-Hindi":    ["वचन और लिंग", "निबंध", "प्रकृति", "उपसर्ग & प्रत्यय", "मुहावरे", "लोकोक्तियाँ", "कविता लेखन", "दिनचर्या लेखन", "चित्र वर्णन", "व्याकरण समीक्षा", "पत्र (औपचारिक)", "शब्द भंडार"],
  "MB-Term 1-4th-Hindi":    ["काल", "मुहावरे", "कविता", "काल के भेद", "कारक और विभक्ति", "क्रिया विशेषण", "अनेकार्थी शब्द", "निबंध लेखन", "संवाद लेखन", "सूचना लेखन", "कहानी पूर्ण करो", "विज्ञापन लेखन"],
  "MB-Term 2-4th-Hindi":    ["समास", "उपसर्ग-प्रत्यय", "कहानी लेखन", "समास के भेद", "संधि (स्वर)", "अलंकार", "पत्र (शिकायत)", "डायरी लेखन", "अपठित गद्यांश", "वाक्य रूपांतरण", "शब्द भंडार", "कविता की समझ"],
  "MB-Term 3-4th-Hindi":    ["संधि", "अलंकार", "अनुच्छेद लेखन", "संधि विच्छेद", "मुहावरे और लोकोक्तियाँ", "निबंध (पर्यावरण)", "रिपोर्ट लेखन", "कविता लेखन", "सारांश लेखन", "संपादन", "व्याकरण मूल्यांकन", "विज्ञापन लेखन"],
  "MB-Term 1-5th-Hindi":    ["क्रिया विशेषण", "औपचारिक पत्र", "अपठित गद्यांश", "वाच्य", "संधि (व्यंजन)", "समास (बहुव्रीहि)", "निबंध (विज्ञान)", "संवाद लेखन", "अलंकार (अनुप्रास)", "सारांश लेखन", "विवाद लेखन", "मुहावरे & लोकोक्तियाँ"],
  "MB-Term 2-5th-Hindi":    ["रस और छंद", "संवाद लेखन", "व्याकरण", "रस के भेद", "छंद (दोहा, चौपाई)", "मुहावरे & लोकोक्तियाँ", "वाक्य रूपांतरण", "पत्र (प्रधानाचार्य)", "डायरी लेखन", "अपठित पद्यांश", "कविता सराहना", "ईमेल लेखन"],
  "MB-Term 3-5th-Hindi":    ["समीक्षा", "निबंध - विज्ञान और प्रकृति", "कहानी", "कहानी (कल्पनात्मक)", "विवाद लेखन", "रिपोर्ट लेखन", "भाषण लेखन", "काव्य विश्लेषण", "संपादन", "वाक्य परिवर्तन", "शब्द भंडार", "साहित्य समीक्षा"],
};
// ─── Diagram SVG Components ──────────────────────────────────────────────
function DiagramSVG({ type, labels, colorMode }: { type?: string; labels?: string[]; colorMode?: boolean }) {
  const safeLabels = labels || ["Part 1", "Part 2", "Part 3", "Part 4"];

  if (type === "plant" || type?.includes("plant")) {
    return (
      <svg viewBox="0 0 300 290" className="w-64 h-56 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <line x1="150" y1="260" x2="150" y2="120" stroke={colorMode ? "#4ade80" : "#666"} strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="260" x2="100" y2="285" stroke={colorMode ? "#92400e" : "#888"} strokeWidth="3" />
        <line x1="150" y1="260" x2="130" y2="285" stroke={colorMode ? "#92400e" : "#888"} strokeWidth="3" />
        <line x1="150" y1="260" x2="170" y2="280" stroke={colorMode ? "#92400e" : "#888"} strokeWidth="3" />
        <ellipse cx="105" cy="170" rx="35" ry="18" fill={colorMode ? "#86efac" : "#ddd"} stroke={colorMode ? "#22c55e" : "#888"} strokeWidth="1.5" transform="rotate(-30 105 170)" />
        <line x1="150" y1="180" x2="105" y2="170" stroke={colorMode ? "#4ade80" : "#666"} strokeWidth="2" />
        <ellipse cx="195" cy="160" rx="35" ry="18" fill={colorMode ? "#86efac" : "#ddd"} stroke={colorMode ? "#22c55e" : "#888"} strokeWidth="1.5" transform="rotate(30 195 160)" />
        <line x1="150" y1="165" x2="195" y2="160" stroke={colorMode ? "#4ade80" : "#666"} strokeWidth="2" />
        <circle cx="150" cy="110" r="22" fill={colorMode ? "#fde68a" : "#eee"} stroke={colorMode ? "#f59e0b" : "#888"} strokeWidth="2" />
        <circle cx="150" cy="110" r="10" fill={colorMode ? "#f59e0b" : "#aaa"} />
        {[0,60,120,180,240,300].map((angle, i) => (
          <ellipse key={i} cx={150 + 22 * Math.cos((angle * Math.PI) / 180)} cy={110 + 22 * Math.sin((angle * Math.PI) / 180)} rx="10" ry="6" fill={colorMode ? "#fca5a5" : "#ccc"} transform={`rotate(${angle} ${150 + 22 * Math.cos((angle * Math.PI) / 180)} ${110 + 22 * Math.sin((angle * Math.PI) / 180)})`} />
        ))}
        <rect x="80" y="268" width="140" height="8" rx="4" fill={colorMode ? "#a16207" : "#999"} />
        <text x="15" y="115" fontSize="11" fill={colorMode ? "#166534" : "#333"} fontWeight="bold">Flower</text>
        <text x="55" y="140" fontSize="11" fill={colorMode ? "#166534" : "#333"}>Leaf</text>
        <text x="165" y="200" fontSize="11" fill={colorMode ? "#166534" : "#333"}>Stem</text>
        <text x="165" y="240" fontSize="11" fill={colorMode ? "#166534" : "#333"}>Root</text>
      </svg>
    );
  }

  if (type === "body" || type?.includes("body")) {
    return (
      <svg viewBox="0 0 200 260" className="w-48 h-56 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="35" r="28" fill={colorMode ? "#fde8d0" : "#eee"} stroke={colorMode ? "#d1a07a" : "#888"} strokeWidth="2" />
        <rect x="70" y="65" width="60" height="80" rx="8" fill={colorMode ? "#fde8d0" : "#eee"} stroke={colorMode ? "#d1a07a" : "#888"} strokeWidth="2" />
        <line x1="70" y1="75" x2="35" y2="140" stroke={colorMode ? "#d1a07a" : "#888"} strokeWidth="10" strokeLinecap="round" />
        <line x1="130" y1="75" x2="165" y2="140" stroke={colorMode ? "#d1a07a" : "#888"} strokeWidth="10" strokeLinecap="round" />
        <line x1="85" y1="145" x2="75" y2="220" stroke={colorMode ? "#d1a07a" : "#888"} strokeWidth="12" strokeLinecap="round" />
        <line x1="115" y1="145" x2="125" y2="220" stroke={colorMode ? "#d1a07a" : "#888"} strokeWidth="12" strokeLinecap="round" />
        <text x="115" y="30" fontSize="9" fill={colorMode ? "#1e3a5f" : "#333"} fontWeight="bold">Head</text>
        <text x="135" y="105" fontSize="9" fill={colorMode ? "#1e3a5f" : "#333"}>Arm</text>
        <text x="135" y="190" fontSize="9" fill={colorMode ? "#1e3a5f" : "#333"}>Leg</text>
      </svg>
    );
  }

  if (type === "solar" || type?.includes("solar")) {
    return (
      <svg viewBox="0 0 320 200" className="w-72 h-44 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="100" r="28" fill={colorMode ? "#fbbf24" : "#ddd"} />
        <text x="35" y="140" fontSize="9" fill={colorMode ? "#92400e" : "#333"} fontWeight="bold">Sun</text>
        {["Mercury","Venus","Earth","Mars","Jupiter"].map((p, i) => {
          const cx = 110 + i * 45;
          const r = [5, 7, 8, 6, 14][i];
          const color = colorMode ? ["#9ca3af","#fbbf24","#3b82f6","#ef4444","#f97316"][i] : ["#bbb","#ccc","#999","#aaa","#888"][i];
          return (
            <g key={p}>
              <circle cx={cx} cy={100} r={r} fill={color} />
              <text x={cx - 12} y={100 + r + 14} fontSize="7" fill="#374151">{p}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === "water_cycle" || type?.includes("water")) {
    return (
      <svg viewBox="0 0 320 200" className="w-72 h-48 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="160" width="320" height="40" rx="4" fill={colorMode ? "#93c5fd" : "#ddd"} opacity="0.5" />
        <text x="130" y="185" fontSize="10" fill={colorMode ? "#1e40af" : "#333"} fontWeight="bold">Ocean/Sea</text>
        <path d="M40 160 Q60 140 80 160" stroke={colorMode ? "#60a5fa" : "#999"} fill="none" strokeWidth="2" />
        <path d="M80 160 Q100 140 120 160" stroke={colorMode ? "#60a5fa" : "#999"} fill="none" strokeWidth="2" />
        <line x1="60" y1="150" x2="60" y2="70" stroke={colorMode ? "#f59e0b" : "#999"} strokeWidth="2" strokeDasharray="4" />
        <text x="70" y="110" fontSize="9" fill={colorMode ? "#b45309" : "#555"}>Evaporation ↑</text>
        <ellipse cx="160" cy="40" rx="60" ry="25" fill={colorMode ? "#d1d5db" : "#eee"} />
        <ellipse cx="130" cy="35" rx="30" ry="18" fill={colorMode ? "#e5e7eb" : "#f5f5f5"} />
        <text x="130" y="45" fontSize="9" fill="#374151" fontWeight="bold">Cloud</text>
        <line x1="200" y1="65" x2="250" y2="130" stroke={colorMode ? "#3b82f6" : "#999"} strokeWidth="2" strokeDasharray="4" />
        <text x="220" y="95" fontSize="9" fill={colorMode ? "#1d4ed8" : "#555"}>Rain ↓</text>
        <text x="240" y="155" fontSize="9" fill={colorMode ? "#15803d" : "#555"}>Condensation</text>
      </svg>
    );
  }

  if (type?.includes("map_india")) {
    return (
      <div className={`border-2 border-dashed rounded-xl p-4 ${colorMode ? "border-blue-400 bg-blue-50" : "border-gray-400 bg-gray-50"}`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Map className={`h-5 w-5 ${colorMode ? "text-blue-500" : "text-gray-500"}`} />
          <p className={`font-bold text-sm ${colorMode ? "text-blue-700" : "text-gray-700"}`}>Outline Map of India</p>
        </div>
        <div className="w-48 h-64 mx-auto border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
          <div className="text-center text-gray-300">
            <Map className="h-16 w-16 mx-auto opacity-30" />
            <p className="text-xs mt-2">[ India Map ]</p>
          </div>
        </div>
        <div className="mt-3 px-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mark the following on the map:</p>
          <div className="grid grid-cols-2 gap-2">
            {safeLabels.map((lbl, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-sm font-bold w-5 shrink-0 ${colorMode ? "text-blue-500" : "text-gray-500"}`}>{i + 1}.</span>
                <span className="text-sm text-gray-600">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type?.includes("map_world")) {
    return (
      <div className={`border-2 border-dashed rounded-xl p-4 ${colorMode ? "border-green-400 bg-green-50" : "border-gray-400 bg-gray-50"}`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Map className={`h-5 w-5 ${colorMode ? "text-green-500" : "text-gray-500"}`} />
          <p className={`font-bold text-sm ${colorMode ? "text-green-700" : "text-gray-700"}`}>Outline Map of the World</p>
        </div>
        <div className="w-72 h-48 mx-auto border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
          <div className="text-center text-gray-300">
            <Map className="h-16 w-16 mx-auto opacity-30" />
            <p className="text-xs mt-2">[ World Map ]</p>
          </div>
        </div>
        <div className="mt-3 px-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mark the following:</p>
          <div className="grid grid-cols-2 gap-2">
            {safeLabels.map((lbl, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-sm font-bold w-5 shrink-0 ${colorMode ? "text-green-500" : "text-gray-500"}`}>{i + 1}.</span>
                <span className="text-sm text-gray-600">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 border-dashed rounded-xl overflow-hidden ${colorMode ? "border-amber-400 bg-amber-50" : "border-gray-400 bg-gray-50"}`}>
      <div className="w-full h-52 flex flex-col items-center justify-center text-gray-300 gap-2 border-b-2 border-dashed border-gray-300">
        <PenLine className="h-12 w-12 opacity-30" />
        <p className="text-base font-bold text-gray-400">[ Draw here ]</p>
      </div>
      <div className="px-6 py-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Label the parts:</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {safeLabels.map((lbl, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`text-sm font-bold w-5 shrink-0 ${colorMode ? "text-amber-600" : "text-gray-500"}`}>{i + 1}.</span>
              <div className="flex-1 border-b-2 border-dashed border-gray-400 min-h-[1.5rem]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function QuestionPaper() {
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedPapers, setSavedPapers] = useState<{ id: string; title: string; subject: string; grade: string; term: string; examType: string; savedAt: number; paper: QuestionPaper }[]>([]);

  // Load saved papers on mount
  useEffect(() => {
    offlineDb.getAllQuestionPapers().then((papers) => {
      setSavedPapers(papers.sort((a: any, b: any) => b.savedAt - a.savedAt));
    });
  }, []);

  const [form, setForm] = useState({
    examType: "Quarterly",
    grade: "3rd",
    subject: "Maths",
    term: "Term 1",
    language: "English",
    topics: "",
    curriculum: "Samacheer Kalvi",
    questionPattern: "state_board",
    questionTypes: ["multiple_choice", "fill_in_blanks", "true_false", "match_following", "short_answer", "long_answer", "diagram"],
    hindiSyllabus: "none",
    bilingualPair: "English+Tamil",
  });

  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  // Update topic suggestions when curriculum/term/grade/subject changes
  useEffect(() => {
    const curricShort = form.curriculum === "Oxford Merry Birds" ? "MB" : "SK";
    const key = `${curricShort}-${form.term}-${form.grade}-${form.subject}`;
    setTopicSuggestions(QP_TOPIC_SUGGESTIONS[key] || []);
    setShowHints(false);
  }, [form.curriculum, form.term, form.grade, form.subject]);

  // Auto-set default pattern when curriculum changes
  const handleCurriculumChange = (curriculumId: string) => {
    const defaultPattern = curriculumId === "Oxford Merry Birds" ? "cbse" : "state_board";
    setForm(prev => ({ ...prev, curriculum: curriculumId, questionPattern: defaultPattern }));
  };

  const selectedExam = EXAM_TYPES.find((e) => e.id === form.examType)!;

  const toggleQuestionType = (typeId: string) => {
    setForm(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(typeId)
        ? prev.questionTypes.filter(t => t !== typeId)
        : [...prev.questionTypes, typeId],
    }));
  };

  const generate = async () => {
    if (!isOnline) {
      toast({ title: "You are offline 📶", description: "Question paper generation needs internet. View your saved papers below.", variant: "destructive" });
      setShowHistory(true);
      return;
    }
    if (form.questionTypes.length === 0) {
      toast({ title: "Select question types", description: "Please select at least one question type.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setPaper(null);
    setError(null);
    setShowAnswers(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout
      let res: Response;
      let fetchAttempt = 0;
      const maxAttempts = 3;
      while (true) {
        fetchAttempt++;
        try {
          res = await fetch(`${SUPABASE_URL}/functions/v1/generate-question-paper`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              ...form,
              totalMarks: selectedExam.marks,
              includeAnswerKey: true,
              randomSeed: Math.random(),
            }),
            signal: controller.signal,
          });
          break;
        } catch (fetchErr: any) {
          if (fetchAttempt >= maxAttempts) {
            clearTimeout(timeoutId);
            throw new Error(fetchErr.name === "AbortError"
              ? "Request timed out. Please check your internet connection and try again."
              : "Network error. Please check your internet and try again.");
          }
          await new Promise((r) => setTimeout(r, 5000 * fetchAttempt));
        }
      }
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
      // Mark all questions as selected and fix diagram types
      const paperData = data.paper;
      paperData.sections?.forEach((section: PaperSection) => {
        section.subsections?.forEach((sub: PaperSubsection) => {
          sub.questions?.forEach((q: PaperQuestion) => {
            q.selected = true;
            // Auto-detect diagramType from question text if missing or invalid
            if (sub.type === "diagram" && q.question) {
              const qt = (q.question + " " + (q.diagramType || "")).toLowerCase();
              if (!q.diagramType || q.diagramType.includes("|")) {
                if (qt.includes("plant") || qt.includes("flower") || qt.includes("leaf")) q.diagramType = "plant";
                else if (qt.includes("body") || qt.includes("human") || qt.includes("organ")) q.diagramType = "body";
                else if (qt.includes("solar") || qt.includes("planet") || qt.includes("sun")) q.diagramType = "solar";
                else if (qt.includes("water cycle") || qt.includes("evaporation") || qt.includes("condensation")) q.diagramType = "water_cycle";
                else if (qt.includes("india") || qt.includes("state") || qt.includes("river")) q.diagramType = "map_india";
                else if (qt.includes("world") || qt.includes("continent") || qt.includes("ocean")) q.diagramType = "map_world";
                else q.diagramType = "custom";
              }
              if (!q.diagramLabels || q.diagramLabels.length === 0) {
                q.diagramLabels = ["Part 1", "Part 2", "Part 3", "Part 4"];
              }
            }
          });
        });
      });
      setPaper(paperData);
      // Save to IndexedDB history
      const savedEntry = {
        id: `qp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: paperData.title,
        subject: form.subject,
        grade: form.grade,
        term: form.term,
        examType: form.examType,
        savedAt: Date.now(),
        paper: paperData,
      };
      await offlineDb.saveQuestionPaper(savedEntry);
      setSavedPapers(prev => [savedEntry, ...prev]);
      toast({ title: "Question Paper generated & saved! 📄", description: "Paper saved to history for offline access." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate";
      setError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = useCallback((questionId: number) => {
    if (!paper) return;
    const updated = { ...paper };
    updated.sections = updated.sections.map(s => ({
      ...s,
      subsections: s.subsections.map(sub => ({
        ...sub,
        questions: sub.questions.map(q => q.id === questionId ? { ...q, selected: !q.selected } : q),
      })),
    }));
    setPaper(updated);
  }, [paper]);

  const updateQuestion = useCallback((sIdx: number, subIdx: number, qIdx: number, field: string, value: string) => {
    if (!paper) return;
    const updated = { ...paper };
    updated.sections = updated.sections.map((s, si) => si === sIdx ? ({
      ...s,
      subsections: s.subsections.map((sub, subi) => subi === subIdx ? ({
        ...sub,
        questions: sub.questions.map((q, qi) => qi === qIdx ? { ...q, [field]: value } : q),
      }) : sub),
    }) : s);
    setPaper(updated);
  }, [paper]);

  const selectAll = useCallback((select: boolean) => {
    if (!paper) return;
    const updated = { ...paper };
    updated.sections = updated.sections.map(s => ({
      ...s,
      subsections: s.subsections.map(sub => ({
        ...sub,
        questions: sub.questions.map(q => ({ ...q, selected: select })),
      })),
    }));
    setPaper(updated);
  }, [paper]);

  const handlePrint = () => window.print();

  const loadFromHistory = (entry: typeof savedPapers[0]) => {
    setPaper(entry.paper);
    setShowHistory(false);
    setShowAnswers(false);
    setEditMode(false);
    toast({ title: `Loaded: ${entry.title}`, description: "Paper loaded from history." });
  };

  const deleteFromHistory = async (id: string) => {
    await offlineDb.deleteQuestionPaper(id);
    setSavedPapers(prev => prev.filter(p => p.id !== id));
    toast({ title: "Paper deleted from history 🗑️" });
  };
  const handleDownloadWord = () => {
    if (!paper) return;
    const sectionsHtml = paper.sections.map((section) => {
      const subsHtml = section.subsections.map((sub) => {
        const qsHtml = sub.questions.filter(q => q.selected !== false).map((q) => {
          if (sub.type === "multiple_choice") {
            const opts = (q.options || []).map((o, i) => `&nbsp;&nbsp;${String.fromCharCode(65 + i)}) ${o.replace(/^[a-d]\)\s*/, "")}`).join("<br/>");
            return `<p><b>${q.id}.</b> ${q.question} <span style="color:#666;font-size:11px">[${q.marks || 1}M]</span></p><p style="margin-left:20px">${opts}</p>`;
          }
          if (sub.type === "fill_in_blanks") {
            return `<p><b>${q.id}.</b> ${(q.question || "").replace(/_{2,}|\[_+\]/g, "_______________")} <span style="color:#666;font-size:11px">[${q.marks || 1}M]</span></p>`;
          }
          if (sub.type === "true_false") {
            return `<p><b>${q.id}.</b> ${q.question} &nbsp;( True / False ) <span style="color:#666;font-size:11px">[${q.marks || 1}M]</span></p>`;
          }
          if (sub.type === "match_following") {
            const rows = (q.left || []).map((l, i) =>
              `<tr><td style="border:1px solid #ccc;padding:6px;width:50%">${i + 1}. ${l}</td><td style="border:1px solid #ccc;padding:6px;width:50%">${String.fromCharCode(97 + i)}. ${q.right?.[i] || ""}</td></tr>`
            ).join("");
            return `<p><b>${q.id}.</b> Match the Following <span style="color:#666;font-size:11px">[${q.marks || 3}M]</span></p><table style="width:100%;border-collapse:collapse;margin:8px 0">${rows}</table>`;
          }
          return `<p><b>${q.id}.</b> ${q.question} <span style="color:#666;font-size:11px">[${q.marks || 5}M]</span></p>`;
        }).join("");
        return `<h4 style="margin-top:12px;font-size:13px;color:#333">${sub.heading}</h4>${qsHtml}`;
      }).join("");
      return `<div style="margin-top:24px"><h3 style="background:#e0f2fe;padding:8px 12px;font-size:14px;margin:0">${section.heading} <span style="float:right;font-size:12px;color:#555">[${section.totalMarks} Marks]</span></h3><p style="font-size:11px;color:#666;margin:4px 12px">${section.instructions}</p>${subsHtml}</div>`;
    }).join("");

    const answerHtml = showAnswers && paper.answerKey ? `<div style="page-break-before:always"><h2 style="color:#166534">✅ Answer Key with Explanations</h2>${paper.answerKey.sections.map(s => `<h3>${s.partLabel}</h3>${s.answers.map(a => `<p><b>${a.id}.</b> ${a.answer}${a.explanation ? ` — <i>${a.explanation}</i>` : ""}</p>`).join("")}`).join("")}</div>` : "";

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${paper.title}</title>
    <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
    <style>@page{size:A4 portrait;margin:1.5cm 2cm}body{font-family:'Noto Sans Tamil',Arial,sans-serif;font-size:13px;color:#111;margin:0;padding:0}h1{font-size:18px;text-align:center}h2{font-size:15px}table{border-collapse:collapse;width:100%}</style></head>
    <body>
    <div style="text-align:center;margin-bottom:12px">
      <img src="${window.location.origin}/nethaji_logo_print.webp" alt="Logo" style="width:70px;height:70px;object-fit:contain" />
      <h1 style="margin:4px 0">${paper.title}</h1>
      <p style="font-size:14px;font-weight:bold;margin:2px 0">${paper.subtitle}</p>
      <p style="font-size:12px;margin:2px 0">Term: ${paper.term} | Total Marks: ${paper.totalMarks} | Duration: ${paper.duration}</p>
    </div>
    <hr style="border:1px solid #1a3a5c"/>
    <p style="font-size:12px"><b>Name:</b> _____________________________ &nbsp; <b>Adm.No:</b> ______________ &nbsp; <b>Date:</b> ________________</p>
    
    ${sectionsHtml}
    ${answerHtml}
    </body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paper.title.replace(/[^a-zA-Z0-9\s]/g, "")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Word file downloaded! 📄" });
  };

  const handleShareWhatsApp = () => {
    if (!paper) return;
    const msg = `📝 *${paper.title}*\n${paper.subtitle}\n📅 ${paper.term} | ⏱ ${paper.duration} | 📊 ${paper.totalMarks} Marks\n\nGenerate question papers:\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // No per-question controls needed — combined edit mode handles it

  // Render subsection questions with proper serial numbering + combined edit mode
  const renderSubsection = (sub: PaperSubsection, sIdx: number, subIdx: number) => {
    const cm = colorMode;
    const renderQ = (q: PaperQuestion, qi: number, questionContent: React.ReactNode) => {
      const isDeselected = q.selected === false;
      return (
        <div key={q.id} className={`mb-6 ${isDeselected ? "opacity-30" : ""}`}>
          {editMode ? (
            <div className="mb-4">
              <input
                className="border-b-2 border-amber-400 outline-none w-full bg-transparent text-base font-medium py-1"
                value={q.question || ""}
                onChange={(e) => updateQuestion(sIdx, subIdx, qi, "question", e.target.value)}
              />
            </div>
          ) : questionContent}
        </div>
      );
    };

    switch (sub.type) {
      case "multiple_choice":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          return renderQ(q, qi,
            <>
              <p className={`font-medium text-base leading-relaxed ${cm ? "text-gray-800" : "text-gray-700"}`}>
                <span className={`font-bold mr-2 ${cm ? "text-blue-600" : "text-gray-600"}`}>{sn}.</span>
                {q.question}
                <span className={`text-xs ml-2 ${cm ? "text-blue-400" : "text-gray-400"}`}>[{q.marks || 1}M]</span>
              </p>
              <div className="grid grid-cols-2 gap-3 ml-7 mt-3">
                {q.options?.map((opt, oi) => (
                  <label key={oi} className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold ${
                      cm ? ["border-red-400 bg-red-50 text-red-600", "border-blue-400 bg-blue-50 text-blue-600", "border-green-400 bg-green-50 text-green-600", "border-purple-400 bg-purple-50 text-purple-600"][oi] || "border-gray-400" : "border-gray-400"
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <span className="text-base text-gray-700">{opt.replace(/^[a-d]\)\s*/, "")}</span>
                  </label>
                ))}
              </div>
            </>
          );
        });

      case "fill_in_blanks":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          return renderQ(q, qi,
            <p className={`font-medium text-base leading-[2.4] ${cm ? "text-gray-800" : "text-gray-700"}`}>
              <span className={`font-bold mr-2 ${cm ? "text-emerald-600" : "text-gray-600"}`}>{sn}.</span>
              <span>{(q.question || "").split(/_{2,}|\[_+\]/).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className={`inline-block border-b-2 ${cm ? "border-emerald-400" : "border-gray-500"} min-w-[140px] mx-1`}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                </React.Fragment>
              ))}</span>
              <span className={`text-xs ml-2 ${cm ? "text-emerald-400" : "text-gray-400"}`}>[{q.marks || 1}M]</span>
            </p>
          );
        });

      case "true_false":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          return renderQ(q, qi,
            <p className={`font-medium text-base leading-relaxed ${cm ? "text-gray-800" : "text-gray-700"}`}>
              <span className={`font-bold mr-2 ${cm ? "text-purple-600" : "text-gray-600"}`}>{sn}.</span>
              {q.question}
              <span className={`ml-3 font-semibold ${cm ? "text-purple-500" : "text-gray-500"}`}>( True / False )</span>
              <span className={`text-xs ml-2 ${cm ? "text-purple-400" : "text-gray-400"}`}>[{q.marks || 1}M]</span>
            </p>
          );
        });

      case "match_following":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          const isDeselected = q.selected === false;
          return (
            <div key={q.id} className={`mb-7 ${isDeselected ? "opacity-30" : ""}`}>
              <p className={`text-sm font-semibold mb-2 ${cm ? "text-orange-500" : "text-gray-500"}`}>{sn}. Match the Following <span className="text-xs font-normal">[{q.marks || 3}M]</span></p>
              <div className={`w-full border-2 rounded-xl overflow-hidden ${cm ? "border-orange-300" : "border-gray-300"}`}>
                <div className="grid grid-cols-2">
                  <div className={`border-r-2 px-4 py-2.5 ${cm ? "bg-orange-100 border-orange-300" : "bg-gray-100 border-gray-300"}`}>
                    <p className={`font-bold text-sm uppercase tracking-widest text-center ${cm ? "text-orange-700" : "text-gray-700"}`}>Column A</p>
                  </div>
                  <div className={`px-4 py-2.5 ${cm ? "bg-teal-100" : "bg-gray-100"}`}>
                    <p className={`font-bold text-sm uppercase tracking-widest text-center ${cm ? "text-teal-700" : "text-gray-700"}`}>Column B</p>
                  </div>
                </div>
                {(q.left || []).map((item, i) => (
                  <div key={i} className={`grid grid-cols-2 border-t-2 ${cm ? "border-orange-200" : "border-gray-200"} ${i % 2 === 0 ? "bg-white" : cm ? "bg-orange-50/30" : "bg-gray-50"}`}>
                    <div className={`flex items-center gap-2 border-r-2 px-4 py-3 ${cm ? "border-orange-300" : "border-gray-300"}`}>
                      <span className={`font-bold w-5 shrink-0 text-base ${cm ? "text-orange-600" : "text-gray-600"}`}>{i + 1}.</span>
                      <span className="text-base text-gray-800">{item}</span>
                      <div className={`ml-auto w-10 h-5 border-b-2 border-dashed ${cm ? "border-orange-400" : "border-gray-400"}`} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span className={`font-bold w-5 shrink-0 text-base ${cm ? "text-teal-600" : "text-gray-600"}`}>{String.fromCharCode(97 + i)}.</span>
                      <span className="text-base text-gray-800">{q.right?.[i]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        });

      case "short_answer":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          return renderQ(q, qi,
            <>
              <p className={`font-medium text-base leading-relaxed ${cm ? "text-gray-800" : "text-gray-700"}`}>
                <span className={`font-bold mr-2 ${cm ? "text-cyan-600" : "text-gray-600"}`}>{sn}.</span>
                {q.question}
                <span className={`text-xs ml-2 ${cm ? "text-cyan-400" : "text-gray-400"}`}>[{q.marks || 2}M]</span>
              </p>
              <div className="ml-7 mt-3 space-y-4">
                <div className={`border-b ${cm ? "border-cyan-200" : "border-gray-300"}`} />
                <div className={`border-b ${cm ? "border-cyan-200" : "border-gray-300"}`} />
                <div className={`border-b ${cm ? "border-cyan-200" : "border-gray-300"}`} />
              </div>
            </>
          );
        });

      case "long_answer":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          return renderQ(q, qi,
            <>
              <p className={`font-medium text-base leading-relaxed ${cm ? "text-gray-800" : "text-gray-700"}`}>
                <span className={`font-bold mr-2 ${cm ? "text-rose-600" : "text-gray-600"}`}>{sn}.</span>
                {q.question}
                <span className={`text-xs ml-2 ${cm ? "text-rose-400" : "text-gray-400"}`}>[{q.marks || 5}M]</span>
              </p>
              <div className="ml-7 mt-3 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`border-b ${cm ? "border-rose-200" : "border-gray-300"}`} />
                ))}
              </div>
            </>
          );
        });

      case "diagram":
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          const isDeselected = q.selected === false;
          return (
            <div key={q.id} className={`mb-7 ${isDeselected ? "opacity-30" : ""}`}>
              {editMode ? (
                <input
                  className="border-b-2 border-amber-400 outline-none w-full bg-transparent text-base font-medium py-1 mb-3"
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(sIdx, subIdx, qi, "question", e.target.value)}
                />
              ) : (
                <p className={`font-medium text-base leading-relaxed mb-3 ${cm ? "text-gray-800" : "text-gray-700"}`}>
                  <span className={`font-bold mr-2 ${cm ? "text-amber-600" : "text-gray-600"}`}>{sn}.</span>
                  {q.question}
                  <span className={`text-xs ml-2 ${cm ? "text-amber-400" : "text-gray-400"}`}>[{q.marks || 5}M]</span>
                </p>
              )}
              <div className="ml-5">
                <DiagramSVG type={q.diagramType} labels={q.diagramLabels} colorMode={colorMode} />
              </div>
            </div>
          );
        });

      default:
        return sub.questions.map((q, qi) => {
          const sn = qi + 1;
          return renderQ(q, qi,
            <p className={`font-medium text-base ${cm ? "text-gray-800" : "text-gray-700"}`}>
              <span className={`font-bold mr-2 ${cm ? "text-indigo-600" : "text-gray-600"}`}>{sn}.</span>
              {q.question}
              <span className={`text-xs ml-2 ${cm ? "text-indigo-400" : "text-gray-400"}`}>[{q.marks || 2}M]</span>
            </p>
          );
        });
    }
  };

  const isTamil = form.language === "Tamil";

  // Color theme classes based on curriculum
  const isMerryBirds = form.curriculum === "Oxford Merry Birds";
  const headerGradient = isMerryBirds
    ? "from-pink-500 to-orange-500"
    : "from-indigo-600 to-sky-600";
  const paperHeaderGradient = isMerryBirds
    ? "from-pink-600 to-orange-500"
    : "from-indigo-700 to-sky-600";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isMerryBirds ? "from-pink-50 via-orange-50 to-yellow-50" : "from-indigo-50 via-sky-50 to-emerald-50"} overflow-x-hidden ${isTamil ? "tamil-font" : ""}`}>
      <OfflineBanner isOnline={isOnline} appName="Question Paper Creator" offlineCapabilities="Generation needs internet" />

      <style>{`
         @media print {
          /* HIDE EVERYTHING first, then show only paper */
          body * { visibility: hidden !important; }
          .paper-card, .paper-card * { visibility: visible !important; }
          .paper-card { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          /* Aggressively hide all non-content elements */
          .no-print, header, footer, nav, [class*="PWA"], [class*="Offline"],
          [class*="ChatWidget"], [class*="SocialSidebar"], [class*="fixed"],
          .no-print *, header *, footer *, nav * {
            display: none !important; visibility: hidden !important; height: 0 !important;
            overflow: hidden !important; margin: 0 !important; padding: 0 !important;
            position: absolute !important; left: -9999px !important;
          }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { box-shadow: none !important; }
          .min-h-screen { min-height: auto !important; background: white !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .paper-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { margin: 1.2cm 1.5cm; size: A4 portrait; }
          img { max-height: 70px !important; max-width: 70px !important; }
          .paper-card, .paper-card * { color: #111 !important; }
          .paper-card h2, .paper-card h3 { color: #000 !important; }
          .bg-gradient-to-r { background: white !important; border-bottom: 3px solid #1a3a5c !important; }
          .bg-gradient-to-r * { color: #1a3a5c !important; }
          .bg-sky-50, .bg-amber-50, .bg-green-50, .bg-gray-50, .bg-indigo-50, .bg-purple-50 { background: white !important; }
          .paper-card svg { display: none !important; visibility: hidden !important; }
          .paper-card .px-8 { padding-left: 16px !important; padding-right: 16px !important; }
          .mb-6, .mb-7 { page-break-inside: avoid; }
          .border-l-4 { page-break-inside: avoid; }
          .paper-card .border-t { border-top: 1px solid #ccc !important; padding: 8px 16px !important; }
        }
        .tamil-font, .tamil-font * { font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', 'Baloo 2', sans-serif !important; }
      `}</style>

      {/* Page Header */}
      <div className={`no-print bg-gradient-to-r ${headerGradient} text-white py-6 px-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/worksheet-maker" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-white/50">|</span>
            <Link to="/worksheet-maker" className="text-white/70 hover:text-white text-sm">Worksheet Maker</Link>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Question Paper Creator
            </h1>
          </div>
          <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto text-center">
            Midterm · Quarterly · Half-Yearly · Annual — with Diagrams, Maps & Answer Key
          </p>
        </div>
      </div>

      <div className="no-print max-w-4xl mx-auto px-4 pt-4">
        <PWAInstallBanner appName="Question Paper" appEmoji="📝" appColor={`${headerGradient}`} description="Create exam papers offline • Save to home screen" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* History Toggle */}
        <div className="no-print flex justify-end mb-4">
          <Button onClick={() => setShowHistory(!showHistory)} variant="outline"
            className={`gap-2 ${showHistory ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-300"}`}>
            <History className="h-4 w-4" />
            Saved Papers ({savedPapers.length})
          </Button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="no-print bg-white rounded-2xl shadow-lg border border-amber-200 p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                Saved Question Papers
              </h3>
              <span className="text-sm text-gray-400 ml-auto">Stored locally on this device</span>
            </div>
            {savedPapers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No papers saved yet. Generate a paper and it will be auto-saved here.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {savedPapers.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                    <div className="text-2xl">📝</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span>{entry.subject}</span>
                        <span>•</span>
                        <span>Class {entry.grade}</span>
                        <span>•</span>
                        <span>{entry.term}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(entry.savedAt).toLocaleDateString()} {new Date(entry.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => loadFromHistory(entry)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 font-semibold text-xs">
                      Load
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteFromHistory(entry.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Form */}
        <div className={`no-print bg-white rounded-2xl shadow-lg border p-6 mb-8 ${isMerryBirds ? "border-pink-100" : "border-indigo-100"}`}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className={`h-5 w-5 ${isMerryBirds ? "text-pink-500" : "text-indigo-500"}`} />
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Create Question Paper
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Curriculum */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">📚 Curriculum</Label>
              <div className="grid grid-cols-2 gap-3">
                {CURRICULA.map((c) => (
                  <button key={c.id} onClick={() => handleCurriculumChange(c.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      form.curriculum === c.id
                        ? c.id === "Oxford Merry Birds" ? "border-pink-500 bg-pink-50 shadow-sm" : "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}>
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="text-left">
                      <span className={`text-sm font-bold block ${form.curriculum === c.id ? (c.id === "Oxford Merry Birds" ? "text-pink-700" : "text-indigo-700") : "text-gray-600"}`}>{c.label}</span>
                      <span className="text-xs text-gray-400">{c.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Pattern */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">🏛️ Question Pattern <span className="text-gray-400 font-normal">(auto-set based on curriculum)</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUESTION_PATTERNS.map((p) => (
                  <button key={p.id} onClick={() => setForm({ ...form, questionPattern: p.id })}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      form.questionPattern === p.id
                        ? isMerryBirds ? "border-pink-500 bg-pink-50 shadow-sm" : "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}>
                    <span className="text-xl">{p.emoji}</span>
                    <span className={`text-sm font-bold ${form.questionPattern === p.id ? (isMerryBirds ? "text-pink-700" : "text-indigo-700") : "text-gray-600"}`}>{p.label}</span>
                    <span className="text-xs text-gray-400">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Type */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">📋 Exam Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EXAM_TYPES.map((et) => (
                  <button key={et.id} onClick={() => setForm({ ...form, examType: et.id })}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${
                      form.examType === et.id
                        ? isMerryBirds ? "border-pink-500 bg-pink-50 shadow-sm" : "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}>
                    <span className="text-2xl">{et.emoji}</span>
                    <span className={`text-sm font-bold ${form.examType === et.id ? (isMerryBirds ? "text-pink-700" : "text-indigo-700") : "text-gray-600"}`}>{et.label}</span>
                    <span className="text-xs text-gray-400">{et.marks} marks · {et.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types - only for Custom pattern */}
            {form.questionPattern === "custom" && (
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">✅ Question Types <span className="text-gray-400 font-normal">(select what to include)</span></Label>
              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map((qt) => (
                  <button key={qt.id} onClick={() => toggleQuestionType(qt.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.questionTypes.includes(qt.id)
                        ? qt.color + " shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}>
                    <span>{qt.emoji}</span>
                    <span>{qt.label}</span>
                    {form.questionTypes.includes(qt.id) && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Term */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Term</Label>
              <div className="flex gap-2">
                {TERMS.map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, term: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                      form.term === t
                        ? isMerryBirds ? "border-pink-500 bg-pink-500 text-white" : "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Grade / Class</Label>
              <select className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${isMerryBirds ? "bg-pink-50 focus:ring-pink-400" : "bg-indigo-50 focus:ring-indigo-400"}`}
                value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Subject</Label>
              <select className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${isMerryBirds ? "bg-pink-50 focus:ring-pink-400" : "bg-indigo-50 focus:ring-indigo-400"}`}
                value={form.subject} onChange={(e) => {
                  const newSubject = e.target.value;
                  const autoLang = newSubject === "Hindi" ? "Hindi" : newSubject === "Tamil" ? "Tamil" : "English";
                  setForm({ ...form, subject: newSubject, language: autoLang });
                }}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Language */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Language / மொழி</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} onClick={() => setForm({ ...form, language: l })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                      form.language === l
                        ? isMerryBirds ? "border-pink-500 bg-pink-500 text-white" : "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}>{l === "Tamil" ? "தமிழ்" : l === "Hindi" ? "हिंदी" : l === "Bilingual" ? "இரு மொழி" : l}</button>
                ))}
              </div>
              {form.language === "Bilingual" && (
                <div className="mt-2">
                  <Label className="text-xs font-semibold text-gray-500 mb-1 block">Select Language Pair / மொழி ஜோடி</Label>
                  <div className="flex gap-2">
                    {BILINGUAL_PAIRS.map((bp) => (
                      <button key={bp.id} onClick={() => setForm({ ...form, bilingualPair: bp.id })}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                          form.bilingualPair === bp.id
                            ? isMerryBirds ? "border-pink-500 bg-pink-100 text-pink-700" : "border-indigo-500 bg-indigo-100 text-indigo-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }`}>{bp.labelTamil}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hindi Prachar Sabha Syllabus - only when Hindi is selected */}
            {form.subject === "Hindi" && (
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">🇮🇳 Hindi Syllabus <span className="text-gray-400 font-normal">(Hindi Prachar Sabha)</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HINDI_SYLLABUS_OPTIONS.map((hs) => (
                  <button key={hs.id} onClick={() => setForm({ ...form, hindiSyllabus: hs.id })}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      form.hindiSyllabus === hs.id
                        ? isMerryBirds ? "border-pink-500 bg-pink-50 shadow-sm" : "border-orange-500 bg-orange-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}>
                    <span className="text-xl">{hs.emoji}</span>
                    <span className={`text-sm font-bold ${form.hindiSyllabus === hs.id ? (isMerryBirds ? "text-pink-700" : "text-orange-700") : "text-gray-600"}`}>{hs.label}</span>
                    <span className="text-xs text-gray-400">{hs.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Topics */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Specific Topics / Chapters <span className="text-gray-400 font-normal">(optional — leave blank for full syllabus)</span>
              </Label>
              <Input placeholder="e.g. Numbers, Fractions, Parts of Plant, Maps..."
                value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })}
                className={`${isMerryBirds ? "bg-pink-50" : "bg-indigo-50"} border-gray-200`} />
              {topicSuggestions.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                        isMerryBirds ? "text-pink-600 hover:text-pink-800" : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {showHints ? "Hide" : "Show"} Topic Hints ({topicSuggestions.length})
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHints ? "rotate-180" : ""}`} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Hints</span>
                      <Switch checked={showHints} onCheckedChange={setShowHints} className="scale-75" />
                    </div>
                  </div>
                  {showHints && (
                    <div className="flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {topicSuggestions.map((s) => (
                        <button key={s} type="button"
                          onClick={() => setForm((prev) => ({
                            ...prev,
                            topics: prev.topics ? `${prev.topics}, ${s}` : s,
                          }))}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-all hover:scale-105 ${
                            isMerryBirds
                              ? "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                          }`}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generate} disabled={loading || !isOnline}
            className={`w-full mt-6 h-14 text-lg font-bold bg-gradient-to-r ${headerGradient} hover:opacity-90 text-white rounded-xl shadow-md`}>
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" />Generating {form.examType} paper…</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" />Generate {form.examType} Question Paper</>
            )}
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="no-print text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full border-4 ${isMerryBirds ? "border-pink-200 border-t-pink-500" : "border-indigo-200 border-t-indigo-500"} animate-spin`} />
                <BookOpen className={`absolute inset-0 m-auto h-7 w-7 ${isMerryBirds ? "text-pink-500" : "text-indigo-500"}`} />
              </div>
              <p className="text-gray-700 font-bold text-lg">Creating your {form.examType} paper…</p>
              <p className="text-gray-400 text-sm">AI is crafting questions with diagrams, maps & answer key</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && !paper && (
          <div className="no-print mt-8 mx-auto max-w-lg text-center bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-red-700 mb-2">Generation Failed</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
          </div>
        )}

        {/* Question Paper */}
        {paper && !loading && (
          <>
            {/* Action bar */}
            <div className="no-print flex flex-wrap gap-2 mb-4">
              <Button onClick={handlePrint} variant="outline" className="gap-2 border-gray-300">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline" className="gap-2 border-gray-300">
                {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAnswers ? "Hide Answers" : "Answer Key"}
              </Button>
              <Button onClick={() => setEditMode(!editMode)} variant="outline"
                className={`gap-2 ${editMode ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-300"}`}>
                <FileText className="h-4 w-4" />
                {editMode ? "Done Editing" : "Edit"}
              </Button>
              <Button onClick={() => setColorMode(!colorMode)} variant="outline" className="gap-2 border-gray-300">
                {colorMode ? <Palette className="h-4 w-4 text-pink-500" /> : <Palette className="h-4 w-4" />}
                {colorMode ? "Color" : "B&W"}
              </Button>
              <Button onClick={generate} variant="outline" className="gap-2 border-gray-300">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button onClick={handleShareWhatsApp} className="gap-2 bg-green-500 hover:bg-green-600 text-white">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share on</span> WhatsApp
              </Button>
              <Button onClick={handlePrint} className={`gap-2 bg-gradient-to-r ${headerGradient} text-white`}>
                <Download className="h-4 w-4" /> Save as PDF
              </Button>
              <Button onClick={handleDownloadWord} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <FileText className="h-4 w-4" /> Save as Word
              </Button>
              <VoiceReader
                getTextSegments={(withAnswers) => {
                  if (!paper) return [];
                  const segments: string[] = [];
                  segments.push(paper.title);
                  segments.push(paper.subtitle);
                  paper.sections?.forEach((section) => {
                    segments.push(section.heading);
                    if (section.instructions) segments.push(section.instructions);
                    section.subsections?.forEach((sub) => {
                      segments.push(sub.heading);
                      sub.questions.forEach((q) => {
                        if (q.question) {
                          segments.push(`Question ${q.id}. ${q.question}`);
                          if (q.options) segments.push(`Options: ${q.options.join(", ")}`);
                          if (sub.type === "match_following" && q.left && q.right) {
                            segments.push(`Match: ${q.left.join(", ")} with ${q.right.join(", ")}`);
                          }
                        }
                      });
                    });
                  });
                  if (withAnswers && paper.answerKey) {
                    segments.push("Answer Key");
                    paper.answerKey.sections?.forEach((section) => {
                      segments.push(section.partLabel);
                      section.answers?.forEach((a) => {
                        segments.push(`Answer ${a.id}. ${a.answer}${a.explanation ? `. Explanation: ${a.explanation}` : ""}`);
                      });
                    });
                  }
                  return segments;
                }}
              />
            </div>

            {/* Paper Document */}
            <div className="paper-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className={`${colorMode ? `bg-gradient-to-r ${paperHeaderGradient} text-white` : "bg-gray-100 text-gray-900 border-b-4 border-gray-400"} px-6 py-5 relative`}>
                <img src="/nethaji_logo_print.webp" alt="Nethaji Vidhyalayam"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-20 w-20 object-contain print:h-16 print:w-16"
                  style={{ filter: colorMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : "grayscale(100%)" }} />
                <div className="text-center px-28">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${colorMode ? "text-white/70" : "text-gray-500"}`}>Nethaji Vidhyalayam, Chennai</p>
                  <h2 className="text-lg md:text-xl font-extrabold leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {paper.title}
                  </h2>
                  <p className="font-bold text-base mt-1">{paper.subtitle}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${colorMode ? "bg-white/20" : "border border-gray-400"}`}>{paper.term}</span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${colorMode ? "bg-white/20" : "border border-gray-400"}`}>Total: {paper.totalMarks} Marks</span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${colorMode ? "bg-white/20" : "border border-gray-400"}`}>⏱ {paper.duration}</span>
                  </div>
                </div>
              </div>

              {/* Student info */}
              <div className={`border-b px-8 py-3 ${colorMode ? (isMerryBirds ? "bg-pink-50 border-pink-100" : "bg-indigo-50 border-indigo-100") : "bg-gray-50 border-gray-200"}`}>
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="text-gray-600">Name: <span className="inline-block w-48 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Adm.No: <span className="inline-block w-20 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Class & Section: <span className="inline-block w-20 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Date: <span className="inline-block w-28 border-b border-gray-500 ml-1" /></span>
                </div>
              </div>


              {/* Sections */}
              <div className="px-8 py-6 space-y-8">
                {paper.sections?.map((section, sIdx) => {
                  const sectionColors = colorMode
                    ? ["border-blue-400", "border-orange-400", "border-rose-400", "border-amber-400"][sIdx] || "border-indigo-300"
                    : "border-gray-400";
                  return (
                    <div key={sIdx} className={`border-l-4 ${sectionColors} pl-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-gray-900 text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                          {section.heading}
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${colorMode ? (isMerryBirds ? "text-pink-600 bg-pink-50" : "text-indigo-600 bg-indigo-50") : "text-gray-600 bg-gray-100"}`}>
                          {section.totalMarks} Marks
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-5 italic">{section.instructions}</p>

                      {section.subsections?.map((sub, subIdx) => (
                        <div key={subIdx} className="mb-6">
                          <h4 className={`font-bold text-sm border-b pb-1 mb-3 flex items-center gap-2 ${colorMode ? "text-gray-700 border-gray-200" : "text-gray-600 border-gray-300"}`}>
                            {sub.type === "multiple_choice" && colorMode && <CheckSquare className="h-3.5 w-3.5 text-blue-500" />}
                            {sub.type === "fill_in_blanks" && colorMode && <PenLine className="h-3.5 w-3.5 text-emerald-500" />}
                            {sub.type === "diagram" && colorMode && <span>📐</span>}
                            {(sub.type === "map_india" || sub.type === "map_world") && colorMode && <Map className="h-3.5 w-3.5 text-blue-500" />}
                            {sub.heading}
                          </h4>
                          {renderSubsection(sub, sIdx, subIdx)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Answer Key */}
              {showAnswers && paper.answerKey && (
                <div className={`mx-8 mb-8 p-5 border-2 rounded-xl ${colorMode ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-300"}`}>
                  <h3 className={`font-bold text-base mb-4 ${colorMode ? "text-green-800" : "text-gray-800"}`} style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    ✅ Answer Key with Explanations
                  </h3>
                  <div className="space-y-4">
                    {paper.answerKey.sections?.map((section, sIdx) => (
                      <div key={sIdx}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${colorMode ? "text-green-700" : "text-gray-600"}`}>{section.partLabel}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.answers?.map((a) => (
                            <div key={a.id} className={`text-sm leading-relaxed ${colorMode ? "text-green-800" : "text-gray-700"}`}>
                              <strong>{a.id}.</strong> {a.answer}
                              {a.explanation && <span className={`text-xs ml-1 ${colorMode ? "text-green-600" : "text-gray-500"}`}>— {a.explanation}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className={`px-8 py-4 border-t text-center ${colorMode ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-gray-100"}`}>
                <p className="text-xs text-gray-400">
                  Nethaji Vidhyalayam • {paper.examType} Examination • {paper.subject} • Class {paper.grade} • {paper.term} • {paper.curriculum || form.curriculum}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  Generated by Question Paper Creator • AI-powered • {paper.curriculum || form.curriculum} aligned
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
