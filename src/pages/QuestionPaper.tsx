import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import OfflineBanner from "@/components/ui/OfflineBanner";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import {
  BookOpen, Download, RefreshCw, Eye, EyeOff, Printer,
  Sparkles, Loader2, GraduationCap, FileText,
  PenLine, ChevronDown, Share2, ArrowLeft, CheckSquare, Map,
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
const LANGUAGES = ["English", "Tamil", "Bilingual"];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ─── Diagram SVG Components ──────────────────────────────────────────────
function DiagramSVG({ type, labels }: { type?: string; labels?: string[] }) {
  const safeLabels = labels || ["Part 1", "Part 2", "Part 3", "Part 4"];

  if (type === "plant" || type?.includes("plant")) {
    return (
      <svg viewBox="0 0 300 290" className="w-64 h-56 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <line x1="150" y1="260" x2="150" y2="120" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="260" x2="100" y2="285" stroke="#92400e" strokeWidth="3" />
        <line x1="150" y1="260" x2="130" y2="285" stroke="#92400e" strokeWidth="3" />
        <line x1="150" y1="260" x2="170" y2="280" stroke="#92400e" strokeWidth="3" />
        <ellipse cx="105" cy="170" rx="35" ry="18" fill="#86efac" stroke="#22c55e" strokeWidth="1.5" transform="rotate(-30 105 170)" />
        <line x1="150" y1="180" x2="105" y2="170" stroke="#4ade80" strokeWidth="2" />
        <ellipse cx="195" cy="160" rx="35" ry="18" fill="#86efac" stroke="#22c55e" strokeWidth="1.5" transform="rotate(30 195 160)" />
        <line x1="150" y1="165" x2="195" y2="160" stroke="#4ade80" strokeWidth="2" />
        <circle cx="150" cy="110" r="22" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="150" cy="110" r="10" fill="#f59e0b" />
        {[0,60,120,180,240,300].map((angle, i) => (
          <ellipse key={i} cx={150 + 22 * Math.cos((angle * Math.PI) / 180)} cy={110 + 22 * Math.sin((angle * Math.PI) / 180)} rx="10" ry="6" fill="#fca5a5" transform={`rotate(${angle} ${150 + 22 * Math.cos((angle * Math.PI) / 180)} ${110 + 22 * Math.sin((angle * Math.PI) / 180)})`} />
        ))}
        <rect x="80" y="268" width="140" height="8" rx="4" fill="#a16207" />
        <text x="15" y="115" fontSize="11" fill="#166534" fontWeight="bold">Flower</text>
        <text x="55" y="140" fontSize="11" fill="#166534">Leaf</text>
        <text x="165" y="200" fontSize="11" fill="#166534">Stem</text>
        <text x="165" y="240" fontSize="11" fill="#166534">Root</text>
      </svg>
    );
  }

  if (type === "body" || type?.includes("body")) {
    return (
      <svg viewBox="0 0 200 260" className="w-48 h-56 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="35" r="28" fill="#fde8d0" stroke="#d1a07a" strokeWidth="2" />
        <rect x="70" y="65" width="60" height="80" rx="8" fill="#fde8d0" stroke="#d1a07a" strokeWidth="2" />
        <line x1="70" y1="75" x2="35" y2="140" stroke="#d1a07a" strokeWidth="10" strokeLinecap="round" />
        <line x1="130" y1="75" x2="165" y2="140" stroke="#d1a07a" strokeWidth="10" strokeLinecap="round" />
        <line x1="85" y1="145" x2="75" y2="220" stroke="#d1a07a" strokeWidth="12" strokeLinecap="round" />
        <line x1="115" y1="145" x2="125" y2="220" stroke="#d1a07a" strokeWidth="12" strokeLinecap="round" />
        <text x="115" y="30" fontSize="9" fill="#1e3a5f" fontWeight="bold">Head</text>
        <text x="135" y="105" fontSize="9" fill="#1e3a5f">Arm</text>
        <text x="135" y="190" fontSize="9" fill="#1e3a5f">Leg</text>
      </svg>
    );
  }

  if (type === "solar" || type?.includes("solar")) {
    return (
      <svg viewBox="0 0 320 200" className="w-72 h-44 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="100" r="28" fill="#fbbf24" />
        <text x="35" y="140" fontSize="9" fill="#92400e" fontWeight="bold">Sun</text>
        {["Mercury","Venus","Earth","Mars","Jupiter"].map((p, i) => {
          const cx = 110 + i * 45;
          const r = [5, 7, 8, 6, 14][i];
          const color = ["#9ca3af","#fbbf24","#3b82f6","#ef4444","#f97316"][i];
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
        <rect x="0" y="160" width="320" height="40" rx="4" fill="#93c5fd" opacity="0.5" />
        <text x="130" y="185" fontSize="10" fill="#1e40af" fontWeight="bold">Ocean/Sea</text>
        <path d="M40 160 Q60 140 80 160" stroke="#60a5fa" fill="none" strokeWidth="2" />
        <path d="M80 160 Q100 140 120 160" stroke="#60a5fa" fill="none" strokeWidth="2" />
        <line x1="60" y1="150" x2="60" y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
        <text x="70" y="110" fontSize="9" fill="#b45309">Evaporation ↑</text>
        <ellipse cx="160" cy="40" rx="60" ry="25" fill="#d1d5db" />
        <ellipse cx="130" cy="35" rx="30" ry="18" fill="#e5e7eb" />
        <text x="130" y="45" fontSize="9" fill="#374151" fontWeight="bold">Cloud</text>
        <line x1="200" y1="65" x2="250" y2="130" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
        <text x="220" y="95" fontSize="9" fill="#1d4ed8">Rain ↓</text>
        <text x="240" y="155" fontSize="9" fill="#15803d">Condensation</text>
      </svg>
    );
  }

  if (type?.includes("map_india")) {
    return (
      <div className="border-2 border-dashed border-gray-400 rounded-xl p-4 bg-gray-50 print:bg-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Map className="h-5 w-5 text-blue-500" />
          <p className="font-bold text-gray-700 text-sm">Outline Map of India</p>
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
                <span className="text-sm font-bold text-gray-500 w-5 shrink-0">{i + 1}.</span>
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
      <div className="border-2 border-dashed border-gray-400 rounded-xl p-4 bg-gray-50 print:bg-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Map className="h-5 w-5 text-green-500" />
          <p className="font-bold text-gray-700 text-sm">Outline Map of the World</p>
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
                <span className="text-sm font-bold text-gray-500 w-5 shrink-0">{i + 1}.</span>
                <span className="text-sm text-gray-600">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generic diagram placeholder
  return (
    <div className="border-2 border-dashed border-gray-400 rounded-xl bg-gray-50 print:bg-white overflow-hidden">
      <div className="w-full h-52 print:h-64 flex flex-col items-center justify-center text-gray-300 gap-2 border-b-2 border-dashed border-gray-300">
        <PenLine className="h-12 w-12 opacity-30" />
        <p className="text-base font-bold text-gray-400">[ Draw here ]</p>
      </div>
      <div className="px-6 py-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Label the parts:</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {safeLabels.map((lbl, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 w-5 shrink-0">{i + 1}.</span>
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

  const [form, setForm] = useState({
    examType: "Quarterly",
    grade: "3rd",
    subject: "Maths",
    term: "Term 1",
    language: "English",
    topics: "",
  });

  const selectedExam = EXAM_TYPES.find((e) => e.id === form.examType)!;

  const generate = async () => {
    if (!isOnline) {
      toast({ title: "You are offline 📶", description: "Question paper generation needs internet.", variant: "destructive" });
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
      setPaper(data.paper);
      toast({ title: "Question Paper generated! 📄", description: "Scroll down to view your paper." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate";
      setError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    if (!paper) return;
    const sectionsHtml = paper.sections.map((section) => {
      const subsHtml = section.subsections.map((sub) => {
        const qsHtml = sub.questions.map((q) => {
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
          return `<p><b>${q.id}.</b> ${q.question} <span style="color:#666;font-size:11px">[${q.marks || 5}M]</span></p><p style="border-bottom:1px solid #999;margin:4px 20px">&nbsp;</p><p style="border-bottom:1px solid #999;margin:4px 20px">&nbsp;</p>`;
        }).join("");
        return `<h4 style="margin-top:12px;font-size:13px;color:#333">${sub.heading}</h4>${qsHtml}`;
      }).join("");
      return `<div style="margin-top:24px"><h3 style="background:#e0f2fe;padding:8px 12px;font-size:14px;margin:0">${section.heading} <span style="float:right;font-size:12px;color:#555">[${section.totalMarks} Marks]</span></h3><p style="font-size:11px;color:#666;margin:4px 12px">${section.instructions}</p>${subsHtml}</div>`;
    }).join("");

    const answerHtml = showAnswers && paper.answerKey ? `<div style="page-break-before:always"><h2 style="color:#166534">✅ Answer Key with Explanations</h2>${paper.answerKey.sections.map(s => `<h3>${s.partLabel}</h3>${s.answers.map(a => `<p><b>${a.id}.</b> ${a.answer}${a.explanation ? ` — <i>${a.explanation}</i>` : ""}</p>`).join("")}`).join("")}</div>` : "";

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${paper.title}</title>
    <style>body{font-family:'Noto Sans Tamil',Arial,sans-serif;font-size:13px;color:#111;margin:40px}h1{font-size:18px;text-align:center}h2{font-size:15px}table{border-collapse:collapse;width:100%}</style></head>
    <body>
    <div style="text-align:center">
      <img src="${window.location.origin}/nethaji_logo_print.webp" alt="Logo" style="width:100px;height:100px" />
      <h1>${paper.title}</h1>
      <p style="font-size:14px;font-weight:bold">${paper.subtitle}</p>
      <p>Term: ${paper.term} | Total Marks: ${paper.totalMarks} | Duration: ${paper.duration}</p>
    </div>
    <hr/>
    <p><b>Name:</b> _____________________________ &nbsp; <b>Adm.No:</b> ______________ &nbsp; <b>Date:</b> ________________</p>
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

  // Render subsection questions
  const renderSubsection = (sub: PaperSubsection) => {
    switch (sub.type) {
      case "multiple_choice":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-5">
            <p className="font-medium text-gray-800 print:text-black text-sm leading-relaxed">
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
              <span className="text-gray-400 text-xs ml-2 print:text-gray-600">[{q.marks || 1}M]</span>
            </p>
            <div className="grid grid-cols-2 gap-2 ml-6 mt-2">
              {q.options?.map((opt, oi) => (
                <label key={oi} className="flex items-start gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded-sm shrink-0 mt-0.5 print:border-black" />
                  <span className="text-sm text-gray-700 print:text-black">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ));

      case "fill_in_blanks":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-4">
            <p className="font-medium text-gray-800 print:text-black text-sm leading-[2.4]">
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              <span dangerouslySetInnerHTML={{
                __html: (q.question || "").replace(/_{2,}|\[_+\]/g, '<span class="inline-block border-b-2 border-gray-500 print:border-black min-w-[120px] mx-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>')
              }} />
              <span className="text-gray-400 text-xs ml-2 print:text-gray-600">[{q.marks || 1}M]</span>
            </p>
          </div>
        ));

      case "true_false":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-4">
            <p className="font-medium text-gray-800 print:text-black text-sm leading-relaxed">
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
              <span className="ml-3 text-gray-500 print:text-black">( True / False )</span>
              <span className="text-gray-400 text-xs ml-2 print:text-gray-600">[{q.marks || 1}M]</span>
            </p>
          </div>
        ));

      case "match_following":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-6">
            <p className="text-gray-400 text-xs mb-2 print:text-gray-600">[{q.marks || 3}M]</p>
            <div className="w-full border-2 border-gray-300 print:border-gray-600 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="bg-sky-100 print:bg-gray-100 border-r-2 border-gray-300 px-4 py-2">
                  <p className="font-bold text-xs text-sky-700 print:text-gray-800 uppercase tracking-widest text-center">Column A</p>
                </div>
                <div className="bg-emerald-100 print:bg-gray-100 px-4 py-2">
                  <p className="font-bold text-xs text-emerald-700 print:text-gray-800 uppercase tracking-widest text-center">Column B</p>
                </div>
              </div>
              {(q.left || []).map((item, i) => (
                <div key={i} className={`grid grid-cols-2 border-t-2 border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 border-r-2 border-gray-300 px-4 py-2.5">
                    <span className="font-bold text-sky-600 w-5 shrink-0 text-sm">{i + 1}.</span>
                    <span className="text-sm text-gray-800">{item}</span>
                    <div className="ml-auto w-8 h-5 border-b-2 border-dashed border-gray-400" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <span className="font-bold text-emerald-600 w-5 shrink-0 text-sm">{String.fromCharCode(97 + i)}.</span>
                    <span className="text-sm text-gray-800">{q.right?.[i]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ));

      case "short_answer":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-5">
            <p className="font-medium text-gray-800 print:text-black text-sm leading-relaxed">
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
              <span className="text-gray-400 text-xs ml-2 print:text-gray-600">[{q.marks || 2}M]</span>
            </p>
            <div className="ml-6 mt-2 space-y-3">
              <div className="border-b border-gray-300 print:border-gray-500" />
              <div className="border-b border-gray-300 print:border-gray-500" />
            </div>
          </div>
        ));

      case "long_answer":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-6">
            <p className="font-medium text-gray-800 print:text-black text-sm leading-relaxed">
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
              <span className="text-gray-400 text-xs ml-2 print:text-gray-600">[{q.marks || 5}M]</span>
            </p>
            <div className="ml-6 mt-2 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-300 print:border-gray-500" />
              ))}
            </div>
          </div>
        ));

      case "diagram":
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-6">
            <p className="font-medium text-gray-800 print:text-black text-sm leading-relaxed mb-3">
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
              <span className="text-gray-400 text-xs ml-2 print:text-gray-600">[{q.marks || 5}M]</span>
            </p>
            <div className="ml-4">
              <DiagramSVG type={q.diagramType} labels={q.diagramLabels} />
            </div>
          </div>
        ));

      default:
        return sub.questions.map((q) => (
          <div key={q.id} className="mb-5">
            <p className="font-medium text-gray-800 print:text-black text-sm">
              <span className="font-bold mr-2 text-sky-700">{q.id}.</span>
              {q.question}
              <span className="text-gray-400 text-xs ml-2">[{q.marks || 2}M]</span>
            </p>
          </div>
        ));
    }
  };

  const isTamil = form.language === "Tamil";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 overflow-x-hidden ${isTamil ? "tamil-font" : ""}`}>
      <OfflineBanner isOnline={isOnline} appName="Question Paper Creator" offlineCapabilities="Generation needs internet" />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .paper-card { box-shadow: none !important; border: 1px solid #aaa !important; }
          @page { margin: 1.5cm; size: A4 portrait; }
        }
        .tamil-font, .tamil-font * { font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', 'Baloo 2', sans-serif !important; }
      `}</style>

      {/* Page Header */}
      <div className="no-print bg-gradient-to-r from-indigo-600 to-sky-600 text-white py-6 px-4">
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
          <p className="text-sky-100 text-sm md:text-base max-w-xl mx-auto text-center">
            Midterm · Quarterly · Half-Yearly · Annual — with Diagrams, Maps & Answer Key
          </p>
        </div>
      </div>

      <div className="no-print max-w-4xl mx-auto px-4 pt-4">
        <PWAInstallBanner appName="Question Paper" appEmoji="📝" appColor="from-indigo-500 to-sky-600" description="Create exam papers offline • Save to home screen" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Form */}
        <div className="no-print bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Create Question Paper
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Exam Type */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-2 block">📋 Exam Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EXAM_TYPES.map((et) => (
                  <button key={et.id} onClick={() => setForm({ ...form, examType: et.id })}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${
                      form.examType === et.id
                        ? "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-indigo-300"
                    }`}>
                    <span className="text-2xl">{et.emoji}</span>
                    <span className={`text-sm font-bold ${form.examType === et.id ? "text-indigo-700" : "text-gray-600"}`}>{et.label}</span>
                    <span className="text-xs text-gray-400">{et.marks} marks · {et.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Term */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Term</Label>
              <div className="flex gap-2">
                {TERMS.map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, term: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                      form.term === t ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300"
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Grade / Class</Label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Subject</Label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Language */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Language</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} onClick={() => setForm({ ...form, language: l })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                      form.language === l ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300"
                    }`}>{l === "Tamil" ? "தமிழ்" : l === "Bilingual" ? "இரு மொழி" : l}</button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Specific Topics / Chapters <span className="text-gray-400 font-normal">(optional — leave blank for full syllabus)</span>
              </Label>
              <Input placeholder="e.g. Numbers, Fractions, Parts of Plant, Maps..."
                value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })}
                className="bg-indigo-50 border-gray-200" />
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generate} disabled={loading || !isOnline}
            className="w-full mt-6 h-14 text-lg font-bold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl shadow-md">
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
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                <BookOpen className="absolute inset-0 m-auto h-7 w-7 text-indigo-500" />
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
              <Button onClick={handlePrint} variant="outline" className="gap-2"><Printer className="h-4 w-4" /> Print / PDF</Button>
              <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline" className="gap-2">
                {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAnswers ? "Hide Answer Key" : "Show Answer Key"}
              </Button>
              <Button onClick={generate} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Regenerate</Button>
              <Button onClick={handleShareWhatsApp} className="gap-2 bg-green-500 hover:bg-green-600 text-white">
                <Share2 className="h-4 w-4" /> WhatsApp
              </Button>
              <div className="relative group ml-auto">
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Download className="h-4 w-4" /> Download <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 hidden group-hover:block min-w-[180px]">
                  <button onClick={handlePrint} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 border-b border-gray-100">
                    <Printer className="h-4 w-4 text-indigo-500" /> Save as PDF
                  </button>
                  <button onClick={handleDownloadWord} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50">
                    <FileText className="h-4 w-4 text-blue-500" /> Save as Word
                  </button>
                </div>
              </div>
            </div>

            {/* Paper Document */}
            <div className="paper-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-700 to-sky-600 print:bg-none print:border-b-4 print:border-indigo-700 text-white print:text-black px-6 py-5 print:py-3 relative">
                <img src="/nethaji_logo_print.webp" alt="Nethaji Vidhyalayam"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-24 w-24 object-contain print:h-20 print:w-20"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                <div className="text-center px-28">
                  <p className="text-xs text-indigo-200 print:text-gray-500 font-semibold uppercase tracking-wider mb-1">Nethaji Vidhyalayam, Chennai</p>
                  <h2 className="text-lg md:text-xl font-extrabold leading-tight print:text-black" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {paper.title}
                  </h2>
                  <p className="font-bold text-base mt-1 print:text-black">{paper.subtitle}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="bg-white/20 print:bg-transparent print:border print:border-indigo-700 rounded-full px-3 py-0.5 text-xs font-semibold">{paper.term}</span>
                    <span className="bg-white/20 print:bg-transparent print:border print:border-indigo-700 rounded-full px-3 py-0.5 text-xs font-semibold">Total: {paper.totalMarks} Marks</span>
                    <span className="bg-white/20 print:bg-transparent print:border print:border-indigo-700 rounded-full px-3 py-0.5 text-xs font-semibold">⏱ {paper.duration}</span>
                  </div>
                </div>
              </div>

              {/* Student info */}
              <div className="bg-indigo-50 print:bg-transparent border-b border-indigo-100 px-8 py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="text-gray-600">Name: <span className="inline-block w-48 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Adm.No: <span className="inline-block w-20 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Class & Section: <span className="inline-block w-20 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Date: <span className="inline-block w-28 border-b border-gray-500 ml-1" /></span>
                </div>
              </div>

              {/* General Instructions */}
              <div className="px-8 py-4 bg-amber-50 print:bg-transparent border-b border-amber-100">
                <p className="font-bold text-sm text-amber-800 mb-2">📋 General Instructions:</p>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {paper.generalInstructions?.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>

              {/* Sections */}
              <div className="px-8 py-6 space-y-8">
                {paper.sections?.map((section, sIdx) => (
                  <div key={sIdx} className="border-l-4 border-indigo-300 print:border-gray-400 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-gray-900 text-base" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        {section.heading}
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 print:text-gray-600 bg-indigo-50 print:bg-transparent px-2 py-1 rounded">
                        {section.totalMarks} Marks
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 italic">{section.instructions}</p>

                    {section.subsections?.map((sub, subIdx) => (
                      <div key={subIdx} className="mb-6">
                        <h4 className="font-bold text-gray-700 text-sm border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                          {sub.type === "multiple_choice" && <CheckSquare className="h-3.5 w-3.5 text-sky-500 print:hidden" />}
                          {sub.type === "fill_in_blanks" && <PenLine className="h-3.5 w-3.5 text-emerald-500 print:hidden" />}
                          {sub.type === "diagram" && <span className="print:hidden">📐</span>}
                          {(sub.type === "map_india" || sub.type === "map_world") && <Map className="h-3.5 w-3.5 text-blue-500 print:hidden" />}
                          {sub.heading}
                        </h4>
                        {renderSubsection(sub)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Answer Key */}
              {showAnswers && paper.answerKey && (
                <div className="mx-8 mb-8 p-5 bg-green-50 print:bg-transparent border-2 border-green-200 print:border-green-700 rounded-xl">
                  <h3 className="font-bold text-green-800 text-base mb-4" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    ✅ Answer Key with Explanations
                  </h3>
                  <div className="space-y-4">
                    {paper.answerKey.sections?.map((section, sIdx) => (
                      <div key={sIdx}>
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">{section.partLabel}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.answers?.map((a) => (
                            <div key={a.id} className="text-sm text-green-800 leading-relaxed">
                              <strong>{a.id}.</strong> {a.answer}
                              {a.explanation && <span className="text-green-600 text-xs ml-1">— {a.explanation}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 print:bg-transparent text-center">
                <p className="text-xs text-gray-400 print:text-gray-600">
                  Nethaji Vidhyalayam • {paper.examType} Examination • {paper.subject} • Class {paper.grade} • {paper.term}
                </p>
                <p className="text-xs text-gray-300 print:text-gray-500 mt-0.5">
                  Generated by Question Paper Creator • AI-powered • Samacheer Kalvi aligned
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
