// ─── Step registry: type → handler mapping ───
// Adding a step type = add a component + one entry here.
// The LessonPlayer never changes.

import React from "react";
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

// ─── Import step components (engine-native, all using StepProps interface) ───

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
import EngineChatStep from "./components/steps/ChatStep";
import EngineTrueFalseStep from "./components/steps/TrueFalseStep";
import EngineFillBlankStep from "./components/steps/FillBlankStep";
import EngineMatchStep from "./components/steps/MatchStep";
import EnginePasteCaptureStep from "./components/steps/PasteCaptureStep";
import EngineReflectionStep from "./components/steps/ReflectionStep";
import EngineBadgeUnlockStep from "./components/steps/BadgeUnlockStep";
import EngineStreakCommitStep from "./components/steps/StreakCommitStep";
import EngineReminderSetupStep from "./components/steps/ReminderSetupStep";
import EngineCompletionStep from "./components/steps/CompletionStep";
import PromptGenerator from "../components/steps/PromptGenerator";

// ─── Scoring helpers ───

import {
  defaultScore,
  mcScore,
  tfScore,
  goodFitScore,
  fillBlankScore,
  matchScore,
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

function matchCorrect(step: Step, res: StepResponse): boolean {
  const s = step as import("./types").MatchStep;
  if (typeof res !== "object" || !res) return false;
  const matches = res as Record<number, number>;
  return s.pairs.every((_, i) => matches[i] === i);
}

function matchCountCorrect(step: Step, res: StepResponse): number {
  const s = step as import("./types").MatchStep;
  if (typeof res !== "object" || !res) return 0;
  const matches = res as Record<number, number>;
  return s.pairs.filter((_, i) => matches[i] === i).length;
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
function matchRescore(step: Step, res: StepResponse): number {
  return matchScore(step as import("./types").MatchStep, matchCountCorrect(step, res));
}
function defRescore(step: Step): number {
  return defaultScore(step);
}

// ─── Registry ───

export const stepRegistry: Record<Step["type"], StepHandler<any>> = {
  info: {
    component: InfoStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: false },
  },
  scenario_card: {
    component: ScenarioCardStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: false },
  },
  example: {
    component: ExampleStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: false },
  },
  mc: {
    component: McStep as React.ComponentType<StepProps<any>>,
    validate: mcCorrect,
    score: mcRescore,
    behavior: { requiresInteraction: true },
  },
  scenario: {
    component: McStep as React.ComponentType<StepProps<any>>,
    validate: mcCorrect,
    score: mcRescore,
    behavior: { requiresInteraction: true },
  },
  tf: {
    component: EngineTrueFalseStep as React.ComponentType<StepProps<any>>,
    validate: tfCorrect,
    score: tfRescore,
    behavior: { requiresInteraction: true },
  },
  highlight: {
    component: HighlightStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: false },
  },
  fillblank: {
    component: EngineFillBlankStep as React.ComponentType<StepProps<any>>,
    validate: fillBlankCorrect,
    score: fillBlankRescore,
    behavior: { requiresInteraction: true },
  },
  match: {
    component: EngineMatchStep as React.ComponentType<StepProps<any>>,
    validate: matchCorrect,
    score: matchRescore,
    behavior: { requiresInteraction: true },
  },
  good_fit: {
    component: GoodFitStep as React.ComponentType<StepProps<any>>,
    validate: goodFitCorrect,
    score: goodFitRescore,
    behavior: { requiresInteraction: true },
  },
  quiz: {
    component: QuizStepComp as React.ComponentType<StepProps<any>>,
    validate: (_step: Step, res: StepResponse) => {
      if (typeof res !== "object" || !res) return false;
      const r = res as Record<string, number | string>;
      const s = _step as import("./types").QuizStep;
      let correct = 0;
      s.questions.forEach((q) => {
        const userAnswer = r[q.id];
        if (userAnswer !== undefined && String(userAnswer) === String(q.correct)) correct++;
      });
      return correct === s.questions.length;
    },
    score: (_step: Step, res: StepResponse) => {
      if (typeof res !== "object" || !res) return 0;
      const r = res as Record<string, number | string>;
      const s = _step as import("./types").QuizStep;
      let correct = 0;
      s.questions.forEach((q) => {
        if (String(r[q.id] ?? "") === String(q.correct)) correct++;
      });
      return Math.round((s.xp ?? 10) * (correct / s.questions.length));
    },
    behavior: { requiresInteraction: true },
  },
  builder: {
    component: BuilderStep as React.ComponentType<StepProps<any>>,
    // Builder steps are always "correct" (subjective); award base XP
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
  copy_action: {
    component: CopyActionStep as React.ComponentType<StepProps<any>>,
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
  paste_capture: {
    component: EnginePasteCaptureStep as React.ComponentType<StepProps<any>>,
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
  compare: {
    component: CompareStep as React.ComponentType<StepProps<any>>,
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
  reflection: {
    component: EngineReflectionStep as React.ComponentType<StepProps<any>>,
    // Subjective — always award participation XP
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
  badge_unlock: {
    component: EngineBadgeUnlockStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: false },
  },
  streak_commitment: {
    component: EngineStreakCommitStep as React.ComponentType<StepProps<any>>,
    score: defRescore,
    behavior: { requiresInteraction: false },
  },
  reminder_setup: {
    component: EngineReminderSetupStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: true },
  },
  completion: {
    component: EngineCompletionStep as React.ComponentType<StepProps<any>>,
    behavior: { requiresInteraction: false },
  },
  prompt_generator: {
    component: PromptGenerator as any,
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
  chat: {
    component: EngineChatStep as React.ComponentType<StepProps<any>>,
    score: defRescore,
    behavior: { requiresInteraction: true },
  },
};
