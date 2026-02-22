import { useState, useCallback, useEffect } from "react";
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
      toast({ title: "You are offline 📶", description: "Question paper generation needs internet.", variant: "destructive" });
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
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-question-paper`, {
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
      });
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
    ${form.questionPattern !== "custom" && paper.generalInstructions?.length ? `<div style="background:#fffde7;padding:8px 12px;border-left:4px solid #f59e0b;font-size:12px;margin:8px 0"><b>📋 General Instructions:</b><ul style="margin:4px 0 0 16px">${paper.generalInstructions.map(inst => `<li>${inst}</li>`).join("")}</ul></div>` : ""}
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
              <span dangerouslySetInnerHTML={{
                __html: (q.question || "").replace(/_{2,}|\[_+\]/g, `<span class="inline-block border-b-2 ${cm ? "border-emerald-400" : "border-gray-500"} min-w-[140px] mx-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`)
              }} />
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

              {/* General Instructions - shown for non-custom patterns */}
              {paper.generalInstructions && paper.generalInstructions.length > 0 && form.questionPattern !== "custom" && (
              <div className={`px-8 py-4 border-b ${colorMode ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-200"}`}>
                <p className={`font-bold text-sm mb-2 ${colorMode ? "text-amber-800" : "text-gray-700"}`}>📋 General Instructions:</p>
                <ul className={`list-disc list-inside text-sm space-y-1 ${colorMode ? "text-amber-700" : "text-gray-600"}`}>
                  {paper.generalInstructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
              )}

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
