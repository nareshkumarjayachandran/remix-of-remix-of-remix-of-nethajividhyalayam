import { ArrowLeft, Flame, Trophy, Target, TrendingUp, Star, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";
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
    date: d.date.slice(5), // MM-DD
    fluency: d.fluencyPercent,
    stars: d.avgStars,
    sessions: d.sessions,
  }));

  const xpPercent = level.nextXP === Infinity ? 100 : Math.min(100, Math.round((progress.levelXP / level.nextXP) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-5 text-white shadow-lg">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button onClick={onBack} className="p-1 rounded-full bg-white/20 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="font-extrabold text-lg">📊 My Progress</p>
            <p className="text-xs text-blue-200">Track your English journey</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4 overflow-y-auto">
        {/* Level Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
              {level.level}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-gray-800">{level.title}</p>
              <p className="text-xs text-gray-500">{progress.levelXP} XP earned</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          {level.nextXP !== Infinity && (
            <p className="text-xs text-gray-400 mt-1 text-right">{progress.levelXP} / {level.nextXP} XP to next level</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Current Streak" value={`${progress.streak} day${progress.streak !== 1 ? "s" : ""}`} accent="border-orange-100" />
          <StatCard icon={<Trophy className="h-5 w-5 text-yellow-500" />} label="Best Streak" value={`${progress.bestStreak} day${progress.bestStreak !== 1 ? "s" : ""}`} accent="border-yellow-100" />
          <StatCard icon={<Target className="h-5 w-5 text-blue-500" />} label="Total Sessions" value={String(progress.totalSessions)} accent="border-blue-100" />
          <StatCard icon={<Star className="h-5 w-5 text-purple-500" />} label="Avg Rating" value={`${avgStars} ⭐`} accent="border-purple-100" />
        </div>

        {/* Fluency Score */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Overall Fluency</p>
          <div className="relative w-24 h-24 mx-auto mb-2">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={avgFluency >= 75 ? "#22c55e" : avgFluency >= 50 ? "#eab308" : "#ef4444"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(avgFluency / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-gray-800">{avgFluency}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {avgFluency >= 80 ? "Excellent! 🏆" : avgFluency >= 60 ? "Good progress! 💪" : avgFluency >= 40 ? "Keep practicing! 📚" : "You're just getting started! 🌱"}
          </p>
        </div>

        {/* Fluency Chart */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-bold text-gray-700">Fluency Over Time</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fluencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip />
                <Area type="monotone" dataKey="fluency" stroke="#6366f1" fill="url(#fluencyGrad)" strokeWidth={2} name="Fluency %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sessions Chart */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
            <p className="text-sm font-bold text-gray-700 mb-3">📅 Daily Sessions</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="sessions" fill="#22c55e" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.length < 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-4xl mb-2">📈</p>
            <p className="text-sm font-bold text-gray-600">Charts will appear after 2+ days of practice</p>
            <p className="text-xs text-gray-400 mt-1">Keep practicing daily to see your progress!</p>
          </div>
        )}

        {/* Common Mistakes */}
        {progress.commonMistakes.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-bold text-gray-700">Common Mistakes</p>
            </div>
            <div className="space-y-2">
              {progress.commonMistakes.slice(0, 8).map((m) => (
                <div key={m.word} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold text-red-700">"{m.word}"</span>
                  <span className="text-xs text-red-500 font-bold">{m.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pb-4" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className={cn("bg-white rounded-2xl p-3 shadow-sm border", accent)}>
      <div className="flex items-center gap-2 mb-1">{icon}<p className="text-xs font-bold text-gray-500">{label}</p></div>
      <p className="text-lg font-black text-gray-800">{value}</p>
    </div>
  );
}
