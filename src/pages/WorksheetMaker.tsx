import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import OfflineBanner from "@/components/ui/OfflineBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { offlineDb } from "@/lib/offlineDb";
import {
  BookOpen,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Printer,
  Sparkles,
  Loader2,
  Trash2,
  GraduationCap,
  FileText,
  PenLine,
  List,
  CheckSquare,
  ChevronDown,
  Share2,
} from "lucide-react";
import VoiceReader from "@/components/ui/VoiceReader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question?: string;
  answer?: string;
  options?: string[];
  left?: string[];
  right?: string[];
  answers?: string[];
  diagramLabels?: string[];
}

interface Section {
  type: string;
  heading: string;
  questions: Question[];
}

interface Worksheet {
  title: string;
  grade: string;
  subject: string;
  topic: string;
  instructions: string;
  sections: Section[];
  _hasDiagram?: boolean;
}

interface SavedWorksheet {
  id: string;
  title: string;
  savedAt: string;
  worksheet: Worksheet;
  formData: FormData_;
}

interface FormData_ {
  curriculum: string;
  term: string;
  grade: string;
  subject: string;
  topic: string;
  numQuestions: number;
  numSets: number;
  language: string;
  difficulty: string;
  questionTypes: string[];
  hindiSyllabus: string;
  bilingualPair: string;
}

// ─── Question Type Options ────────────────────────────────────────────────────
const QUESTION_TYPES = [
  { id: "multiple_choice",  label: "Multiple Choice",    emoji: "🔘", tamil: "பலவுள் தேர்வு" },
  { id: "fill_in_blanks",   label: "Fill in the Blanks", emoji: "✏️",  tamil: "காலி இடம்" },
  { id: "match_following",  label: "Match the Following",emoji: "🔗",  tamil: "பொருத்துக" },
  { id: "true_false",       label: "True or False",      emoji: "✅",  tamil: "சரி/தவறு" },
  { id: "short_answer",     label: "Short Answer",       emoji: "📝",  tamil: "குறு விடை" },
  { id: "diagram",          label: "Label/Draw",         emoji: "🖊️",  tamil: "படம் வரை" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRICULA = [
  "Samacheer Kalvi (Tamil Nadu State Board)",
  "Oxford Merry Birds (Integrated Term Course)",
];

const TERMS = ["Term 1", "Term 2", "Term 3"];

const GRADES = ["Pre-KG", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

// Subjects per curriculum
const SAMACHEER_SUBJECTS = ["Tamil", "English", "Maths", "EVS/Science", "Social Studies", "Hindi"];
const MERRY_BIRDS_SUBJECTS = ["English", "Maths", "EVS/Science", "Social Studies", "General Knowledge", "Hindi"];

const HINDI_SYLLABUS_OPTIONS = [
  { id: "none", label: "Regular Hindi", emoji: "📖", desc: "Standard school Hindi" },
  { id: "parichay", label: "Parichay (परिचय)", emoji: "🔤", desc: "Hindi Prachar Sabha - Beginner" },
  { id: "prathama", label: "Prathama (प्रथमा)", emoji: "📗", desc: "Hindi Prachar Sabha - Elementary" },
  { id: "madhyama", label: "Madhyama (मध्यमा)", emoji: "📘", desc: "Hindi Prachar Sabha - Intermediate" },
  { id: "rashtrabhasha", label: "Rashtrabhasha (राष्ट्रभाषा)", emoji: "📕", desc: "Hindi Prachar Sabha - Advanced" },
  { id: "praveshika", label: "Praveshika (प्रवेशिका)", emoji: "📙", desc: "Hindi Prachar Sabha - Pre-degree" },
];

const LANGUAGES = ["English", "Tamil", "Hindi", "Bilingual"];
const BILINGUAL_PAIRS = [
  { id: "English+Tamil", label: "English & Tamil", labelTamil: "ஆங்கிலம் & தமிழ்" },
  { id: "Tamil+Hindi", label: "Tamil & Hindi", labelTamil: "தமிழ் & हिंदी" },
  { id: "English+Hindi", label: "English & Hindi", labelTamil: "ஆங்கிலம் & हिंदी" },
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STORAGE_KEY = "samacheer_worksheets_v2";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Topic suggestions: key = `${curricShort}-${term}-${grade}-${subject}`
// curricShort: "MB" = Merry Birds, "SK" = Samacheer Kalvi
const TOPIC_SUGGESTIONS_MAP: Record<string, string[]> = {

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — PRE-KG
  // ══════════════════════════════════════════════════════
  "MB-Term 1-Pre-KG-English":          ["Hello! My Name Is", "My Body Parts", "Colours Around Me", "Alphabet A–L Tracing", "Rhyming Words", "Action Words (Jump, Clap)", "Greetings (Hello, Bye)", "Naming Things Around Me", "Picture Naming", "Opposites (Big/Small, Up/Down)"],
  "MB-Term 2-Pre-KG-English":          ["Animals I Know", "Fruits and Vegetables", "My Home", "Alphabet M–Z Tracing", "Sight Words (I, am, the)", "Singular and Plural (s)", "Colour Words", "Matching Words to Pictures", "Simple Rhymes", "My Toys"],
  "MB-Term 3-Pre-KG-English":          ["Transport", "Community Helpers", "Weather and Seasons", "CVC Words (cat, bat)", "Reading Simple Words", "Sentence Starters (I am, I see)", "Days of the Week", "Good Manners Words", "Story Listening & Retelling", "My Favourite Things"],
  "MB-Term 1-Pre-KG-Maths":            ["Numbers 1–5", "Shapes (Circle, Square)", "Big and Small", "Counting Objects", "Colouring by Number", "Top and Bottom", "Near and Far", "Heavy and Light", "Sorting by Colour", "Same and Different"],
  "MB-Term 2-Pre-KG-Maths":            ["Numbers 6–10", "Tall and Short", "Patterns", "Counting Forward", "More and Less", "Shapes (Triangle, Rectangle)", "Thick and Thin", "Left and Right", "Ordering by Size", "Number Tracing"],
  "MB-Term 3-Pre-KG-Maths":            ["Numbers 1–10 (Review)", "More and Less", "Inside and Outside", "Above and Below", "Before and After", "Long and Short", "Empty and Full", "Addition (Pictorial)", "Sequencing (1st, 2nd, 3rd)", "Number Names (One–Ten)"],
  "MB-Term 1-Pre-KG-EVS/Science":      ["My Senses", "My Family", "Plants Around Us", "Colours in Nature", "My Body Parts", "Animals I See", "Things at Home", "Clean and Dirty", "Day and Night", "Healthy Food"],
  "MB-Term 2-Pre-KG-EVS/Science":      ["Animals and their Sounds", "Food We Eat", "Clean Habits", "Fruits I Know", "Vegetables I Know", "My Clothes", "Hot and Cold", "Land and Water", "Birds Around Us", "Flowers and Trees"],
  "MB-Term 3-Pre-KG-EVS/Science":      ["Water Uses", "Air Around Us", "Day and Night", "Seasons (Summer, Winter, Rainy)", "Safety at Home", "My Neighbourhood", "Transport I See", "Insects Around Us", "Good Habits", "Sun, Moon and Stars"],
  "MB-Term 1-Pre-KG-General Knowledge":["Days of the Week", "Colours", "Shapes I See", "My Country India", "National Flag", "Animals and their Babies", "Fruits Names", "Parts of Body", "Greetings (Hello, Namaste)", "Numbers 1–5"],
  "MB-Term 2-Pre-KG-General Knowledge":["Animals and Babies", "Fruits and Vegetables", "National Flag", "Festivals of India", "Community Helpers", "Our Senses", "Traffic Lights", "Good Manners", "Birds I Know", "Flowers Names"],
  "MB-Term 3-Pre-KG-General Knowledge":["Birds of India", "Months of the Year", "Good Habits", "Seasons", "Transport (Land, Water, Air)", "Famous Places in India", "Wild vs Domestic Animals", "Musical Instruments", "Parts of a Plant", "Our National Anthem"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — LKG
  // ══════════════════════════════════════════════════════
  "MB-Term 1-LKG-English":          ["Alphabet A–E (Phonics)", "My School", "Animals and their Sounds", "Tracing Letters", "Colour Names", "Sight Words (a, is, it)", "Naming Words", "Action Words (run, sit)", "Rhyming Words", "Picture Reading", "Greetings & Manners", "My Body Parts"],
  "MB-Term 2-LKG-English":          ["Alphabet F–M (Phonics)", "My Family", "Action Words", "Rhyming Words", "Opposites (Big/Small)", "CVC Words (pin, mop)", "Days of the Week", "Singular and Plural", "Three-Letter Words", "Picture Description", "Matching Words", "Fruits and Vegetables Names"],
  "MB-Term 3-LKG-English":          ["Alphabet N–Z (Phonics)", "My Neighbourhood", "Seasons", "Simple Sentences", "Picture Reading", "Sight Words Review", "Opposites (hot/cold, up/down)", "Story Sequencing (3 pictures)", "Sentence Making (I can...)", "Reading Short Passages", "Question Words (What, Who)", "Describing Words (big, red)"],
  "MB-Term 1-LKG-Maths":            ["Numbers 1–10", "Shapes (Triangle, Rectangle)", "Counting Objects", "Number Names (One–Ten)", "Big and Small", "Tall and Short", "Heavy and Light", "More and Less", "Sorting Objects", "Colouring by Number", "Number Tracing", "Patterns (AB, ABB)"],
  "MB-Term 2-LKG-Maths":            ["Numbers 11–20", "Patterns", "Long and Short", "Addition (Pictorial)", "Counting Backward", "Before and After", "Ordinal Numbers (1st–5th)", "Shapes in Real Life", "Near and Far", "Top/Bottom/Middle", "Comparing Numbers", "Skip Counting by 2s"],
  "MB-Term 3-LKG-Maths":            ["Numbers 1–20 (Review)", "Before and After", "Addition (intro)", "Subtraction (intro)", "Number Bonds", "Measurement (Hand Span)", "Time (Morning/Afternoon/Night)", "Money (Coins)", "Data (Counting & Sorting)", "3D Shapes (Sphere, Cube)", "Number Sequencing", "Word Problems (Simple)"],
  "MB-Term 1-LKG-EVS/Science":      ["My Body Parts", "My Family", "Plants Around Us", "Animals (Pet & Wild)", "My Five Senses", "Colours in Nature", "Clean and Dirty", "Healthy Food", "Water Uses", "Things at Home"],
  "MB-Term 2-LKG-EVS/Science":      ["Animals and their Homes", "Food I Eat", "Water", "Birds Around Us", "Insects", "Fruits and Vegetables", "Hot and Cold Things", "My Clothes", "Flowers and Trees", "Safety Rules"],
  "MB-Term 3-LKG-EVS/Science":      ["Air and Wind", "Seasons", "Community Helpers", "Day and Night", "Transport", "Sun, Moon and Stars", "Rain and Water", "Good Habits (Hygiene)", "Festivals and Nature", "Recycling (intro)"],
  "MB-Term 1-LKG-Social Studies":   ["My School", "My Home", "People Who Help Us", "My Family Members", "My Address", "Rules at School", "Friends and Sharing", "Things in My Classroom", "My Teacher", "Good Manners"],
  "MB-Term 2-LKG-Social Studies":   ["My Village / City", "Transport (Land)", "Transport (Water, Air)", "Market and Shops", "Postman and Letters", "Doctor and Hospital", "Police and Safety", "My Neighbourhood", "Festivals We Celebrate", "Traffic Rules"],
  "MB-Term 3-LKG-Social Studies":   ["National Symbols", "Festivals", "Good Citizens", "Our Country India", "National Flag and Anthem", "Famous Leaders (Gandhi, Nehru)", "Indian Monuments", "Places of Worship", "Independence Day", "Republic Day"],
  "MB-Term 1-LKG-General Knowledge":["Days of the Week", "Colours", "National Flag of India", "Animals and Sounds", "Fruits Names", "Body Parts", "My School Name", "Vegetables Names", "Numbers 1–10", "Greetings in Languages"],
  "MB-Term 2-LKG-General Knowledge":["Animals and their Babies", "Birds of India", "Fruits", "National Anthem", "Festivals of India", "Community Helpers", "Traffic Signals", "Musical Instruments", "Flowers Names", "Shapes Around Us"],
  "MB-Term 3-LKG-General Knowledge":["Months and Seasons", "Famous Indians", "Good Habits", "National Symbols", "Sports Names", "Indian States (Basic)", "Currencies (Rupee)", "Food Grains", "Parts of a Plant", "Water Animals"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — UKG
  // ══════════════════════════════════════════════════════
  "MB-Term 1-UKG-English":          ["Phonics – Short Vowel 'a'", "Simple CVC Words", "My Family", "Naming Words", "Sight Words", "Picture Composition", "Vowels and Consonants", "Rhyming Words", "Singular and Plural", "Articles (a, an)", "Describing Words (Adjectives)", "Sentence Making (This is a...)"],
  "MB-Term 2-UKG-English":          ["Phonics – Short Vowels e/i", "Animals and their Habitats", "Community Helpers", "Action Words", "Opposites", "Sentence Making", "Blending Sounds (bl, cl, fl)", "Question Formation (Is this...?)", "Prepositions (in, on, under)", "Gender (boy/girl, he/she)", "Story Sequencing", "Matching Words to Pictures"],
  "MB-Term 3-UKG-English":          ["Phonics – Short Vowels o/u", "Simple Sentences", "Seasons and Weather", "Punctuation (Full Stop)", "Singular and Plural", "Reading Comprehension", "Conjunctions (and)", "Letter Writing (to Friend)", "Word Families (-at, -en, -it)", "Compound Words (sun+flower)", "Creative Writing (3 Sentences)", "Dictation Practice"],
  "MB-Term 1-UKG-Maths":            ["Numbers 1–20", "Addition (Single Digit)", "Shapes", "Number Names", "Counting Forward & Backward", "Before/After/Between", "Ordinal Numbers", "Comparing Numbers", "Patterns (ABC)", "Sorting & Classifying", "Measurement (Longer/Shorter)", "Skip Counting by 2s and 5s"],
  "MB-Term 2-UKG-Maths":            ["Numbers 21–50", "Subtraction (Single Digit)", "Measurement (Long/Short)", "Addition Word Problems", "Number Bonds to 10", "Shapes (2D and 3D)", "Symmetry (intro)", "Money (Coins Recognition)", "Data Handling (Pictograph)", "Place Value (Tens & Ones)", "Time (O'clock)", "Doubling and Halving"],
  "MB-Term 3-UKG-Maths":            ["Numbers 51–100", "Patterns", "Time (Day/Night/Morning)", "Addition & Subtraction Review", "Fractions (Half)", "Calendar Reading", "Weight (Heavier/Lighter)", "Capacity (More/Less)", "Number Sequencing to 100", "Word Problems", "Shapes in Environment", "Mental Maths"],
  "MB-Term 1-UKG-EVS/Science":      ["Plants and their Parts", "Animals (Domestic, Wild)", "Clean Habits", "My Five Senses", "Living and Non-living Things", "Healthy Food vs Junk Food", "Water (Sources)", "Birds and their Nests", "Colours in Nature", "My Body and Health"],
  "MB-Term 2-UKG-EVS/Science":      ["Food We Eat (Healthy vs Junk)", "Water Uses", "Air Around Us", "Insects and Bugs", "Soil and Mud", "Fruits and Vegetables", "Materials Around Us", "Safety Rules at Home", "Weather Chart", "Animals and their Babies"],
  "MB-Term 3-UKG-EVS/Science":      ["Weather and Seasons", "Our Earth", "Light and Darkness", "Recycling and Reuse", "Transport and Fuel", "Sun, Moon and Stars", "Plants We Eat", "Animals in Different Habitats", "Sound Around Us", "Good Habits for Environment"],
  "MB-Term 1-UKG-Social Studies":   ["My School", "My Village and City", "Land Transport", "My Family and Roles", "My Address", "Rules at Home & School", "People in My Neighbourhood", "Market and Shopping", "Festivals We Celebrate", "Things We Need (Food, Shelter, Clothing)"],
  "MB-Term 2-UKG-Social Studies":   ["Water Transport", "Air Transport", "Occupations", "Communication (Phone, Letter, Email)", "Doctor and Hospital", "Fire Station", "Places of Worship", "Map of My School", "Road Safety", "Public Places (Library, Park, Museum)"],
  "MB-Term 3-UKG-Social Studies":   ["Our Country India", "National Symbols", "Festivals of India", "National Leaders (Gandhi, Nehru, Bose)", "States of India (Basic)", "Indian Monuments (Taj Mahal, Red Fort)", "Independence Day & Republic Day", "National Anthem & Song", "India on the Globe", "Good Citizenship"],
  "MB-Term 1-UKG-General Knowledge":["Days, Months, Seasons", "Animals and their Young", "National Symbols", "Colours and Shapes", "Indian Currency (Rupee)", "Famous Places in India", "Fruits from Different Countries", "Festivals of Different Religions", "Body Parts and Functions", "Our Solar System (Sun, Earth, Moon)"],
  "MB-Term 2-UKG-General Knowledge":["Famous Persons of India", "World Around Us", "Sports", "Musical Instruments", "Birds of India (Peacock, Parrot)", "Vegetables and Their Colours", "Indian Flag and Emblem", "Types of Houses", "Water Animals", "Land Animals vs Water Animals"],
  "MB-Term 3-UKG-General Knowledge":["Inventions (Wheel, Fire)", "Human Body Facts", "Solar System (intro)", "Famous Scientists (Newton, Edison)", "Countries and Flags", "World Oceans", "Indian Railways", "Natural Wonders", "Healthy Habits Quiz", "General Awareness (Emergency Numbers)"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 1
  // ══════════════════════════════════════════════════════
  "MB-Term 1-1st-English":          ["The Little Red Hen", "Phonics – Consonant Blends", "Articles a/an", "Naming Words (Nouns)", "Singular and Plural", "Rhyming Words", "Vowels and Consonants", "Common and Proper Nouns", "Action Words (Verbs)", "Sight Words Practice", "Picture Description", "Sentence Rearrangement", "Opposites (Antonyms)", "Gender (Masculine/Feminine)"],
  "MB-Term 2-1st-English":          ["The Magic Drum (Story)", "Nouns (Common & Proper)", "Action Verbs", "Is/Am/Are", "Opposites", "Picture Composition", "Prepositions (in, on, under, near)", "Describing Words (big, tall, red)", "Tenses – Present Simple (I eat, She reads)", "Question Words (What, Where, Who)", "Punctuation (Full Stop, Question Mark)", "Compound Words", "Days and Months", "Story Retelling"],
  "MB-Term 3-1st-English":          ["The Honest Woodcutter", "Adjectives", "Simple Sentences & Punctuation", "Prepositions (in, on, under)", "Reading Comprehension", "Story Sequencing", "Conjunctions (and, but, or)", "Letter Writing (Informal – to a Friend)", "Synonyms (happy/glad)", "Antonyms (hot/cold)", "Singular and Plural (Irregular)", "Creative Writing (My Pet, My School)", "Comprehension Passage (Short)", "Dictation & Spelling"],
  "MB-Term 1-1st-Maths":            ["Numbers 1–100", "Addition (2-Digit)", "Subtraction", "Place Value (Ones, Tens)", "Number Names", "Before/After/Between", "Comparing Numbers (>, <, =)", "Ordinal Numbers (1st–10th)", "Skip Counting (2s, 5s, 10s)", "Shapes (2D)", "Patterns (Repeating, Growing)", "Measurement (Length)"],
  "MB-Term 2-1st-Maths":            ["Multiplication (2x, 3x)", "Shapes and Patterns", "Measurement (CM)", "Addition Word Problems", "Subtraction Word Problems", "Number Line", "Even and Odd Numbers", "Symmetry", "Data Handling (Pictograph)", "3D Shapes (Cube, Cone, Cylinder)", "Fractions (Half, Quarter)", "Mental Maths"],
  "MB-Term 3-1st-Maths":            ["Division (intro)", "Money", "Time (Hours)", "Calendar Reading", "Weight and Capacity", "Multiplication Tables (2–5)", "Addition & Subtraction (3-Digit)", "Number Patterns", "Geometry (Lines, Curves)", "Data Handling (Tally Marks)", "Word Problems (Mixed)", "Review & Assessment"],
  "MB-Term 1-1st-EVS/Science":      ["Plants Around Us", "Animals and their Young Ones", "Air and Water", "My Body and Senses", "Living and Non-living Things", "Healthy Food", "Parts of a Plant (Root, Stem, Leaf)", "Domestic and Wild Animals", "Water Sources", "Clean Environment"],
  "MB-Term 2-1st-EVS/Science":      ["Food and Nutrition", "Our Senses", "Soil", "Birds and their Features", "Insects", "Materials (Natural & Man-made)", "Safety Rules", "Seasons and Clothing", "Plants We Eat (Fruits, Vegetables, Grains)", "Personal Hygiene"],
  "MB-Term 3-1st-EVS/Science":      ["Weather", "Light and Shadow", "Simple Machines", "Day and Night", "Sound", "Recycling", "Animals in Different Habitats", "Water Cycle (intro)", "Environment Pollution", "Fun Science Experiments"],
  "MB-Term 1-1st-Social Studies":   ["My Home", "My School", "Community Helpers", "My Family", "My Address", "Rules and Responsibilities", "Neighbours", "Things We Need", "Festivals We Celebrate", "Good Manners"],
  "MB-Term 2-1st-Social Studies":   ["Our Village and City", "Transport and Communication", "Markets", "Occupations", "Post Office", "Hospital", "Police Station", "Road Safety", "Public Places", "Maps (intro)"],
  "MB-Term 3-1st-Social Studies":   ["Our Country India", "National Symbols", "Festivals", "National Leaders", "States of India", "Indian Monuments", "Independence Day", "Republic Day", "Unity in Diversity", "Our National Flag"],
  "MB-Term 1-1st-General Knowledge":["Days, Months, Seasons", "National Symbols of India", "Famous Personalities", "Animals and their Sounds", "Fruits from Different Countries", "Indian Currency", "Colours of Rainbow", "Parts of a Computer", "National Anthem", "Famous Monuments"],
  "MB-Term 2-1st-General Knowledge":["Animals – Interesting Facts", "Space (Sun, Moon, Stars)", "Sports and Games", "Musical Instruments", "Festivals of India", "Birds and their Habitats", "Water Animals", "Healthy vs Junk Food", "Emergency Numbers", "Indian States & Capitals (Basic)"],
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
  "MB-Term 3-2nd-EVS/Science":      ["Weather and Seasons", "Simple Machines", "Light and Sound", "Magnets", "Human Body (Skeletal System)", "Rocks and Minerals", "Natural Disasters (Flood, Earthquake)", "Conservation of Water", "Waste Management", "Fun Experiments"],
  "MB-Term 1-2nd-Social Studies":   ["Our Country India", "Landforms (Mountains, Plains)", "Rivers of India", "States and Union Territories", "Northern Plains", "Coastal Areas", "Maps and Directions", "Indian Ocean", "Himalayas", "Natural Resources"],
  "MB-Term 2-2nd-Social Studies":   ["Crops and Farming", "Occupations", "Transport", "Communication (Old and New)", "Industries (intro)", "Village and City Life", "Markets and Trade", "Banking (intro)", "Road Safety Rules", "Environmental Conservation"],
  "MB-Term 3-2nd-Social Studies":   ["Our Government", "National Symbols", "Environment Care", "Indian Constitution (intro)", "Rights and Duties", "Famous Freedom Fighters", "Indian Festivals", "Cultural Diversity", "World Map (Continents)", "Disaster Management (intro)"],
  "MB-Term 1-2nd-General Knowledge":["Inventions and Inventors", "World Records", "National Awards", "Famous Indian Scientists", "Currencies of the World", "Largest/Smallest/Tallest", "Indian Dances", "Musical Instruments of India", "Famous Books and Authors", "Abbreviations (UN, WHO)"],
  "MB-Term 2-2nd-General Knowledge":["Space Exploration", "Famous Scientists", "Countries and Capitals", "Olympic Games", "Nobel Prize Winners", "Wonders of the World", "Indian Rivers and Dams", "Birds (National Birds)", "Computer Basics", "First in India/World"],
  "MB-Term 3-2nd-General Knowledge":["World Leaders", "Sports Champions", "India's Heritage Sites", "Environmental Days", "Famous Temples and Monuments", "Indian Railways", "Important Dates in History", "World Organisations", "Science in Daily Life", "Current Affairs (Age-appropriate)"],

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
  "MB-Term 2-4th-English":          ["The Jungle Book (Story)", "Direct and Indirect Speech", "Dialogue Writing", "Prefix and Suffix", "Conjunctions (because, although)", "Notice Writing", "Tenses (Continuous & Perfect)", "Clauses (Main and Subordinate)", "Adverbs (Manner, Place, Time)", "Comprehension (Unseen Passage)", "Diary Entry", "Message Writing", "Vocabulary – One Word Substitution", "Interjections & Exclamations"],
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
  // SAMACHEER KALVI — LKG
  // ══════════════════════════════════════════════════════
  "SK-Term 1-LKG-Tamil":    ["அ, ஆ, இ, ஈ", "குறில் எழுத்துக்கள்", "பழங்கள்", "விலங்குகள் பெயர்கள்", "வண்ணங்கள்", "என் உடல் பாகங்கள்", "எண்கள் 1-5", "படம் பார்த்து பெயர் சொல்", "ஒலி எழுப்பும் விலங்குகள்", "என் குடும்பம்"],
  "SK-Term 2-LKG-Tamil":    ["உ, ஊ, எ, ஏ", "நெடில் எழுத்துக்கள்", "விலங்குகள்", "பூக்கள் பெயர்கள்", "காய்கறிகள்", "என் வீடு", "எதிர்ச்சொல் (பெரிய/சிறிய)", "படம் பார்த்து சொல்", "நல்ல பழக்கங்கள்", "வாகனங்கள்"],
  "SK-Term 3-LKG-Tamil":    ["ஐ, ஒ, ஓ, ஔ", "உயிர் எழுத்துக்கள் (மொத்தம்)", "வண்ணங்கள்", "சொல் படிக்கலாம்", "என் பள்ளி", "நாட்கள் பெயர்கள்", "பருவகாலங்கள்", "நல்ல நடத்தை", "உணவு வகைகள்", "கதை கேட்டு சொல்"],
  "SK-Term 1-LKG-English":  ["A B C (Phonics)", "Animals", "Colours", "Tracing Letters", "Sight Words (I, a, the)", "Naming Words", "Action Words (jump, run)", "Rhyming Words", "Picture Naming", "My School"],
  "SK-Term 2-LKG-English":  ["D E F G (Phonics)", "Fruits", "Shapes", "CVC Words (cat, dog)", "Opposites (big/small)", "Singular and Plural", "My Family", "Days of the Week", "Matching Words", "Greeting Words"],
  "SK-Term 3-LKG-English":  ["H–Z (Phonics)", "My Body", "My Family", "Simple Sentences", "Reading Short Words", "Picture Description", "Story Retelling", "Seasons", "Community Helpers", "Good Manners"],
  "SK-Term 1-LKG-Maths":    ["Numbers 1–5", "Shapes (Circle, Square)", "Counting", "Number Tracing", "Big and Small", "More and Less", "Sorting by Colour", "Tall and Short", "Heavy and Light", "Colouring by Number"],
  "SK-Term 2-LKG-Maths":    ["Numbers 6–10", "Big and Small", "Patterns", "Counting Forward", "Shapes (Triangle, Rectangle)", "Top and Bottom", "Near and Far", "Thick and Thin", "Left and Right", "Same and Different"],
  "SK-Term 3-LKG-Maths":    ["Numbers 1–10 (Review)", "Addition (intro)", "Before and After", "Number Names", "Long and Short", "Empty and Full", "Inside and Outside", "Sequencing (1st, 2nd, 3rd)", "Skip Counting by 2", "Above and Below"],
  "SK-Term 1-LKG-EVS/Science": ["My Body", "My Family", "Animals Around Me", "My Five Senses", "Colours in Nature", "Plants I See", "Clean and Dirty", "Healthy Food", "Water Uses", "Day and Night"],
  "SK-Term 2-LKG-EVS/Science": ["Plants and Flowers", "Food I Eat", "Water Uses", "Birds Around Me", "Fruits and Vegetables", "My Clothes", "Hot and Cold", "Insects", "Safety at Home", "Good Habits"],
  "SK-Term 3-LKG-EVS/Science": ["Seasons", "Clean Habits", "Community Helpers", "Transport I See", "Sun, Moon and Stars", "Animals and Babies", "Rain and Water", "My Neighbourhood", "Festivals and Nature", "Recycling (intro)"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — UKG
  // ══════════════════════════════════════════════════════
  "SK-Term 1-UKG-Tamil":    ["உயிர் எழுத்துக்கள்", "அகர வரிசை", "என் குடும்பம்", "மெய் எழுத்துக்கள் (intro)", "பழங்கள் பெயர்கள்", "விலங்குகள் (வீட்டு/காட்டு)", "எண்கள் 1-20", "வண்ணங்கள் & வடிவங்கள்", "சொல் படிக்கலாம்", "எதிர்ச்சொல் (நல்ல/கெட்ட)"],
  "SK-Term 2-UKG-Tamil":    ["மெய் எழுத்துக்கள்", "சொல் படிக்கலாம்", "பூக்கள்", "உயிர்மெய் (க, கா, கி)", "இரண்டு எழுத்துச் சொற்கள்", "காய்கறிகள்", "என் உடல்", "பறவைகள்", "சரியான சொல் தேர்வு", "படம் பார்த்து வாக்கியம் எழுது"],
  "SK-Term 3-UKG-Tamil":    ["உயிர்மெய் எழுத்துக்கள் (intro)", "வாக்கியம் படிக்கலாம்", "நல்ல பழக்கங்கள்", "மூன்று எழுத்துச் சொற்கள்", "பருவகாலங்கள்", "என் பள்ளி", "சரியான வரிசை அமை", "கதை படிக்கலாம்", "விடுகதைகள்", "எளிய கவிதை"],
  "SK-Term 1-UKG-English":  ["Phonics – Short 'a'", "CVC Words (cat, bat)", "My School", "Naming Words (Nouns)", "Articles (a, an)", "Vowels and Consonants", "Sight Words", "Describing Words", "Action Words", "Sentence Making (This is a...)", "Rhyming Words", "Picture Composition"],
  "SK-Term 2-UKG-English":  ["Phonics – Short 'e' & 'i'", "Animals and Sounds", "My Family", "Singular and Plural", "Opposites", "Prepositions (in, on, under)", "Gender (boy/girl)", "Blending Sounds", "Question Words (What, Who)", "Matching Words to Pictures", "Days and Months", "Reading Short Passages"],
  "SK-Term 3-UKG-English":  ["Phonics – Short 'o' & 'u'", "Simple Sentences", "Community Helpers", "Punctuation (Full Stop)", "Conjunctions (and)", "Letter Writing (to Friend)", "Word Families (-at, -en, -it)", "Compound Words", "Story Sequencing", "Creative Writing (3 Sentences)", "Dictation Practice", "Comprehension (Short)"],
  "SK-Term 1-UKG-Maths":    ["Numbers 1–20", "Addition (Single Digit)", "Shapes", "Number Names", "Counting Forward & Backward", "Before/After/Between", "Ordinal Numbers", "Comparing Numbers", "Patterns", "Sorting & Classifying", "Measurement (Longer/Shorter)", "Skip Counting"],
  "SK-Term 2-UKG-Maths":    ["Numbers 21–50", "Subtraction (Single Digit)", "Measurement", "Number Bonds to 10", "Shapes (2D and 3D)", "Money (Coins)", "Place Value (Tens & Ones)", "Time (O'clock)", "Data Handling (Pictograph)", "Doubling and Halving", "Addition Word Problems", "Symmetry (intro)"],
  "SK-Term 3-UKG-Maths":    ["Numbers 51–100", "Patterns", "Time (Day/Night)", "Addition & Subtraction Review", "Fractions (Half)", "Calendar", "Weight (Heavier/Lighter)", "Capacity (More/Less)", "Number Sequencing", "Word Problems", "3D Shapes", "Mental Maths"],
  "SK-Term 1-UKG-EVS/Science": ["My Senses", "Plants (Parts)", "Animals (Domestic, Wild)", "Living and Non-living", "Healthy Food", "Water Sources", "My Body and Health", "Birds and Nests", "Colours in Nature", "Clean Environment"],
  "SK-Term 2-UKG-EVS/Science": ["Food and Health", "Water and its Uses", "Air", "Insects and Bugs", "Fruits and Vegetables", "Materials Around Us", "Safety Rules", "Weather Chart", "Animals and Babies", "Soil and Mud"],
  "SK-Term 3-UKG-EVS/Science": ["Seasons and Weather", "Transport", "Festivals", "Day and Night", "Sun, Moon and Stars", "Plants We Eat", "Sound Around Us", "Recycling", "Good Habits for Environment", "Fun Science Activities"],

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
  "SK-Term 1-3rd-Tamil":    ["நிலா (கவிதை)", "செய்யுள்", "பாடல் – நம் தமிழ்", "பெயர்ச்சொல் (இட/காலப் பெயர்)", "வினைச்சொல் வகைகள்", "உரைநடை புரிதல்", "எதிர்ச்சொல்", "ஒருமை – பன்மை", "இணைச்சொல்", "உவமை & அணி", "கட்டுரை (என் ஊர்)", "கடிதம் எழுதுதல் (முறையான)", "திருக்குறள் (எளிய)", "படிக்கும் பகுதி"],
  "SK-Term 2-3rd-Tamil":    ["உரைநடை", "பெயர்ச்சொல் வகைகள்", "வினைமுற்று", "காலம் (இறந்தகாலம், நிகழ்காலம், எதிர்காலம்)", "வேற்றுமை உருபுகள்", "பழமொழிகள்", "மரபுத்தொடர்", "சொற்பொருள் (ஓரெழுத்து ஒருமொழி)", "விடுகதைகள்", "கதை எழுதுதல்", "தன்வரலாறு (என் வாழ்க்கை)", "பத்தி எழுதுதல்", "நிரப்புக & பொருத்துக"],
  "SK-Term 3-3rd-Tamil":    ["புணர்ச்சி", "மடக்கு அணி", "தொகைச்சொல்", "இலக்கணம் – பிரித்து எழுதுக", "சேர்த்து எழுதுக", "உவமை அணி", "எழுவாய் – பயனிலை", "செய்யுள் பொருள்", "அகராதிப் பயன்பாடு", "கட்டுரை எழுதுதல்", "சொல் வளம்", "கவிதை எழுதுதல்", "செய்தித்தாள் படிக்கலாம்"],
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
  "SK-Term 2-4th-Tamil":    ["வீரமாமுனிவர்", "செய்யுள்", "பாரதியார் பாடல்", "சந்திப் பிழை திருத்தம்", "சொல் வகைகள் (தொழிற்பெயர், வினையெச்சம்)", "உவமை & உருவகம்", "பத்தி எழுதுதல்", "நாட்குறிப்பு எழுதுதல்", "செய்தி எழுதுதல்", "உரையாடல் எழுதுதல்", "புணர்ச்சி விதிகள்", "படிக்கும் பகுதி (புதிய உரைநடை)"],
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
  "SK-Term 1-5th-Tamil":    ["வீரமாமுனிவர்", "பாரதியார் கவிதை", "திருக்குறள் (அதிகாரம் 1–5)", "இலக்கணம் – வேற்றுமை", "வினா வகைகள்", "அணிகள் (உவமை, உருவகம், தற்குறிப்பேற்றம்)", "கட்டுரை (தமிழின் சிறப்பு)", "முறையான கடிதம்", "உரையாடல் எழுதுதல்", "செய்யுள் விளக்கம்", "மொழிபெயர்ப்பு", "அறிக்கை எழுதுதல்", "பேச்சுப் பயிற்சி (பட்டிமன்றம்)"],
  "SK-Term 2-5th-Tamil":    ["ஔவையார் பாடல்கள்", "உரைநடை", "இலக்கணம் – சொல் வகைகள்", "காலம் (எல்லா வடிவங்கள்)", "சந்திப் பிழை & எழுத்துப் பிழை", "புணர்ச்சி விதிகள்", "நாட்குறிப்பு எழுதுதல்", "செய்தி எழுதுதல்", "பத்தி எழுதுதல்", "சுருக்கி எழுதுதல்", "விளம்பரம் எழுதுதல்", "அகராதிப் பயன்பாடு", "படிக்கும் பகுதி (அபூர்வ உரைநடை)"],
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

  // Pre-KG Samacheer
  "SK-Term 1-Pre-KG-Tamil":    ["அ, ஆ", "பழங்கள்", "விலங்குகள்", "வண்ணங்கள்", "என் பெயர்", "எண்கள் 1-3", "உடல் பாகங்கள்", "படம் பார்த்து சொல்", "நல்ல பழக்கங்கள்", "என் குடும்பம்"],
  "SK-Term 2-Pre-KG-Tamil":    ["இ, ஈ, உ", "பூக்கள்", "வண்ணங்கள்", "பறவைகள்", "காய்கறிகள்", "என் வீடு", "வடிவங்கள்", "ஒலி எழுப்புதல்", "சுட்டு சொல்", "உணவு வகைகள்"],
  "SK-Term 3-Pre-KG-Tamil":    ["ஊ, எ, ஏ", "வீட்டு பொருட்கள்", "என் குடும்பம்", "வாகனங்கள்", "பருவகாலங்கள்", "நாட்கள்", "எதிர்ச்சொல் (பெரிய/சிறிய)", "கதை கேட்கலாம்", "பாடல் பாடலாம்", "என் பள்ளி"],
  "SK-Term 1-Pre-KG-English":  ["A B C", "Colours", "Animals", "Alphabet Tracing A–L", "Rhyming Words", "Action Words (Jump, Clap)", "Greetings (Hello, Bye)", "Naming Things", "Picture Naming", "Opposites (Big/Small)"],
  "SK-Term 2-Pre-KG-English":  ["D E F", "Fruits", "My Body", "Alphabet Tracing M–Z", "Sight Words (I, am, the)", "Colour Words", "Matching Words to Pictures", "Simple Rhymes", "My Toys", "Singular and Plural (s)"],
  "SK-Term 3-Pre-KG-English":  ["G H I J", "My Home", "Shapes", "CVC Words (cat, bat)", "Reading Simple Words", "Sentence Starters (I am, I see)", "Days of the Week", "Good Manners Words", "Story Listening", "My Favourite Things"],
  "SK-Term 1-Pre-KG-Maths":    ["Numbers 1–3", "Shapes", "Big and Small", "Counting Objects", "Colouring by Number", "Top and Bottom", "Heavy and Light", "Sorting by Colour", "Same and Different", "More and Less"],
  "SK-Term 2-Pre-KG-Maths":    ["Numbers 4–7", "Tall and Short", "Patterns", "Counting Forward", "Near and Far", "Thick and Thin", "Left and Right", "Ordering by Size", "Number Tracing", "Shapes (Circle, Square, Triangle)"],
  "SK-Term 3-Pre-KG-Maths":    ["Numbers 8–10", "Inside and Outside", "Counting", "Above and Below", "Before and After", "Long and Short", "Empty and Full", "Sequencing (1st, 2nd, 3rd)", "Number Names", "Addition (Pictorial)"],
  "SK-Term 1-Pre-KG-EVS/Science": ["My Senses", "My Body", "My Family", "Colours in Nature", "Animals I See", "Things at Home", "Clean and Dirty", "Healthy Food", "Day and Night", "Plants I See"],
  "SK-Term 2-Pre-KG-EVS/Science": ["Animals Around Me", "Plants", "Food I Eat", "Fruits I Know", "Vegetables I Know", "My Clothes", "Hot and Cold", "Birds Around Us", "Flowers and Trees", "Good Habits"],
  "SK-Term 3-Pre-KG-EVS/Science": ["Water", "Air", "Clean Habits", "Seasons", "Safety at Home", "Transport I See", "Insects", "Sun, Moon and Stars", "My Neighbourhood", "Recycling (intro)"],

  // ══════════════════════════════════════════════════════
  // HINDI TOPICS (Samacheer & Merry Birds)
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
  "SK-Term 3-4th-Hindi":    ["संधि", "अलंकार", "कहानी लेखन", "संधि विच्छेद", "समास विग्रह", "मुहावरे और लोकोक्तियाँ", "निबंध (प्रदूषण, पर्यावरण)", "विज्ञापन लेखन", "रिपोर्ट लेखन", "कविता लेखन", "सारांश लेखन", "संपादन (वर्तनी/व्याकरण)", "व्याकरण मूल्यांकन"],
  "SK-Term 1-5th-Hindi":    ["क्रिया विशेषण", "समुच्चय बोधक", "औपचारिक पत्र", "क्रिया विशेषण के भेद (रीतिवाचक, कालवाचक, स्थानवाचक)", "वाच्य (कर्तृवाच्य, कर्मवाच्य)", "संधि (व्यंजन संधि)", "समास (बहुव्रीहि, अव्ययीभाव)", "निबंध (विज्ञान, प्रौद्योगिकी)", "अपठित गद्यांश", "संवाद लेखन", "विवाद/वाद-विवाद", "अलंकार (अनुप्रास, यमक)", "सारांश लेखन"],
  "SK-Term 2-5th-Hindi":    ["रस", "छंद", "संवाद लेखन", "रस के भेद (श्रृंगार, वीर, करुण)", "छंद (दोहा, चौपाई)", "मुहावरे और लोकोक्तियाँ", "वाक्य रूपांतरण (सरल, संयुक्त, मिश्र)", "पत्र (प्रधानाचार्य को)", "डायरी लेखन", "ईमेल लेखन", "अपठित पद्यांश", "कविता की सराहना"],
  "SK-Term 3-5th-Hindi":    ["अपठित गद्यांश", "व्याकरण समीक्षा", "निबंध - विज्ञान", "कहानी लेखन (कल्पनात्मक)", "विवाद लेखन", "रिपोर्ट लेखन", "भाषण लेखन", "काव्य विश्लेषण", "संपादन (वर्तनी और व्याकरण)", "वाक्य परिवर्तन", "शब्द भंडार मूल्यांकन", "साहित्य समीक्षा", "मुहावरे & लोकोक्तियाँ समीक्षा"],
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

  // ══════════════════════════════════════════════════════
  // HINDI — Pre-KG, LKG, UKG (Samacheer & Merry Birds)
  // ══════════════════════════════════════════════════════
  "SK-Term 1-Pre-KG-Hindi":  ["अ, आ (स्वर)", "गिनती 1-3", "मेरा नाम", "रंगों के नाम", "फल के नाम", "जानवरों के नाम", "शरीर के अंग (सिर, हाथ)", "चित्र पहचानो", "बड़ा/छोटा", "अभिवादन (नमस्ते)"],
  "SK-Term 2-Pre-KG-Hindi":  ["इ, ई, उ (स्वर)", "रंग", "फल", "सब्जियों के नाम", "पक्षियों के नाम", "मेरा घर", "खिलौनों के नाम", "चित्र देखो बोलो", "आकार (गोला, चौकोर)", "मेरा परिवार"],
  "SK-Term 3-Pre-KG-Hindi":  ["ऊ, ए, ऐ (स्वर)", "जानवर", "मेरा शरीर", "वाहनों के नाम", "मौसम", "दिनों के नाम", "अच्छी आदतें", "कहानी सुनो", "गाना गाओ", "मेरा विद्यालय"],
  "SK-Term 1-LKG-Hindi":     ["स्वर (अ-औ)", "गिनती 1-10", "मेरा परिवार", "व्यंजन (क, ख, ग)", "फल और सब्जियाँ", "जानवर और उनकी आवाज़", "रंग और आकार", "शरीर के अंग", "चित्र देखो शब्द बोलो", "मेरा नाम लिखो"],
  "SK-Term 2-LKG-Hindi":     ["व्यंजन (क-ङ)", "फल और सब्जियाँ", "रंग और आकार", "व्यंजन (च-ञ)", "पक्षियों के नाम", "विलोम (बड़ा/छोटा)", "मेरा विद्यालय", "दिनों के नाम", "सरल शब्द पढ़ो", "चित्र मिलाओ"],
  "SK-Term 3-LKG-Hindi":     ["व्यंजन (च-ञ)", "जानवर", "मेरा विद्यालय", "व्यंजन (ट-न)", "दो अक्षर के शब्द", "त्योहार", "अच्छी आदतें", "कविता पढ़ो", "कहानी सुनो और सुनाओ", "मौसम"],
  "SK-Term 1-UKG-Hindi":     ["व्यंजन (ट-प)", "सरल शब्द पढ़ो", "मेरा घर", "व्यंजन (फ-ह)", "मात्राएँ (आ की मात्रा)", "दो अक्षर के शब्द", "विलोम शब्द", "चित्र वर्णन", "गिनती 1-20", "सरल वाक्य (यह है...)"],
  "SK-Term 2-UKG-Hindi":     ["व्यंजन (फ-ह)", "दो अक्षर के शब्द", "शरीर के अंग", "मात्राएँ (इ, ई)", "तीन अक्षर के शब्द", "एकवचन/बहुवचन", "जानवर और उनके बच्चे", "प्रश्न पूछो (क्या, कौन)", "शब्द जोड़ो", "सरल कहानी पढ़ो"],
  "SK-Term 3-UKG-Hindi":     ["मात्राएँ (आ, इ)", "सरल वाक्य", "त्योहार", "मात्राएँ (उ, ऊ)", "विलोम शब्द", "लिंग (लड़का/लड़की)", "कविता याद करो", "कहानी सुनो और प्रश्न उत्तर दो", "चित्र देखो वाक्य लिखो", "श्रुतलेख (सरल)"],
  "MB-Term 1-Pre-KG-Hindi":  ["अ, आ (स्वर)", "गिनती 1-3", "मेरा नाम", "रंगों के नाम", "फल के नाम", "जानवरों के नाम", "शरीर के अंग", "चित्र पहचानो", "बड़ा/छोटा", "अभिवादन (नमस्ते)"],
  "MB-Term 2-Pre-KG-Hindi":  ["इ, ई, उ (स्वर)", "रंग", "फल", "सब्जियों के नाम", "पक्षियों के नाम", "मेरा घर", "खिलौनों के नाम", "चित्र देखो बोलो", "आकार", "मेरा परिवार"],
  "MB-Term 3-Pre-KG-Hindi":  ["ऊ, ए, ऐ (स्वर)", "जानवर", "मेरा शरीर", "वाहनों के नाम", "मौसम", "दिनों के नाम", "अच्छी आदतें", "कहानी सुनो", "गाना गाओ", "मेरा विद्यालय"],
  "MB-Term 1-LKG-Hindi":     ["स्वर (अ-औ)", "गिनती 1-10", "मेरा परिवार", "व्यंजन (क, ख, ग)", "फल और सब्जियाँ", "जानवर और आवाज़", "रंग और आकार", "शरीर के अंग", "चित्र देखो शब्द बोलो", "मेरा नाम लिखो"],
  "MB-Term 2-LKG-Hindi":     ["व्यंजन (क-ङ)", "फल और सब्जियाँ", "रंग और आकार", "व्यंजन (च-ञ)", "पक्षी", "विलोम (बड़ा/छोटा)", "दिनों के नाम", "सरल शब्द पढ़ो", "मेरा विद्यालय", "चित्र मिलाओ"],
  "MB-Term 3-LKG-Hindi":     ["व्यंजन (च-ञ)", "जानवर", "मेरा विद्यालय", "व्यंजन (ट-न)", "दो अक्षर के शब्द", "त्योहार", "अच्छी आदतें", "कविता पढ़ो", "कहानी सुनो", "मौसम"],
  "MB-Term 1-UKG-Hindi":     ["व्यंजन (ट-प)", "सरल शब्द पढ़ो", "मेरा घर", "मात्राएँ (आ)", "दो अक्षर के शब्द", "विलोम शब्द", "चित्र वर्णन", "गिनती 1-20", "सरल वाक्य", "मेरा परिवार"],
  "MB-Term 2-UKG-Hindi":     ["व्यंजन (फ-ह)", "दो अक्षर के शब्द", "शरीर के अंग", "मात्राएँ (इ, ई)", "तीन अक्षर के शब्द", "एकवचन/बहुवचन", "प्रश्न पूछो", "शब्द जोड़ो", "सरल कहानी पढ़ो", "जानवर और बच्चे"],
  "MB-Term 3-UKG-Hindi":     ["मात्राएँ (आ, इ)", "सरल वाक्य", "त्योहार", "मात्राएँ (उ, ऊ)", "विलोम शब्द", "लिंग", "कविता याद करो", "कहानी सुनो", "चित्र देखो वाक्य लिखो", "श्रुतलेख"],
};

// ─── Diagram SVG Component ─────────────────────────────────────────────────

function DiagramBox({ topic, labels }: { topic: string; labels?: string[] }) {
  const lower = topic.toLowerCase();
  const isPlant = ["plant", "flower", "தாவரம்", "செடி", "மரம்", "பூ"].some((k) => lower.includes(k));
  const isBody = ["body", "human", "உடல்", "மனித"].some((k) => lower.includes(k));
  const isSolar = ["solar", "planet", "சூரிய", "கோள்"].some((k) => lower.includes(k));
  const isWater = ["water cycle", "நீர் சுழற்சி", "rain", "cloud"].some((k) => lower.includes(k));

  return (
    <div className="border-2 border-dashed border-gray-300 print:border-gray-500 rounded-xl p-4 bg-gray-50 print:bg-transparent">
      <div className="flex flex-col items-center">
        {isPlant ? (
          <svg viewBox="0 0 300 280" className="w-64 h-56 mb-3" xmlns="http://www.w3.org/2000/svg">
            {/* Stem */}
            <line x1="150" y1="260" x2="150" y2="120" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
            {/* Roots */}
            <line x1="150" y1="260" x2="100" y2="285" stroke="#92400e" strokeWidth="3" />
            <line x1="150" y1="260" x2="130" y2="285" stroke="#92400e" strokeWidth="3" />
            <line x1="150" y1="260" x2="165" y2="285" stroke="#92400e" strokeWidth="3" />
            <line x1="150" y1="260" x2="190" y2="280" stroke="#92400e" strokeWidth="3" />
            {/* Left leaf */}
            <ellipse cx="105" cy="170" rx="35" ry="18" fill="#86efac" stroke="#22c55e" strokeWidth="1.5" transform="rotate(-30 105 170)" />
            <line x1="150" y1="180" x2="105" y2="170" stroke="#4ade80" strokeWidth="2" />
            {/* Right leaf */}
            <ellipse cx="195" cy="160" rx="35" ry="18" fill="#86efac" stroke="#22c55e" strokeWidth="1.5" transform="rotate(30 195 160)" />
            <line x1="150" y1="165" x2="195" y2="160" stroke="#4ade80" strokeWidth="2" />
            {/* Flower */}
            <circle cx="150" cy="110" r="22" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="150" cy="110" r="10" fill="#f59e0b" />
            {[0,60,120,180,240,300].map((angle, i) => (
              <ellipse key={i} cx={150 + 22 * Math.cos((angle * Math.PI) / 180)} cy={110 + 22 * Math.sin((angle * Math.PI) / 180)} rx="10" ry="6" fill="#fca5a5" transform={`rotate(${angle} ${150 + 22 * Math.cos((angle * Math.PI) / 180)} ${110 + 22 * Math.sin((angle * Math.PI) / 180)})`} />
            ))}
            {/* Soil */}
            <rect x="80" y="268" width="140" height="8" rx="4" fill="#a16207" />
            {/* Labels */}
            <text x="15" y="115" fontSize="11" fill="#166534" fontWeight="bold">Flower/பூ</text>
            <text x="55" y="140" fontSize="11" fill="#166534">Leaf/இலை</text>
            <text x="165" y="200" fontSize="11" fill="#166534">Stem/தண்டு</text>
            <text x="165" y="240" fontSize="11" fill="#166534">Root/வேர்</text>
            {/* Arrows */}
            <line x1="70" y1="112" x2="128" y2="110" stroke="#15803d" strokeWidth="1" markerEnd="url(#arr)" />
            <line x1="108" y1="136" x2="125" y2="155" stroke="#15803d" strokeWidth="1" />
            <line x1="163" y1="195" x2="153" y2="175" stroke="#15803d" strokeWidth="1" />
            <line x1="163" y1="237" x2="153" y2="250" stroke="#15803d" strokeWidth="1" />
          </svg>
        ) : isBody ? (
          <svg viewBox="0 0 200 260" className="w-48 h-56 mb-3" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="35" r="28" fill="#fde8d0" stroke="#d1a07a" strokeWidth="2" />
            <rect x="70" y="65" width="60" height="80" rx="8" fill="#fde8d0" stroke="#d1a07a" strokeWidth="2" />
            <line x1="70" y1="75" x2="35" y2="140" stroke="#d1a07a" strokeWidth="10" strokeLinecap="round" />
            <line x1="130" y1="75" x2="165" y2="140" stroke="#d1a07a" strokeWidth="10" strokeLinecap="round" />
            <line x1="85" y1="145" x2="75" y2="220" stroke="#d1a07a" strokeWidth="12" strokeLinecap="round" />
            <line x1="115" y1="145" x2="125" y2="220" stroke="#d1a07a" strokeWidth="12" strokeLinecap="round" />
            <text x="115" y="30" fontSize="9" fill="#1e3a5f" fontWeight="bold">Head/தலை</text>
            <text x="135" y="105" fontSize="9" fill="#1e3a5f">Arm/கை</text>
            <text x="135" y="190" fontSize="9" fill="#1e3a5f">Leg/கால்</text>
            <text x="5" y="105" fontSize="9" fill="#1e3a5f">Arm</text>
          </svg>
        ) : isSolar ? (
          <svg viewBox="0 0 320 200" className="w-72 h-44 mb-3" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="100" r="28" fill="#fbbf24" />
            <text x="35" y="140" fontSize="9" fill="#92400e" fontWeight="bold">Sun/சூரியன்</text>
            {[
              { cx: 100, cy: 100, r: 6, fill: "#a78bfa", name: "Mercury" },
              { cx: 128, cy: 100, r: 8, fill: "#60a5fa", name: "Venus" },
              { cx: 160, cy: 100, r: 10, fill: "#34d399", name: "Earth" },
              { cx: 196, cy: 100, r: 7, fill: "#f87171", name: "Mars" },
              { cx: 232, cy: 100, r: 14, fill: "#fb923c", name: "Jupiter" },
              { cx: 272, cy: 100, r: 11, fill: "#facc15", name: "Saturn" },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} />
                <text x={p.cx - 12} y={p.cy + p.r + 14} fontSize="7" fill="#1e3a5f">{p.name}</text>
              </g>
            ))}
          </svg>
        ) : isWater ? (
          <svg viewBox="0 0 300 200" className="w-64 h-44 mb-3" xmlns="http://www.w3.org/2000/svg">
            {/* Sun */}
            <circle cx="260" cy="40" r="22" fill="#fbbf24" />
            {/* Cloud */}
            <ellipse cx="100" cy="50" rx="50" ry="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="70" cy="58" rx="30" ry="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="130" cy="58" rx="30" ry="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Rain */}
            {[85,100,115,130].map((x, i) => (
              <line key={i} x1={x} y1="75" x2={x - 5} y2="95" stroke="#3b82f6" strokeWidth="2" />
            ))}
            {/* Water body */}
            <ellipse cx="150" cy="180" rx="120" ry="18" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Evaporation arrows */}
            <path d="M 160 162 Q 200 130 230 80" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="5,4" />
            <text x="205" y="115" fontSize="9" fill="#d97706" fontWeight="bold">Evaporation</text>
            <text x="58" y="45" fontSize="9" fill="#475569" fontWeight="bold">Cloud</text>
            <text x="70" y="100" fontSize="9" fill="#1d4ed8">Rain</text>
            <text x="100" y="176" fontSize="9" fill="#1d4ed8">Water Body</text>
          </svg>
        ) : (
          /* Generic blank diagram box */
          <div className="w-64 h-44 border-2 border-gray-300 print:border-gray-600 rounded-lg bg-white flex items-center justify-center mb-3">
            <div className="text-center text-gray-400">
              <PenLine className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Draw your diagram here</p>
              <p className="text-xs tamil-font opacity-60">இங்கே படம் வரைக</p>
            </div>
          </div>
        )}

        {/* Label lines for students to fill */}
        <div className="w-full grid grid-cols-2 gap-3 mt-2">
          {(labels && labels.length > 0 ? labels : ["Label 1", "Label 2", "Label 3", "Label 4"]).map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 w-5">{i + 1}.</span>
              <div className="flex-1 border-b-2 border-dashed border-gray-400 print:border-gray-600 h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorksheetMaker() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData_>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("worksheet_form_settings") || "{}");
      return {
        curriculum: saved.curriculum || "Samacheer Kalvi (Tamil Nadu State Board)",
        term: saved.term || "Term 1",
        grade: saved.grade || "3rd",
        subject: saved.subject || "Maths",
        topic: "",
        numQuestions: 10,
        numSets: 1,
        language: saved.language || "English",
        difficulty: saved.difficulty || "Medium",
        questionTypes: saved.questionTypes || [],
        hindiSyllabus: saved.hindiSyllabus || "none",
        bilingualPair: saved.bilingualPair || "English+Tamil",
      };
    } catch {
      return {
        curriculum: "Samacheer Kalvi (Tamil Nadu State Board)",
        term: "Term 1",
        grade: "3rd",
        subject: "Maths",
        topic: "",
        numQuestions: 10,
        numSets: 1,
        language: "English",
        difficulty: "Medium",
        questionTypes: [],
        hindiSyllabus: "none",
        bilingualPair: "English+Tamil",
      };
    }
  });
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [worksheetSets, setWorksheetSets] = useState<Worksheet[]>([]);
  const [activeSetIndex, setActiveSetIndex] = useState(0);

  // Always derive the displayed worksheet from worksheetSets when available
  const displayedWorksheet = worksheetSets.length > 0 ? worksheetSets[activeSetIndex] ?? null : worksheet;
  const [loading, setLoading] = useState(false);
  const [loadingSetIndex, setLoadingSetIndex] = useState<number | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savedList, setSavedList] = useState<SavedWorksheet[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Load from IndexedDB on mount (merge with localStorage)
  useEffect(() => {
    offlineDb.getAllWorksheets().then((idbItems) => {
      if (!idbItems.length) return;
      setSavedList((prev) => {
        const existingIds = new Set(prev.map((w) => w.id));
        const merged = [...prev, ...idbItems.filter((w) => !existingIds.has(w.id))].slice(0, 50);
        return merged;
      });
    }).catch(() => {});
  }, []);

  // Auto-save form settings to localStorage for offline resume
  useEffect(() => {
    try {
      localStorage.setItem("worksheet_form_settings", JSON.stringify({
        curriculum: formData.curriculum,
        term: formData.term,
        grade: formData.grade,
        subject: formData.subject,
        language: formData.language,
        difficulty: formData.difficulty,
        questionTypes: formData.questionTypes,
      }));
    } catch {}
  }, [formData.curriculum, formData.term, formData.grade, formData.subject, formData.language, formData.difficulty, formData.questionTypes]);
  const [showSaved, setShowSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  // Update topic suggestions when grade/subject changes
  useEffect(() => {
    const isMB = formData.curriculum === "Oxford Merry Birds (Integrated Term Course)";
    const curricShort = isMB ? "MB" : "SK";
    const key = `${curricShort}-${formData.term}-${formData.grade}-${formData.subject}`;
    setSuggestions(TOPIC_SUGGESTIONS_MAP[key] || []);
    setShowHints(false);
  }, [formData.curriculum, formData.term, formData.grade, formData.subject]);

  // ─── Generate one set (with retry on 429) ─────────────────────────────────

  const generateOneSet = async (setNumber: number, attempt = 1): Promise<Worksheet> => {
    const randomSeed = Math.random();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout
    let res: Response;
    try {
      res = await fetch(`${SUPABASE_URL}/functions/v1/generate-worksheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ ...formData, setNumber, randomSeed }),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        if (attempt <= 2) {
          await new Promise((r) => setTimeout(r, 3000));
          return generateOneSet(setNumber, attempt + 1);
        }
        throw new Error("Request timed out. Please check your internet connection and try again.");
      }
      if (attempt <= 2) {
        await new Promise((r) => setTimeout(r, 5000 * attempt));
        return generateOneSet(setNumber, attempt + 1);
      }
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    clearTimeout(timeoutId);
    const data = await res.json();
    if (res.status === 402) throw new Error("AI worksheet generation is temporarily unavailable (usage limit reached). Please try again later.");
    if (res.status === 429) {
      if (attempt <= 4) {
        const waitMs = 8000 * attempt;
        await new Promise((r) => setTimeout(r, waitMs));
        return generateOneSet(setNumber, attempt + 1);
      }
      throw new Error("Rate limit reached. Please wait 30 seconds and try generating fewer sets at once.");
    }
    if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
    return data.worksheet;
  };

  // ─── Generate (single or multi-set) ────────────────────────────────────────

  const generate = async () => {
    if (!formData.topic.trim()) {
      toast({ title: "Please enter a topic", description: "e.g. Addition, Animals, எழுத்துக்கள்", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      toast({ title: "You are offline 📶", description: "Worksheet generation needs internet. You can still view saved worksheets below.", variant: "destructive" });
      setShowSaved(true);
      return;
    }

    const numSets = formData.numSets || 1;
    setLoading(true);
    setWorksheet(null);
    setWorksheetSets([]);
    setActiveSetIndex(0);
    setGenerateError(null);
    setShowAnswers(false);

    try {
      if (numSets === 1) {
        setLoadingSetIndex(1);
        const ws = await generateOneSet(1);
        setWorksheet(ws);
        setWorksheetSets([ws]);
        toast({ title: "Worksheet generated! ✨", description: "Scroll down to view your worksheet." });
      } else {
        // Multi-set: generate sequentially with a delay between calls to avoid rate limits
        const sets: Worksheet[] = [];
        for (let i = 1; i <= numSets; i++) {
          setLoadingSetIndex(i);
          // Add a 6-second gap between requests to respect Groq rate limits
          if (i > 1) await new Promise((r) => setTimeout(r, 6000));
          const ws = await generateOneSet(i);
          ws.title = ws.title.replace(/Set \d+ of \d+ — /g, "");
          ws.title = `Set ${i} of ${numSets} — ${ws.title}`;
          sets.push(ws);
          setWorksheetSets([...sets]);
        }
        setWorksheet(sets[0]);
        setActiveSetIndex(0);
        toast({ title: `${numSets} unique sets generated! ✨`, description: "Switch between sets using the tabs above the worksheet." });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate worksheet";
      setGenerateError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingSetIndex(null);
    }
  };

  const saveWorksheet = () => {
    if (!displayedWorksheet) return;
    const saved: SavedWorksheet = {
      id: Date.now().toString(),
      title: displayedWorksheet.title,
      savedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      worksheet: displayedWorksheet,
      formData,
    };
    const updated = [saved, ...savedList].slice(0, 50);
    setSavedList(updated);
    // Save to localStorage (quick access) + IndexedDB (larger storage)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
    } catch {}
    offlineDb.saveWorksheet(saved).catch(() => {});
    toast({ title: "Saved locally! 💾", description: "Accessible anytime, even offline." });
  };

  const deleteSaved = (id: string) => {
    const updated = savedList.filter((w) => w.id !== id);
    setSavedList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    offlineDb.deleteWorksheet(id).catch(() => {});
  };

  const loadSaved = (saved: SavedWorksheet) => {
    setWorksheet(saved.worksheet);
    setFormData(saved.formData);
    setShowSaved(false);
    setShowAnswers(false);
    toast({ title: "Worksheet loaded!", description: saved.title });
  };

  // ─── Print / PDF / Word ────────────────────────────────────────────────────

  const handlePrint = () => {
    const prev = showAnswers;
    setShowAnswers(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowAnswers(prev), 500);
    }, 300);
  };

  const handleShareWhatsApp = () => {
    if (!displayedWorksheet) return;
    const pageUrl = window.location.href;
    const message = `📚 *NethajiVidhyalayam Worksheet Maker*\n\n✏️ *${displayedWorksheet.title}*\n🎓 Grade: ${displayedWorksheet.grade} | Subject: ${displayedWorksheet.subject} | ${formData.term}\n\nGenerate your own worksheets here:\n${pageUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDownloadWord = () => {
    if (!displayedWorksheet) return;
    // Build a simple HTML string that Word can open as .doc
    const sections = displayedWorksheet.sections?.map((section) => {
      const qs = section.questions.map((q) => {
        if (section.type === "fill_in_blanks") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${(q.question || "").replace(/_{2,}|\[_+\]/g, "___________________________")}</p>`;
        }
        if (section.type === "multiple_choice") {
          const opts = (q.options || []).map((o, i) => `&nbsp;&nbsp;${String.fromCharCode(65+i)}) ${o.replace(/^[a-dA-D]\)\s*/, "")}`).join("<br/>");
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question}</p><p style="margin-left:20px">${opts}</p>`;
        }
        if (section.type === "match_following") {
          const rows = (q.left || []).map((l, i) =>
            `<tr><td style="border:1px solid #ccc;padding:6px;width:50%">${i+1}. ${l}</td><td style="border:1px solid #ccc;padding:6px;width:50%">${String.fromCharCode(97+i)}. ${q.right?.[i] || ""}</td></tr>`
          ).join("");
          return `<table style="width:100%;border-collapse:collapse;margin:8px 0">${rows}</table>`;
        }
        if (section.type === "true_false") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question} &nbsp;&nbsp;[ True / False ]</p>`;
        }
        if (section.type === "short_answer") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question}</p><p style="border-bottom:1px solid #999;margin:4px 20px">&nbsp;</p><p style="border-bottom:1px solid #999;margin:4px 20px">&nbsp;</p>`;
        }
        if (section.type === "diagram") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question}</p><div style="border:2px dashed #aaa;width:80%;height:180px;margin:8px 0;display:flex;align-items:center;justify-content:center"><span style="color:#aaa">[ Draw here ]</span></div>`;
        }
        return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question || ""}</p>`;
      }).join("");
      return `<h3 style="background:#e0f2fe;padding:8px 12px;margin-top:20px;font-size:14px">${section.heading}</h3>${qs}`;
    }).join("") || "";

    const answerKey = showAnswers ? `
      <div style="page-break-before:always">
        <h2 style="color:#166534">Answer Key</h2>
        ${displayedWorksheet.sections?.map(s => `
          <p><b>${s.heading}</b></p>
          ${s.questions.filter(q=>q.answer).map(q =>
            s.type === "match_following"
              ? `<p>${q.id}. ${q.left?.map((l,i) => `${l} → ${q.answers?.[i]}`).join(" | ")}</p>`
              : `<p>${q.id}. ${q.answer}</p>`
          ).join("")}
        `).join("")}
      </div>` : "";

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${displayedWorksheet.title}</title>
      <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
      <style>
        @page { size: A4 portrait; margin: 1.5cm 2cm; }
        body { font-family: 'Noto Sans Tamil', Arial, sans-serif; font-size: 13px; color: #111; margin: 0; padding: 0; }
        h1 { font-size: 18px; text-align: center; color: #1a3a5c; margin: 4px 0; }
        h2 { font-size: 15px; color: #1a3a5c; }
        h3 { font-size: 13px; }
        p { margin: 6px 0; }
        table { border-collapse: collapse; width: 100%; }
      </style>
      </head>
      <body>
        <div style="text-align:center;margin-bottom:12px">
          <img src="${window.location.origin}/nethaji_logo_print.webp" alt="Logo" style="width:70px;height:70px;object-fit:contain" />
          <h1 style="margin:4px 0">${displayedWorksheet.title}</h1>
          <p style="margin:2px 0;color:#555;font-size:12px">${formData.curriculum} · ${formData.grade} · ${formData.subject} · ${formData.term}</p>
        </div>
        <hr style="border:1px solid #1a3a5c"/>
        <p style="font-size:12px"><b>Name:</b> _____________________________ &nbsp;&nbsp; <b>Date:</b> __________________ &nbsp;&nbsp; <b>Score:</b> ______ / ${formData.numQuestions}</p>
        
        ${sections}
        ${answerKey}
      </body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayedWorksheet.title.replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s]/g, "")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Word file downloaded! 📄", description: "Open with Microsoft Word or LibreOffice." });
  };

  // ─── Edit helpers ──────────────────────────────────────────────────────────

  const updateQuestion = (sIdx: number, qIdx: number, field: string, value: string) => {
    if (worksheetSets.length > 0) {
      const currentWs = worksheetSets[activeSetIndex];
      if (!currentWs) return;
      const updated = { ...currentWs };
      updated.sections = currentWs.sections.map((s, si) =>
        si === sIdx
          ? { ...s, questions: s.questions.map((q, qi) => qi === qIdx ? { ...q, [field]: value } : q) }
          : s
      );
      const newSets = [...worksheetSets];
      newSets[activeSetIndex] = updated;
      setWorksheetSets(newSets);
    } else {
      if (!worksheet) return;
      const updated = { ...worksheet };
      updated.sections = worksheet.sections.map((s, si) =>
        si === sIdx
          ? { ...s, questions: s.questions.map((q, qi) => qi === qIdx ? { ...q, [field]: value } : q) }
          : s
      );
      setWorksheet(updated);
    }
  };

  // ─── Render section ────────────────────────────────────────────────────────

  const renderSection = (section: Section, sIdx: number) => {
    switch (section.type) {
      case "fill_in_blanks":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-5 ${gradeLineHeight}`}>
            <p className={`font-medium text-gray-800 print:text-black ${gradeFontSize} leading-[2.4]`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {editMode ? (
                <input className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
              ) : (
                <span>{(q.question || "").split(/_{2,}|\[_+\]/).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="inline-block border-b-2 border-gray-500 print:border-black min-w-[120px] mx-1 align-bottom">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                  </React.Fragment>
                ))}</span>
              )}
            </p>
            {showAnswers && <p className="text-green-700 text-sm mt-1 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "multiple_choice":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-6 ${gradeLineHeight}`}>
            <p className={`font-medium text-gray-800 print:text-black mb-3 ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {editMode ? (
                <input className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
              ) : q.question}
            </p>
            <div className="grid grid-cols-2 gap-3 ml-6">
              {q.options?.map((opt, oi) => (
                <label key={oi} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-sm shrink-0 mt-0.5 print:border-black" />
                  <span className={`${gradeFontSize} text-gray-700 print:text-black tamil-font`}>{String.fromCharCode(65 + oi)}) {opt.replace(/^[a-dA-D]\)\s*/, "")}</span>
                </label>
              ))}
            </div>
            {showAnswers && <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "match_following":
        return section.questions.map((q) => (
          <div key={q.id} className="mb-8">
            <div className="w-full border-2 border-gray-300 print:border-gray-600 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-2">
                <div className="bg-sky-100 print:bg-gray-100 border-r-2 border-gray-300 print:border-gray-600 px-5 py-2.5">
                  <p className="font-extrabold text-xs text-sky-700 print:text-gray-800 uppercase tracking-widest text-center">
                    Column A — கிடுக்கிகள்
                  </p>
                </div>
                <div className="bg-emerald-100 print:bg-gray-100 px-5 py-2.5">
                  <p className="font-extrabold text-xs text-emerald-700 print:text-gray-800 uppercase tracking-widest text-center">
                    Column B — பொருத்துக
                  </p>
                </div>
              </div>
              {/* Data rows */}
              {(q.left || []).map((item, i) => (
                <div key={i} className={`grid grid-cols-2 border-t-2 border-gray-200 print:border-gray-400 ${i % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-transparent"}`}>
                  <div className="flex items-center gap-3 border-r-2 border-gray-300 print:border-gray-600 px-5 py-3 min-h-[3rem]">
                    <span className="font-extrabold text-sky-600 print:text-gray-800 w-6 shrink-0 text-sm">{i + 1}.</span>
                    <span className={`${gradeFontSize} tamil-font text-gray-800 print:text-black flex-1 leading-snug`}>{item}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400 print:hidden">ans:</span>
                      <div className="w-10 h-6 border-b-2 border-dashed border-gray-400 print:border-gray-700" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 min-h-[3rem]">
                    <span className="font-extrabold text-emerald-600 print:text-gray-800 w-6 shrink-0 text-sm">{String.fromCharCode(97 + i)}.</span>
                    <span className={`${gradeFontSize} tamil-font text-gray-800 print:text-black flex-1 leading-snug`}>{q.right?.[i]}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1 italic print:hidden">Write the matching letter (a, b, c…) in the dashed box beside each item in Column A.</p>
            {showAnswers && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 print:bg-transparent print:border-green-700">
                <p className="text-green-700 text-sm font-semibold print:text-green-900 tamil-font">
                  ✓ Answers: {q.left?.map((l, i) => `${i + 1} → ${q.answers?.[i]}`).join("  |  ")}
                </p>
              </div>
            )}
          </div>
        ));

      case "short_answer":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-7 ${gradeLineHeight}`}>
            <p className={`font-medium text-gray-800 print:text-black mb-3 ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {editMode ? (
                <input className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
              ) : q.question}
            </p>
            <div className="ml-6 space-y-3">
              <div className="border-b-2 border-gray-300 h-8 print:border-gray-500" />
              <div className="border-b-2 border-gray-300 h-8 print:border-gray-500" />
              {["LKG","UKG","1st","2nd"].includes(formData.grade) && (
                <div className="border-b-2 border-gray-300 h-8 print:border-gray-500" />
              )}
            </div>
            {showAnswers && <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "true_false":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-5 ${gradeLineHeight}`}>
            <div className={`flex items-start gap-3 font-medium text-gray-800 print:text-black ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold text-sky-700 print:text-black shrink-0">{q.id}.</span>
              <div className="flex-1">
                {editMode ? (
                  <input className="border-b border-gray-400 outline-none w-full bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
                ) : <span>{q.question}</span>}
                <div className="flex gap-6 mt-2 ml-1">
                  <label className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-sm print:border-black" />
                    <span className="font-semibold print:text-black">✓ True / சரி</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-sm print:border-black" />
                    <span className="font-semibold print:text-black">✗ False / தவறு</span>
                  </label>
                </div>
              </div>
            </div>
            {showAnswers && <p className="text-green-700 text-sm mt-1 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "diagram":
        return section.questions.map((q) => (
          <div key={q.id} className="mb-8">
            <p className={`font-medium text-gray-800 print:text-black mb-4 tamil-font ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
            </p>
            <div className="ml-4">
              {(() => {
                const lower = formData.topic.toLowerCase();
                const isKnown = ["plant","flower","தாவரம்","செடி","மரம்","பூ","body","human","உடல்","மனித","solar","planet","சூரிய","கோள்","water cycle","நீர் சுழற்சி","rain","cloud"].some(k => lower.includes(k));
                return isKnown ? (
                  <DiagramBox topic={formData.topic} labels={q.diagramLabels} />
                ) : (
                  <div className="border-2 border-dashed border-gray-400 print:border-gray-600 rounded-xl bg-gray-50 print:bg-white overflow-hidden">
                    <div className="w-full h-52 print:h-64 flex flex-col items-center justify-center text-gray-300 print:text-gray-400 gap-2 border-b-2 border-dashed border-gray-300 print:border-gray-500">
                      <PenLine className="h-12 w-12 opacity-30" />
                      <p className="text-base font-bold text-gray-400 print:text-gray-600">[ Draw here / இங்கே வரைக ]</p>
                      <p className="text-xs text-gray-300 print:text-gray-500 tamil-font">Draw and label the diagram in the box above</p>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Label the parts below / கீழே பாகங்களை எழுதுக:</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {(q.diagramLabels && q.diagramLabels.length > 0 ? q.diagramLabels : ["Part 1", "Part 2", "Part 3", "Part 4"]).map((lbl, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 w-5 shrink-0">{i + 1}.</span>
                            <div className="flex-1 border-b-2 border-dashed border-gray-400 print:border-gray-600 min-h-[1.5rem]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {showAnswers && q.answer && (
              <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>
            )}
          </div>
        ));

      default:
        return null;
    }
  };

  const isTamil = formData.language === "Tamil";
  const fontClass = isTamil ? "tamil-font" : "";

  // Grade-based font size: lower grades get larger text for readability
  const gradeFontSize = (() => {
    if (["LKG", "UKG"].includes(formData.grade)) return "text-xl";
    if (["1st", "2nd"].includes(formData.grade)) return "text-lg";
    if (formData.grade === "3rd") return "text-base";
    return "text-sm";
  })();

  const gradeLineHeight = ["LKG", "UKG", "1st", "2nd"].includes(formData.grade) ? "leading-loose" : "leading-relaxed";

  // ─── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-blue-50 overflow-x-hidden ${fontClass}`}>
      <OfflineBanner
        isOnline={isOnline}
        appName="Worksheet Maker"
        offlineCapabilities="Saved worksheets available — AI generation needs internet"
      />
      {/* Print styles */}
      <style>{`
         @media print {
          /* HIDE EVERYTHING first, then show only worksheet */
          body * { visibility: hidden !important; }
          .worksheet-card, .worksheet-card * { visibility: visible !important; }
          .worksheet-card { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          /* Aggressively hide all non-content elements */
          .no-print, header, footer, nav, [class*="PWA"], [class*="Offline"],
          [class*="ChatWidget"], [class*="SocialSidebar"], [class*="fixed"],
          .no-print *, header *, footer *, nav * {
            display: none !important; visibility: hidden !important; height: 0 !important;
            overflow: hidden !important; margin: 0 !important; padding: 0 !important;
            position: absolute !important; left: -9999px !important;
          }
          html, body { background: white !important; font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { box-shadow: none !important; }
          .min-h-screen { min-height: auto !important; background: white !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .worksheet-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { margin: 1.2cm 1.5cm; size: A4 portrait; }
          img { max-height: 70px !important; max-width: 70px !important; }
          .worksheet-card, .worksheet-card * { color: #111 !important; }
          .worksheet-card h2, .worksheet-card h3 { color: #000 !important; }
          .bg-gradient-to-r { background: white !important; border-bottom: 3px solid #1a3a5c !important; }
          .bg-gradient-to-r * { color: #1a3a5c !important; }
          .bg-sky-50, .bg-amber-50, .bg-green-50, .bg-gray-50 { background: white !important; }
          .worksheet-card svg { display: none !important; visibility: hidden !important; }
          .space-y-10 > div { page-break-inside: avoid; }
          .worksheet-card .px-8 { padding-left: 16px !important; padding-right: 16px !important; }
          .worksheet-card .border-t { border-top: 1px solid #ccc !important; padding: 8px 16px !important; }
        }
        .tamil-font, .tamil-font * { font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', 'Baloo 2', sans-serif !important; }
        ${isTamil ? `
          .worksheet-card, .worksheet-card * {
            font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', 'Baloo 2', sans-serif !important;
          }
        ` : ""}
      `}</style>

      {/* ── Page Header ── */}
      <div className="no-print bg-gradient-to-r from-sky-600 to-emerald-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
              {"NethajiVidhyalayam Worksheet Maker"}
            </h1>
          </div>
          <p className="text-sky-100 text-sm md:text-base max-w-xl mx-auto tamil-font">
            {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
              ? "AI-powered worksheets · Oxford Merry Birds Integrated Term Course · LKG – 5th"
              : "AI-powered worksheets · Tamil Nadu Samacheer Kalvi · LKG – 5th Standard"}
          </p>
          <p className="text-sky-200 text-xs mt-1 tamil-font">
            {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
              ? "Joyful · Activity-based · Phonics & Stories"
              : "தமிழ்நாடு சமச்சீர் பாடத்திட்டம் · AI தொழில்நுட்பம்"}
          </p>
          <Link to="/question-paper" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all">
            📝 Question Paper Creator — Midterm, Quarterly, Half-Yearly & Annual
          </Link>
        </div>
      </div>

      {/* PWA Install Banner */}
      <div className="no-print max-w-4xl mx-auto px-4 pt-4">
        <PWAInstallBanner
          appName="Worksheet Maker"
          appEmoji="📄"
          appColor="from-sky-500 to-emerald-600"
          description="Generate worksheets offline • Save to home screen • No app store needed"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Form Card ── */}
        <div className="no-print bg-white rounded-2xl shadow-lg border border-sky-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
              Create Your Worksheet
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Curriculum / Board — full width, at top */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                📚 Curriculum / Board <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURRICULA.map((c) => {
                  const active = formData.curriculum === c;
                  const isMerry = c === "Oxford Merry Birds (Integrated Term Course)";
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const langUpdate = isMerry && formData.language === "Tamil" ? "English" : formData.language;
                        // Reset subject if it's not available in the new curriculum
                        const newSubjects = isMerry ? MERRY_BIRDS_SUBJECTS : SAMACHEER_SUBJECTS;
                        const subjectUpdate = newSubjects.includes(formData.subject) ? formData.subject : newSubjects[0];
                        setFormData({ ...formData, curriculum: c, language: langUpdate, subject: subjectUpdate });
                      }}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        active
                          ? "border-sky-500 bg-sky-50 shadow-sm"
                          : "border-gray-200 bg-gray-50 hover:border-sky-300 hover:bg-sky-50"
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{isMerry ? "🐦" : "📖"}</span>
                      <div>
                        <p className={`text-sm font-bold leading-tight ${active ? "text-sky-700" : "text-gray-700"}`}>
                          {isMerry ? "Oxford Merry Birds" : "Samacheer Kalvi"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isMerry ? "Integrated Term Course · OUP" : "Tamil Nadu State Board"}
                        </p>
                      </div>
                      {active && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[11px] font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)" && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  🐦 <strong>Merry Birds tip:</strong> English is the primary language for this series. Phonics, rhymes, stories, and activity-based questions will be prioritized.
                </p>
              )}
            </div>

            {/* Term */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Term / தவணை</Label>
              <div className="flex gap-2">
                {TERMS.map((t) => (
                  <button key={t} type="button" onClick={() => setFormData({ ...formData, term: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${formData.term === t ? "border-sky-500 bg-sky-500 text-white shadow-sm" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Grade / Class</Label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 transition" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Subject / பாடம்</Label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 transition tamil-font" value={formData.subject} onChange={(e) => {
                  const newSubject = e.target.value;
                  const autoLang = newSubject === "Hindi" ? "Hindi" : newSubject === "Tamil" ? "Tamil" : "English";
                  setFormData({ ...formData, subject: newSubject, language: autoLang });
                }}>
                {(formData.curriculum === "Oxford Merry Birds (Integrated Term Course)" ? MERRY_BIRDS_SUBJECTS : SAMACHEER_SUBJECTS).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Hindi Prachar Sabha Syllabus - only when Hindi is selected */}
            {formData.subject === "Hindi" && (
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">🇮🇳 Hindi Syllabus <span className="text-gray-400 font-normal">(Hindi Prachar Sabha)</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HINDI_SYLLABUS_OPTIONS.map((hs) => (
                  <button key={hs.id} onClick={() => setFormData({ ...formData, hindiSyllabus: hs.id })}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      formData.hindiSyllabus === hs.id
                        ? "border-orange-500 bg-orange-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}>
                    <span className="text-xl">{hs.emoji}</span>
                    <span className={`text-sm font-bold ${formData.hindiSyllabus === hs.id ? "text-orange-700" : "text-gray-600"}`}>{hs.label}</span>
                    <span className="text-xs text-gray-400">{hs.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            )}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Topic / Chapter — <span className="tamil-font text-sky-600">தலைப்பு / பாடம்</span>
              </Label>
              <Input
                placeholder={isTamil ? "உதாரணம்: எழுத்துக்கள், தாவரங்கள், கூட்டல்..." : "e.g. Addition, Parts of plant, எழுத்துக்கள்..."}
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="tamil-font bg-sky-50 border-gray-200 focus:ring-sky-400 text-base"
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
              {/* Curriculum-aware topic note */}
              <p className="text-xs text-gray-500 mt-1.5 italic">
                {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                  ? `💡 Enter topic/chapter name from your Merry Birds book (e.g., "The Little Red Hen" for stories, "Phonics - Short 'a'" for phonics, "My Family" for EVS).`
                  : `💡 Enter topic/chapter name from your book (e.g., "Addition" for Maths, "Parts of Plant" for EVS, "எழுத்துக்கள்" for Tamil).`}
              </p>
              {/* Topic suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {showHints ? "Hide" : "Show"} Topic Hints ({suggestions.length})
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHints ? "rotate-180" : ""}`} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-medium ${showHints ? "text-green-600" : "text-red-500"}`}>{showHints ? "ON" : "OFF"}</span>
                      <Switch checked={showHints} onCheckedChange={setShowHints} className={`scale-75 ${showHints ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-400"}`} />
                    </div>
                  </div>
                  {showHints && (
                    <div className="flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {suggestions.map((s) => (
                        <button key={s} onClick={() => setFormData({ ...formData, topic: s })}
                          className="text-xs px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full border border-sky-200 hover:bg-sky-200 transition tamil-font">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Number of Questions */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Questions: <span className="text-sky-600 font-extrabold">{formData.numQuestions}</span>
              </Label>
              <input type="range" min={5} max={20} value={formData.numQuestions}
                onChange={(e) => setFormData({ ...formData, numQuestions: Number(e.target.value) })}
                className="w-full accent-sky-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>

            {/* Number of Sets */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                📋 Question Sets / தாள் வகைகள்:{" "}
                <span className="text-emerald-600 font-extrabold">{formData.numSets}</span>
                {formData.numSets > 1 && (
                  <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {formData.numSets} unique sets, no repeated questions
                  </span>
                )}
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, numSets: n })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                      formData.numSets === n
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 italic">
                {formData.numSets === 1
                  ? "Single worksheet — click again to get a different set of questions"
                  : `Generate ${formData.numSets} completely different worksheets on the same topic — perfect for exam practice!`}
              </p>
            </div>

            {/* Language */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Language / மொழி</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} onClick={() => setFormData({ ...formData, language: l })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all tamil-font ${formData.language === l ? "border-sky-500 bg-sky-500 text-white shadow-sm" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"}`}>
                    {l === "Tamil" ? "தமிழ்" : l === "Hindi" ? "हिंदी" : l === "Bilingual" ? "இரு மொழி" : l}
                  </button>
                ))}
              </div>
              {formData.language === "Bilingual" && (
                <div className="mt-2">
                  <Label className="text-xs font-semibold text-gray-500 mb-1 block">Select Language Pair / மொழி ஜோடி</Label>
                  <div className="flex gap-2">
                    {BILINGUAL_PAIRS.map((bp) => (
                      <button key={bp.id} onClick={() => setFormData({ ...formData, bilingualPair: bp.id })}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all tamil-font ${formData.bilingualPair === bp.id ? "border-sky-500 bg-sky-100 text-sky-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"}`}>
                        {bp.labelTamil}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Difficulty */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Difficulty / நிலை</Label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => {
                  const active: Record<string, string> = { Easy: "border-emerald-500 bg-emerald-500", Medium: "border-amber-500 bg-amber-500", Hard: "border-red-500 bg-red-500" };
                  const hover: Record<string, string> = { Easy: "hover:border-emerald-400", Medium: "hover:border-amber-400", Hard: "hover:border-red-400" };
                  const emoji: Record<string, string> = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };
                  return (
                    <button key={d} onClick={() => setFormData({ ...formData, difficulty: d })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${formData.difficulty === d ? `${active[d]} text-white shadow-sm` : `border-gray-200 bg-gray-50 text-gray-600 ${hover[d]}`}`}>
                      {emoji[d]} {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Types multi-select */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Question Types <span className="text-gray-400 font-normal">(optional — leave blank for balanced mix)</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUESTION_TYPES.map((qt) => {
                  const selected = formData.questionTypes.includes(qt.id);
                  return (
                    <button
                      key={qt.id}
                      type="button"
                      onClick={() => {
                        const types = selected
                          ? formData.questionTypes.filter((t) => t !== qt.id)
                          : [...formData.questionTypes, qt.id];
                        setFormData({ ...formData, questionTypes: types });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        selected
                          ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300 hover:bg-sky-50"
                      }`}
                    >
                      <span className="text-base">{qt.emoji}</span>
                      <div className="min-w-0">
                        <div className="leading-tight">{qt.label}</div>
                        <div className="text-xs text-gray-400 tamil-font leading-tight">{qt.tamil}</div>
                      </div>
                      {selected && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {formData.questionTypes.length > 0 ? (
                <p className="text-xs text-sky-600 mt-1.5 font-medium">
                  Selected: {formData.questionTypes.map(id => QUESTION_TYPES.find(q => q.id === id)?.label).join(", ")}
                </p>
              ) : formData.curriculum === "Oxford Merry Birds (Integrated Term Course)" ? (
                <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 font-semibold">🐦 Merry Birds auto-mix (when none selected):</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    ✏️ Fill Missing Sounds/Letters &nbsp;·&nbsp; 🔗 Match Rhyming Words &nbsp;·&nbsp; 🔘 Story MCQ &nbsp;·&nbsp; ✅ Phonics True/False &nbsp;·&nbsp; 🖊️ Draw & Colour
                  </p>
                </div>
              ) : null}

            </div>
          </div>

          {/* Offline warning */}
          {!isOnline && (
            <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <span className="text-xl">📶</span>
              <div>
                <p className="font-bold">You are offline</p>
                <p className="text-xs text-amber-700">Worksheet generation needs internet. Saved worksheets are available below.</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button onClick={generate} disabled={loading || !isOnline}
            className="w-full mt-2 h-14 text-lg font-bold bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50">
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" />AI generating worksheet…</>
            ) : !isOnline ? (
              <><span className="mr-2">📶</span>Offline – Open Saved Worksheets</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" />Generate Worksheet · தாள் உருவாக்கு</>
            )}
          </Button>

          {/* Saved list toggle */}
          {savedList.length > 0 && (
            <button onClick={() => setShowSaved(!showSaved)}
              className="mt-3 w-full text-sm text-sky-600 hover:text-sky-800 font-semibold flex items-center justify-center gap-1.5 transition-colors">
              <List className="h-4 w-4" />
              {showSaved ? "Hide" : "View"} My Saved Worksheets ({savedList.length}/30)
            </button>
          )}

          {/* Saved worksheets list */}
          {showSaved && (
            <div className="mt-4 border border-sky-100 rounded-xl overflow-hidden">
              {savedList.map((sw) => (
                <div key={sw.id} className="flex items-center justify-between px-4 py-3 border-b border-sky-50 last:border-0 hover:bg-sky-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-800 truncate tamil-font">{sw.title}</p>
                    <p className="text-xs text-gray-400">{sw.savedAt} · {sw.formData.grade} {sw.formData.subject}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => loadSaved(sw)} className="text-xs h-7">Load</Button>
                    <button onClick={() => deleteSaved(sw.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="no-print text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin" />
                <BookOpen className="absolute inset-0 m-auto h-7 w-7 text-sky-500" />
              </div>
              <div>
                {formData.numSets > 1 ? (
                  <>
                    <p className="text-gray-700 font-bold text-lg">
                      Generating Set {loadingSetIndex} of {formData.numSets}…
                    </p>
                    <div className="flex gap-1.5 mt-3 justify-center">
                      {Array.from({ length: formData.numSets }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${
                          i < (loadingSetIndex || 0) - 1
                            ? "bg-emerald-500"
                            : i === (loadingSetIndex || 0) - 1
                            ? "bg-sky-500 animate-pulse scale-125"
                            : "bg-gray-200"
                        }`} />
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm mt-2 tamil-font">ஒவ்வொரு தொகுப்பும் தனித்துவமான கேள்விகளுடன் உருவாக்கப்படுகிறது…</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 font-bold text-lg">Creating your worksheet…</p>
                    <p className="text-gray-400 text-sm mt-1 tamil-font">தாள் உருவாக்கப்படுகிறது… AI Samacheer Kalvi பாடத்திட்டத்தை பின்பற்றுகிறது</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Error State ── */}
        {generateError && !loading && !worksheet && (
          <div className="no-print mt-8 mx-auto max-w-lg text-center bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-red-700 mb-2">Worksheet Generation Failed</h3>
            <p className="text-sm text-red-600 mb-4">{generateError}</p>
            <p className="text-xs text-gray-500">Please try again in a few minutes. If the problem persists, contact the administrator.</p>
          </div>
        )}

        {/* ── Worksheet Set Tabs (multi-set) ── */}
        {worksheetSets.length > 1 && !loading && (
          <div className="no-print mb-4 bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">📋 Question Sets — Switch between unique sets</p>
            <div className="flex gap-2 flex-wrap">
              {worksheetSets.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveSetIndex(i); setShowAnswers(false); setEditMode(false); }}
                  className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    activeSetIndex === i
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  Set {i + 1}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">Each set contains unique, non-repeated questions on the same topic</p>
          </div>
        )}

        {/* ── Worksheet ── */}
        {displayedWorksheet && !loading && (
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
              <Button onClick={saveWorksheet} variant="outline" className="gap-2 border-gray-300">
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button onClick={generate} variant="outline" className="gap-2 border-gray-300">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              {/* WhatsApp Share */}
              <Button
                onClick={handleShareWhatsApp}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share on</span> WhatsApp
              </Button>
              {/* Direct download buttons */}
              <Button onClick={handlePrint} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                <Download className="h-4 w-4" /> Save as PDF
              </Button>
              <Button onClick={handleDownloadWord} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <FileText className="h-4 w-4" /> Save as Word
              </Button>
              <VoiceReader
                getTextSegments={(withAnswers) => {
                  if (!displayedWorksheet) return [];
                  const segments: string[] = [];
                  segments.push(displayedWorksheet.title);
                  displayedWorksheet.sections?.forEach((section) => {
                    segments.push(section.heading);
                    section.questions.forEach((q) => {
                      if (q.question) {
                        segments.push(`Question ${q.id}. ${q.question}`);
                        if (q.options) segments.push(`Options: ${q.options.join(", ")}`);
                        if (section.type === "match_following" && q.left && q.right) {
                          segments.push(`Match: ${q.left.join(", ")} with ${q.right.join(", ")}`);
                        }
                      }
                      if (withAnswers && q.answer) {
                        segments.push(`Answer: ${q.answer}`);
                      }
                      if (withAnswers && section.type === "match_following" && q.answers) {
                        segments.push(`Answers: ${q.left?.map((l, i) => `${l} matches ${q.answers?.[i]}`).join(", ")}`);
                      }
                    });
                  });
                  return segments;
                }}
              />
            </div>

            {/* Worksheet document */}
            <div className="worksheet-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" id="worksheet">
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-emerald-600 print:bg-none print:border-b-4 print:border-sky-700 text-white print:text-black px-6 py-5 print:py-3 relative">
                {/* Logo — absolutely positioned top-left */}
                <img
                  src="/nethaji_logo_print.webp"
                  alt="Nethaji Vidhyalayam"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-28 w-28 object-contain print:h-16 print:w-16"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                />
                {/* Centered title content */}
                <div className="text-center px-32">
                  <p className="text-xs text-sky-200 print:text-gray-600 mb-1 font-semibold">
                    {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                      ? "Oxford Merry Birds • Integrated Term Course • OUP"
                      : "Tamil Nadu Samacheer Kalvi • தமிழ்நாடு சமச்சீர் கல்வி"}
                  </p>
                  <h2 className={`tamil-font text-base md:text-lg font-extrabold leading-tight print:text-black`}
                    style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', serif" }}>
                    {displayedWorksheet.title}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="bg-white/20 print:bg-transparent print:border print:border-sky-700 print:text-sky-900 text-white rounded-full px-3 py-0.5 text-xs font-semibold">{formData.grade}</span>
                    <span className="bg-white/20 print:bg-transparent print:border print:border-sky-700 print:text-sky-900 text-white rounded-full px-3 py-0.5 text-xs font-semibold">{formData.subject}</span>
                    <span className="bg-white/20 print:bg-transparent print:border print:border-sky-700 print:text-sky-900 text-white rounded-full px-3 py-0.5 text-xs font-semibold">{formData.difficulty}</span>
                    <span className="bg-white/20 print:bg-transparent print:border print:border-sky-700 print:text-sky-900 text-white rounded-full px-3 py-0.5 text-xs font-semibold">{formData.language === "bilingual" ? "Bilingual" : formData.language === "tamil" ? "Tamil" : "English"}</span>
                    {displayedWorksheet._hasDiagram && (
                      <span className="bg-amber-400/40 print:bg-transparent print:border print:border-amber-600 print:text-amber-800 text-white rounded-full px-3 py-0.5 text-xs font-semibold">
                        📐 Includes Diagram
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student info strip */}
              <div className="bg-sky-50 print:bg-transparent border-b border-sky-100 px-8 py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="text-gray-600 tamil-font">பெயர் / Name: <span className="inline-block w-48 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Date: <span className="inline-block w-28 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Score: <span className="inline-block w-20 border-b border-gray-500 ml-1" /> / {formData.numQuestions}</span>
                </div>
              </div>


              {/* Sections */}
              <div className={`px-8 py-6 space-y-10 ${isTamil ? "tamil-font" : ""}`}>
                {displayedWorksheet.sections?.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h3 className="tamil-font font-bold text-gray-900 text-base border-b-2 border-sky-200 print:border-gray-500 pb-2 mb-5 flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
                      {section.type === "fill_in_blanks" && <PenLine className="h-4 w-4 text-sky-500 print:hidden" />}
                      {section.type === "multiple_choice" && <CheckSquare className="h-4 w-4 text-emerald-500 print:hidden" />}
                      {section.type === "diagram" && <span className="print:hidden">📐</span>}
                      {section.heading}
                    </h3>
                    <div className={`${isTamil ? "tamil-font" : ""} space-y-1`}>
                      {renderSection(section, sIdx)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Answer Key */}
              {showAnswers && (
                <div className="mx-8 mb-8 p-5 bg-green-50 print:bg-transparent border-2 border-green-200 print:border-green-700 rounded-xl">
                  <h3 className="font-bold text-green-800 print:text-green-900 text-base mb-4"
                    style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
                    ✅ Answer Key / விடை திறவு
                  </h3>
                  <div className="space-y-4">
                    {displayedWorksheet.sections?.map((section, sIdx) => (
                      <div key={sIdx}>
                        <p className="text-xs font-bold text-green-700 print:text-green-900 uppercase tracking-wider mb-2 tamil-font">{section.heading}</p>
                        <div className="tamil-font grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.questions.filter(q => q.answer).map((q) => (
                            <p key={q.id} className="text-sm text-green-800 print:text-black leading-relaxed">
                              <strong>{q.id}.</strong>{" "}
                              {section.type === "match_following"
                                ? q.left?.map((l, i) => `${l} → ${q.answers?.[i]}`).join(" | ")
                                : q.answer}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 print:bg-transparent text-center">
                <p className="text-xs text-gray-400 print:text-gray-600 tamil-font">
                  {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                    ? "Oxford Merry Birds • Integrated Term Course (Pre-KG to 5th) • OUP"
                    : "Tamil Nadu Samacheer Kalvi Curriculum (Pre-KG to 5th)"} • Generated by Worksheet Maker • Nethaji Vidhyalayam
                </p>
                <p className="text-xs text-gray-300 print:text-gray-500 mt-0.5 tamil-font">
                  {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                    ? `${formData.term} • Class ${formData.grade} • ${formData.subject}`
                    : "தமிழ்நாடு சமச்சீர் பாடத்திட்டம் • AI தொழில்நுட்பத்தால் உருவாக்கப்பட்டது"}
                  தமிழ்நாடு சமச்சீர் பாடத்திட்டம் • AI தொழில்நுட்பத்தால் உருவாக்கப்பட்டது
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
