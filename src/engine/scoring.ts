// ─── XP scoring rules per step type ───
// All functions return base XP. The LessonPlayer adds correctness multiplier.

import type { Step, McStep, TrueFalseStep, GoodFitStep, FillBlankStep, MatchStep, QuizStep } from "./types";

const BASE_XP = 10;
const BONUS_PERFECT = 5;

/**
 * Default: returns step.xp or BASE_XP.
 * Step-specific scorers override this with per-type logic.
 */
export function defaultScore(step: Step): number {
  return step.xp ?? BASE_XP;
}

// Awards base XP for wrong answers as participation credit (intentional — keeps
// users motivated even when they get an answer wrong). Correct answers get base + bonus.
export function mcScore(step: McStep, selected: number): number {
  const base = step.xp ?? BASE_XP;
  return selected === step.correct ? base + BONUS_PERFECT : base;
}

export function tfScore(step: TrueFalseStep, selected: boolean): number {
  const base = step.xp ?? BASE_XP;
  return selected === step.correct ? base + BONUS_PERFECT : base;
}

export function goodFitScore(step: GoodFitStep, selected: "good" | "notideal"): number {
  const base = step.xp ?? BASE_XP;
  return selected === step.correct ? base + BONUS_PERFECT : base;
}

export function fillBlankScore(step: FillBlankStep, answer: string): number {
  const base = step.xp ?? BASE_XP;
  const normalized = answer.trim().toLowerCase();
  const isCorrect =
    normalized === step.answer.toLowerCase() ||
    (step.aliases?.some((a) => normalized === a.toLowerCase()) ?? false);
  return isCorrect ? base + BONUS_PERFECT : base;
}

export function matchScore(step: MatchStep, correctCount: number): number {
  const base = step.xp ?? BASE_XP;
  const ratio = correctCount / Math.max(step.pairs.length, 1);
  return Math.round(base * ratio) + (ratio === 1 ? BONUS_PERFECT : 0);
}

export function quizScore(step: QuizStep, correctCount: number): number {
  const base = step.xp ?? BASE_XP;
  const ratio = correctCount / Math.max(step.questions.length, 1);
  return Math.round(base * ratio) + (ratio === 1 ? BONUS_PERFECT : 0);
}

/**
 * Calculate level from total XP.
 * Level formula: level = floor(sqrt(xp / 100)) + 1
 * This gives: L1 at 0xp, L2 at 100, L3 at 400, L5 at 1600, L10 at 8100
 */
export function xpToLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

/**
 * XP needed to reach the next level from current total.
 */
export function xpToNextLevel(totalXp: number): number {
  const currentLevel = xpToLevel(totalXp);
  const nextLevelXp = Math.pow(currentLevel, 2) * 100;
  return nextLevelXp - totalXp;
}
