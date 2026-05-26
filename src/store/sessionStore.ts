// ─── Zustand session store — live lesson state ───
// Client-side only. Persisted answers feed into Supabase on completion.

import { create } from "zustand";
import type { StepResponse } from "../engine/types";

export interface SessionStore {
  // Current lesson
  lessonId: string | null;
  stepIndex: number;
  sessionXp: number;
  responses: Record<string, StepResponse>;
  correctCount: number;
  totalGraded: number;

  // Actions
  startLesson: (lessonId: string) => void;
  advance: () => void;
  back: () => void;
  recordAnswer: (stepId: string, res: StepResponse, xp: number, correct?: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  lessonId: null,
  stepIndex: 0,
  sessionXp: 0,
  responses: {},
  correctCount: 0,
  totalGraded: 0,

  startLesson: (lessonId) =>
    set({
      lessonId,
      stepIndex: 0,
      sessionXp: 0,
      responses: {},
      correctCount: 0,
      totalGraded: 0,
    }),

  advance: () => set((s) => ({ stepIndex: s.stepIndex + 1 })),

  back: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),

  recordAnswer: (stepId, res, xp, correct) =>
    set((s) => ({
      sessionXp: s.sessionXp + xp,
      responses: { ...s.responses, [stepId]: res },
      correctCount: correct ? s.correctCount + 1 : s.correctCount,
      totalGraded: correct !== undefined ? s.totalGraded + 1 : s.totalGraded,
    })),

  reset: () =>
    set({
      lessonId: null,
      stepIndex: 0,
      sessionXp: 0,
      responses: {},
      correctCount: 0,
      totalGraded: 0,
    }),
}));
