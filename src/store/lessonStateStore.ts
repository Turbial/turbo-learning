// ─── Lesson state store — persists mid-lesson progress in AsyncStorage ───
// Survives page refreshes. Cleared when lesson is completed or abandoned.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LessonState {
  lessonId: string;
  stepIndex: number;
  sessionXp: number;
  responses: Record<string, unknown>;
  correctCount: number;
  totalGraded: number;
  comboStreak: number;
  savedAt: number; // Date.now()
}

interface LessonStateStore {
  /** Current in-progress lesson state, or null if not mid-lesson */
  current: LessonState | null;
  /** Save mid-lesson state */
  save: (state: LessonState) => void;
  /** Clear saved state (lesson completed or abandoned) */
  clear: () => void;
  /** Check if a lesson has saved progress */
  hasSaved: (lessonId: string) => boolean;
}

export const useLessonStateStore = create<LessonStateStore>()(
  persist(
    (set, get) => ({
      current: null,

      save: (state: LessonState) => set({ current: { ...state, savedAt: Date.now() } }),

      clear: () => set({ current: null }),

      hasSaved: (lessonId: string) => {
        const cur = get().current;
        return cur !== null && cur.lessonId === lessonId;
      },
    }),
    {
      name: "lesson-state-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
