// ─── Daily Challenge Store — persists today's challenge result in AsyncStorage ───
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DailyChallengeStore {
  dateKey: string | null;       // 'YYYY-MM-DD' of the completed challenge
  score: number | null;         // 0-5
  timeTakenMs: number | null;   // milliseconds
  answers: boolean[];           // true=correct for each question
  setResult: (dateKey: string, score: number, timeTakenMs: number, answers: boolean[]) => void;
  isCompletedToday: () => boolean;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const useDailyChallengeStore = create<DailyChallengeStore>()(
  persist(
    (set, get) => ({
      dateKey: null,
      score: null,
      timeTakenMs: null,
      answers: [],

      setResult: (dateKey, score, timeTakenMs, answers) =>
        set({ dateKey, score, timeTakenMs, answers }),

      isCompletedToday: () => get().dateKey === todayKey(),
    }),
    {
      name: "daily-challenge-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
