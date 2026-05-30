// ─── Pure progression logic for the lesson player ───
// No React, no side-effects — just state transitions.

import type { Step, SessionState, StepResponse } from "./types";

export type MachineAction =
  | { type: "ADVANCE" }
  | { type: "BACK" }
  | { type: "ANSWER"; stepId: string; response: StepResponse; xp: number; correct?: boolean; comboStreak: number }
  | { type: "RESTORE"; payload: Omit<SessionState, "lessonId"> }
  | { type: "RESET" };

export function createInitialState(lessonId: string): SessionState {
  return {
    lessonId,
    stepIndex: 0,
    sessionXp: 0,
    responses: {},
    correctCount: 0,
    totalGraded: 0,
    comboStreak: 0,
  };
}

export function lessonReducer(state: SessionState, action: MachineAction): SessionState {
  switch (action.type) {
    case "ADVANCE":
      return { ...state, stepIndex: state.stepIndex + 1 };

    case "BACK":
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1) };

    case "ANSWER": {
      const responses = { ...state.responses, [action.stepId]: action.response };
      const correctCount = action.correct ? state.correctCount + 1 : state.correctCount;
      const totalGraded = action.correct !== undefined ? state.totalGraded + 1 : state.totalGraded;
      const comboStreak = action.comboStreak;
      return {
        ...state,
        sessionXp: state.sessionXp + action.xp,
        responses,
        correctCount,
        totalGraded,
        comboStreak,
      };
    }

    case "RESTORE":
      return { ...state, ...action.payload };

    case "RESET":
      return createInitialState(state.lessonId);

    default:
      return state;
  }
}

/**
 * Returns true if the current step is the last one.
 */
export function isLastStep(stepIndex: number, totalSteps: number): boolean {
  return stepIndex >= totalSteps - 1;
}

/**
 * Returns a completion score as a ratio (0–1).
 */
export function completionScore(state: SessionState): number {
  if (state.totalGraded === 0) return 0;
  return state.correctCount / state.totalGraded;
}
