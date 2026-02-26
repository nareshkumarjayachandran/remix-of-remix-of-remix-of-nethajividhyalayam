import { ArrowLeft, Flame, Trophy, Target, Star, TrendingUp, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { ProgressData } from "@/hooks/useSpokenProgress";

interface Props {
  progress: ProgressData;
  avgFluency: number;
  avgStars: number;
  level: { level: number; title: string; nextXP: number };
  onBack: () => void;
}

export default function ProgressDashboard({ progress, avgFluency, avgStars, level, onBack }: Props) {
  const chartData = progress.dailyScores.slice(-14).map((d) => ({
    date: d.date.slice(5),
    fluency: d.fluencyPercent,
    sessions: d.sessions,
  }));

  const xpPercent = level.nextXP === Infinity ? 100 : Math.min(100, Math.round((progress.levelXP / level.nextXP) * 100));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">My Progress</h1>
            <p className="text-xs text-gray-400">Track your English journey</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4 overflow-y-auto pb-8">
        {/* Level + XP */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              {level.level}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{level.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${xpPercent}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                  {progress.levelXP}{level.nextXP !== Infinity ? ` / ${level.nextXP}` : ""} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <MiniStat icon={<Flame className="h-4 w-4 text-orange-500" />} value={progress.streak} label="Streak" />
          <MiniStat icon={<Trophy className="h-4 w-4 text-amber-500" />} value={progress.bestStreak} label="Best" />
          <MiniStat icon={<Target className="h-4 w-4 text-blue-500" />} value={progress.totalSessions} label="Sessions" />
          <MiniStat icon={<Star className="h-4 w-4 text-purple-500" />} value={`${avgStars}⭐`} label="Rating" />
        </div>

        {/* Fluency Ring */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={avgFluency >= 75 ? "#22c55e" : avgFluency >= 50 ? "#eab308" : "#ef4444"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(avgFluency / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-gray-800">{avgFluency}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Overall Fluency</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {avgFluency >= 80 ? "Excellent! Keep it up 🏆" : avgFluency >= 60 ? "Good progress! 💪" : avgFluency >= 40 ? "Keep practicing! 📚" : "Just getting started 🌱"}
            </p>
          </div>
        </div>

        {/* Fluency Chart */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <p className="text-sm font-bold text-gray-700">Fluency Trend</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fluencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#d1d5db" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#d1d5db" axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="fluency" stroke="#6366f1" fill="url(#fluencyGrad)" strokeWidth={2} name="Fluency %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sessions Chart */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-3">📅 Daily Sessions</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#d1d5db" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="#d1d5db" axisLine={false} tickLine={false} width={20} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="sessions" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.length < 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-3xl mb-2">📈</p>
            <p className="text-sm font-bold text-gray-600">Charts appear after 2+ days</p>
            <p className="text-xs text-gray-400 mt-1">Practice daily to see your progress!</p>
          </div>
        )}

        {/* Common Mistakes */}
        {progress.commonMistakes.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <p className="text-sm font-bold text-gray-700">Common Mistakes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {progress.commonMistakes.slice(0, 8).map((m) => (
                <span key={m.word} className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {m.word} <span className="text-red-400">×{m.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-base font-black text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
    </div>
  );
}
