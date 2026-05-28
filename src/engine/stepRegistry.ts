// ─── Step registry: type → handler mapping ───
// Adding a step type = add a component + one entry here.
// The LessonPlayer never changes.

import type { Step, StepResponse, NarrationController } from "./types";
import type { LessonPlayerState } from "./LessonPlayer";

// ─── Step handler interface ───

export interface StepProps<S extends Step = Step> {
  step: S;
  onAnswer: (res: StepResponse) => void;
  onContinue: () => void;
  narration: NarrationController;
  state: LessonPlayerState;
}

export interface StepHandler<S extends Step = Step> {
  component: React.ComponentType<StepProps<S>>;
  validate?: (step: S, res: StepResponse) => boolean;
  score?: (step: S, res: StepResponse) => number;
  behavior: {
    requiresInteraction: boolean;
    autoAdvanceMs?: number;
  };
}

// ─── Import step components ───

import InfoStep from "./components/steps/InfoStep";
import ScenarioCardStep from "./components/steps/ScenarioCardStep";
import ExampleStep from "./components/steps/ExampleStep";
import McStep from "./components/steps/McStep";
import HighlightStep from "./components/steps/HighlightStep";
import GoodFitStep from "./components/steps/GoodFitStep";
import BuilderStep from "./components/steps/BuilderStep";
import CopyActionStep from "./components/steps/CopyActionStep";
import QuizStepComp from "./components/steps/QuizStep";
import CompareStep from "./components/steps/CompareStep";
import FallbackStep from "./components/steps/FallbackStep";

// ─── New step components from Google Drive spec (onNext/onXP interface) ───
import NewTrueFalseStep from "../components/lesson/steps/TrueFalseStep";
import NewFillBlankStep from "../components/lesson/steps/FillBlankStep";
import NewMatchStep from "../components/lesson/steps/MatchStep";
import NewPasteCaptureStep from "../components/lesson/steps/PasteCaptureStep";
import NewReflectionStep from "../components/lesson/steps/ReflectionStep";
import NewCompletionStep from "../components/lesson/steps/CompletionStep";
import NewBadgeUnlockStep from "../components/lesson/steps/BadgeUnlockStep";
import NewStreakStep from "../components/lesson/steps/StreakStep";
import NewCommitStep from "../components/lesson/steps/CommitStep";

// ─── Adapter: bridges onNext/onXP components to engine's onAnswer/onContinue ───
import { createElement } from "react";
function adaptStep(Component: React.ComponentType<{ step: any; onNext: () => void; onXP: (x: number) => void }>): React.ComponentType<StepProps> {
  return function AdaptedStep({ step, onAnswer, onContinue }: StepProps) {
    return createElement(Component, { step, onNext: onContinue, onXP: (xp: number) => onAnswer(xp) });
  };
}

// ─── Scoring helpers ───

import {
  defaultScore,
  mcScore,
  tfScore,
  goodFitScore,
  fillBlankScore,
} from "./scoring";

// ─── Validation helpers ───

function mcCorrect(step: Step, res: StepResponse): boolean {
  const s = step as import("./types").McStep;
  return typeof res === "number" && res === s.correct;
}

function tfCorrect(step: Step, res: StepResponse): boolean {
  const s = step as import("./types").TrueFalseStep;
  return typeof res === "boolean" && res === s.correct;
}

function goodFitCorrect(step: Step, res: StepResponse): boolean {
  const s = step as import("./types").GoodFitStep;
  return res === s.correct;
}

function fillBlankCorrect(step: Step, res: StepResponse): boolean {
  const s = step as import("./types").FillBlankStep;
  if (typeof res !== "string") return false;
  const normalized = (res as string).trim().toLowerCase();
  const aliases = s.aliases?.map((a) => a.toLowerCase()) ?? [];
  return normalized === s.answer.toLowerCase() || aliases.includes(normalized);
}

// ─── Rescore helpers ───

function mcRescore(step: Step, res: StepResponse): number {
  return mcScore(step as import("./types").McStep, res as number);
}
function tfRescore(step: Step, res: StepResponse): number {
  return tfScore(step as import("./types").TrueFalseStep, res as boolean);
}
function goodFitRescore(step: Step, res: StepResponse): number {
  return goodFitScore(step as import("./types").GoodFitStep, res as "good" | "notideal");
}
function fillBlankRescore(step: Step, res: StepResponse): number {
  return fillBlankScore(step as import("./types").FillBlankStep, res as string);
}

// ─── Registry (with real components) ───

export const stepRegistry: Record<Step["type"], StepHandler<any>> = {
  info: {
    component: InfoStep as any,
    behavior: { requiresInteraction: false },
  },
  scenario_card: {
    component: ScenarioCardStep as any,
    behavior: { requiresInteraction: false },
  },
  example: {
    component: ExampleStep as any,
    behavior: { requiresInteraction: false },
  },
  mc: {
    component: McStep as any,
    validate: mcCorrect,
    score: mcRescore,
    behavior: { requiresInteraction: true, autoAdvanceMs: 1800 },
  },
  scenario: {
    component: McStep as any,
    validate: mcCorrect,
    score: mcRescore,
    behavior: { requiresInteraction: true, autoAdvanceMs: 1800 },
  },
  tf: {
    component: adaptStep(NewTrueFalseStep) as any,
    behavior: { requiresInteraction: true },
  },
  highlight: {
    component: HighlightStep as any,
    behavior: { requiresInteraction: false },
  },
  fillblank: {
    component: adaptStep(NewFillBlankStep) as any,
    behavior: { requiresInteraction: true },
  },
  match: {
    component: adaptStep(NewMatchStep) as any,
    behavior: { requiresInteraction: true },
  },
  good_fit: {
    component: GoodFitStep as any,
    validate: goodFitCorrect,
    score: goodFitRescore,
    behavior: { requiresInteraction: true, autoAdvanceMs: 2000 },
  },
  quiz: {
    component: QuizStepComp as any,
    behavior: { requiresInteraction: true },
  },
  builder: {
    component: BuilderStep as any,
    behavior: { requiresInteraction: true },
  },
  copy_action: {
    component: CopyActionStep as any,
    behavior: { requiresInteraction: true },
  },
  paste_capture: {
    component: adaptStep(NewPasteCaptureStep) as any,
    behavior: { requiresInteraction: true },
  },
  compare: {
    component: CompareStep as any,
    behavior: { requiresInteraction: true },
  },
  reflection: {
    component: adaptStep(NewReflectionStep) as any,
    behavior: { requiresInteraction: true },
  },
  badge_unlock: {
    component: adaptStep(NewBadgeUnlockStep) as any,
    behavior: { requiresInteraction: false },
  },
  streak_commitment: {
    component: adaptStep(NewStreakStep) as any,
    behavior: { requiresInteraction: false },
  },
  reminder_setup: {
    component: FallbackStep as any, // Deferred — requires native push permissions
    behavior: { requiresInteraction: true },
  },
  completion: {
    component: adaptStep(NewCompletionStep) as any,
    behavior: { requiresInteraction: false },
  },
};
