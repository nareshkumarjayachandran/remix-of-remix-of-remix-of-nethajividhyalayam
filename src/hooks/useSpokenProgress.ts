/**
 * useSpokenProgress — localStorage-based progress tracking for Spoken English
 * Tracks: daily streak, session scores, common mistakes, fluency over time
 */
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "miss_nova_progress";

export interface DailyScore {
  date: string; // YYYY-MM-DD
  avgStars: number;
  sessions: number;
  fluencyPercent: number;
}

export interface MistakeEntry {
  word: string;
  count: number;
  lastSeen: string;
}

export interface ProgressData {
  streak: number;
  lastPracticeDate: string;
  totalSessions: number;
  totalStars: number;
  dailyScores: DailyScore[];
  commonMistakes: MistakeEntry[];
  bestStreak: number;
  levelXP: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  streak: 0,
  lastPracticeDate: "",
  totalSessions: 0,
  totalStars: 0,
  dailyScores: [],
  commonMistakes: [],
  bestStreak: 0,
  levelXP: 0,
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useSpokenProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const recordSession = useCallback((stars: number, accuracyPercent: number, mistakes?: { wrong: string; correct: string }[]) => {
    setProgress((prev) => {
      const today = todayStr();
      const updated = { ...prev };

      // Update streak
      if (updated.lastPracticeDate === today) {
        // Already practiced today, just update scores
      } else if (updated.lastPracticeDate === yesterdayStr()) {
        updated.streak += 1;
      } else if (updated.lastPracticeDate !== today) {
        updated.streak = 1;
      }
      updated.lastPracticeDate = today;
      if (updated.streak > updated.bestStreak) updated.bestStreak = updated.streak;

      // Update totals
      updated.totalSessions += 1;
      updated.totalStars += stars;
      updated.levelXP += stars * 10 + Math.round(accuracyPercent / 10);

      // Update daily scores
      const dailyScores = [...updated.dailyScores];
      const existingIdx = dailyScores.findIndex((d) => d.date === today);
      if (existingIdx >= 0) {
        const existing = dailyScores[existingIdx];
        const newSessions = existing.sessions + 1;
        dailyScores[existingIdx] = {
          date: today,
          sessions: newSessions,
          avgStars: Math.round(((existing.avgStars * existing.sessions) + stars) / newSessions * 10) / 10,
          fluencyPercent: Math.round(((existing.fluencyPercent * existing.sessions) + accuracyPercent) / newSessions),
        };
      } else {
        dailyScores.push({ date: today, sessions: 1, avgStars: stars, fluencyPercent: accuracyPercent });
      }
      // Keep last 30 days
      updated.dailyScores = dailyScores.slice(-30);

      // Update common mistakes
      if (mistakes && mistakes.length > 0) {
        const mistakeMap = new Map<string, MistakeEntry>();
        for (const m of updated.commonMistakes) mistakeMap.set(m.word, m);
        for (const { wrong } of mistakes) {
          if (!wrong) continue;
          const key = wrong.toLowerCase();
          const existing = mistakeMap.get(key);
          if (existing) {
            mistakeMap.set(key, { ...existing, count: existing.count + 1, lastSeen: today });
          } else {
            mistakeMap.set(key, { word: key, count: 1, lastSeen: today });
          }
        }
        updated.commonMistakes = Array.from(mistakeMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
      }

      return updated;
    });
  }, []);

  const getLevel = useCallback(() => {
    const xp = progress.levelXP;
    if (xp >= 1000) return { level: 5, title: "English Champion 🏆", nextXP: Infinity };
    if (xp >= 500) return { level: 4, title: "Fluent Speaker 🌟", nextXP: 1000 };
    if (xp >= 200) return { level: 3, title: "Rising Star ⭐", nextXP: 500 };
    if (xp >= 50) return { level: 2, title: "Active Learner 📚", nextXP: 200 };
    return { level: 1, title: "Beginner 🌱", nextXP: 50 };
  }, [progress.levelXP]);

  const avgFluency = progress.dailyScores.length > 0
    ? Math.round(progress.dailyScores.reduce((sum, d) => sum + d.fluencyPercent, 0) / progress.dailyScores.length)
    : 0;

  const avgStars = progress.totalSessions > 0
    ? Math.round((progress.totalStars / progress.totalSessions) * 10) / 10
    : 0;

  return { progress, recordSession, getLevel, avgFluency, avgStars };
}
