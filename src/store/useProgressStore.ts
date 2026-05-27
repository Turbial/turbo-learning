// useProgressStore — User progress, XP, level, shields, combo tracking
import { create } from "zustand";

const LEVEL_THRESHOLDS = [0, 200, 600, 1200, 2500, 4000, 6000, 8500, 11500, 15000];

function computeLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function xpForNextLevel(level: number): number {
  const idx = level - 1;
  return LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
}

function xpForCurrentLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 0;
}

interface KnowledgeEntry {
  date: string;   // ISO date
  score: number;  // 0–100
}

interface ProgressStore {
  // State
  xp: number;
  level: number;
  streak: number;
  shieldCount: number;
  longestStreak: number;
  combo: number;
  knowledgeHistory: KnowledgeEntry[];
  lastCompletedDate: string | null;

  // Computed
  xpToNextLevel: number;
  xpProgress: number; // 0–1

  // Actions
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  completeDay: (score?: number) => { streakIntact: boolean; shieldConsumed: boolean; shieldEarned: boolean };
  incrementCombo: () => number;
  resetCombo: () => void;
  setProgress: (data: Partial<ProgressStore>) => void;
  addKnowledgeScore: (score: number) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  xp: 0,
  level: 1,
  streak: 0,
  shieldCount: 0,
  longestStreak: 0,
  combo: 0,
  knowledgeHistory: [],
  lastCompletedDate: null,

  get xpToNextLevel() {
    return xpForNextLevel(get().level) - get().xp;
  },

  get xpProgress() {
    const { xp, level } = get();
    const current = xpForCurrentLevel(level);
    const next = xpForNextLevel(level);
    return Math.min(1, Math.max(0, (xp - current) / (next - current)));
  },

  addXP: (amount: number) => {
    const state = get();
    const newXp = state.xp + amount;
    const newLevel = computeLevel(newXp);
    const leveledUp = newLevel > state.level;

    set({
      xp: newXp,
      level: newLevel,
    });

    return { leveledUp, newLevel };
  },

  completeDay: (score?: number) => {
    const state = get();
    const now = new Date();
    const nowISO = now.toISOString();

    // Check if already completed today
    if (state.lastCompletedDate) {
      const lastDate = new Date(state.lastCompletedDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      if (today.getTime() === lastDay.getTime()) {
        return { streakIntact: true, shieldConsumed: false, shieldEarned: false };
      }
    }

    let newStreak = state.streak;
    let newShields = state.shieldCount;
    let shieldConsumed = false;
    let shieldEarned = false;

    if (state.lastCompletedDate) {
      const lastDate = new Date(state.lastCompletedDate);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

      if (lastDay.getTime() === yesterdayDay.getTime()) {
        // Consecutive day
        newStreak = state.streak + 1;
      } else if (state.shieldCount > 0) {
        // Use shield to preserve streak
        newShields = state.shieldCount - 1;
        newStreak = state.streak + 1;
        shieldConsumed = true;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Earn shield every 7 days
    if (newStreak > 0 && newStreak % 7 === 0) {
      newShields += 1;
      shieldEarned = true;
    }

    const newLongest = Math.max(state.longestStreak, newStreak);

    // Add knowledge score if provided
    const newHistory = score !== undefined
      ? [...state.knowledgeHistory, { date: nowISO, score }].slice(-30) // Keep last 30 days
      : state.knowledgeHistory;

    set({
      streak: newStreak,
      shieldCount: newShields,
      longestStreak: newLongest,
      lastCompletedDate: nowISO,
      knowledgeHistory: newHistory,
    });

    return { streakIntact: !shieldConsumed || newStreak > state.streak, shieldConsumed, shieldEarned };
  },

  incrementCombo: () => {
    const state = get();
    const newCombo = state.combo + 1;
    set({ combo: newCombo });

    // Every 3 correct = +5 bonus XP
    if (newCombo % 3 === 0) {
      get().addXP(5);
    }

    return newCombo;
  },

  resetCombo: () => {
    set({ combo: 0 });
  },

  setProgress: (data: Partial<ProgressStore>) => {
    set(data);
  },

  addKnowledgeScore: (score: number) => {
    const now = new Date().toISOString();
    set((state) => ({
      knowledgeHistory: [...state.knowledgeHistory, { date: now, score: Math.max(0, Math.min(100, score)) }].slice(-30),
    }));
  },
}));

// Non-reactive getter for use outside of React components
export function getProgressSnapshot() {
  return useProgressStore.getState();
}
