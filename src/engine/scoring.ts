// ─── XP scoring rules per step type ───
// All functions return base XP. The LessonPlayer applies combo multiplier.

import type { Step, McStep, TrueFalseStep, GoodFitStep, FillBlankStep, MatchStep, QuizStep } from "./types";

const BASE_XP = 10;
const BONUS_PERFECT = 5;

// ─── Combo system ───
// Consecutive correct answers build a combo streak that multiplies XP.
// This rewards sustained accuracy and creates urgency to maintain focus.

/**
 * Combo thresholds control how quickly the multiplier scales.
 * streak → multiplier mapping:
 *   0-1  = 1x (no combo)
 *   2-3  = 1.5x
 *   4-6  = 2x
 *   7-10 = 2.5x
 *   11+  = 3x (max)
 */
export type ComboConfig = {
  thresholds: { streak: number; multiplier: number }[];
};

const DEFAULT_COMBO_CONFIG: ComboConfig = {
  thresholds: [
    { streak: 0, multiplier: 1.0 },
    { streak: 2, multiplier: 1.5 },
    { streak: 4, multiplier: 2.0 },
    { streak: 7, multiplier: 2.5 },
    { streak: 11, multiplier: 3.0 },
  ],
};

/**
 * Look up the XP multiplier for a given combo streak.
 */
export function getComboMultiplier(streak: number, config: ComboConfig = DEFAULT_COMBO_CONFIG): number {
  let multiplier = 1.0;
  for (const t of config.thresholds) {
    if (streak >= t.streak) {
      multiplier = t.multiplier;
    }
  }
  return multiplier;
}

/**
 * Human-readable combo label for display.
 */
export function getComboLabel(streak: number): string {
  if (streak < 2) return "";
  if (streak < 4) return "Nice!";
  if (streak < 7) return "Great streak!";
  if (streak < 11) return "Amazing!";
  return "Unstoppable!";
}

/**
 * Apply combo multiplier to base XP.
 */
export function applyCombo(baseXp: number, comboStreak: number, config?: ComboConfig): number {
  return Math.round(baseXp * getComboMultiplier(comboStreak, config));
}

/**
 * Default: returns step.xp or BASE_XP.
 * For non-graded steps, returns 0 so they don't affect the combo.
 */
export function defaultScore(step: Step): number {
  const xp = step.xp ?? BASE_XP;
  return step.type === "info" || step.type === "scenario_card" || step.type === "example" ||
         step.type === "highlight" || step.type === "completion" || step.type === "badge_unlock"
    ? 0  // non-interactive steps don't earn XP
    : xp;
}

// Wrong answers = 0 XP. Participation XP was intentionally awarded in v0 to keep
// users motivated, but feedback showed it rewards guessing. Only correct answers earn XP.
export function mcScore(step: McStep, selected: number): number {
  const base = step.xp ?? BASE_XP;
  return selected === step.correct ? base + BONUS_PERFECT : 0;
}

export function tfScore(step: TrueFalseStep, selected: boolean): number {
  const base = step.xp ?? BASE_XP;
  return selected === step.correct ? base + BONUS_PERFECT : 0;
}

export function goodFitScore(step: GoodFitStep, selected: "good" | "notideal"): number {
  const base = step.xp ?? BASE_XP;
  return selected === step.correct ? base + BONUS_PERFECT : 0;
}

export function fillBlankScore(step: FillBlankStep, answer: string): number {
  const base = step.xp ?? BASE_XP;
  const normalized = answer.trim().toLowerCase();
  const isCorrect =
    normalized === step.answer.toLowerCase() ||
    (step.aliases?.some((a) => normalized === a.toLowerCase()) ?? false);
  return isCorrect ? base + BONUS_PERFECT : 0;
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
