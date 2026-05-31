// StepRenderer — Maps ALL 20 step types to their components
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Import step components from the engine: each lives in src/engine/components/steps/
import PromptGenerator from "../steps/PromptGenerator";

import TrueFalseStep from "../../engine/components/steps/TrueFalseStep";
import FillBlankStep from "../../engine/components/steps/FillBlankStep";
import MatchStep from "../../engine/components/steps/MatchStep";
import PromptGeneratorStep from "../../engine/components/steps/PromptGeneratorStep";
import PasteCaptureStep from "../../engine/components/steps/PasteCaptureStep";
import ScenarioCardStep from "../../engine/components/steps/ScenarioCardStep";
import ReflectionStep from "../../engine/components/steps/ReflectionStep";
import CompletionStep from "../../engine/components/steps/CompletionStep";
import BadgeUnlockStep from "../../engine/components/steps/BadgeUnlockStep";
import StreakCommitStep from "../../engine/components/steps/StreakCommitStep";

import InfoStep from "../../engine/components/steps/InfoStep";
import McStep from "../../engine/components/steps/McStep";
import QuizStep from "../../engine/components/steps/QuizStep";
import HighlightStep from "../../engine/components/steps/HighlightStep";
import GoodFitStep from "../../engine/components/steps/GoodFitStep";
import BuilderStep from "../../engine/components/steps/BuilderStep";
import CopyActionStep from "../../engine/components/steps/CopyActionStep";
import CompareStep from "../../engine/components/steps/CompareStep";
import ExampleStep from "../../engine/components/steps/ExampleStep";
import FallbackStep from "../../engine/components/steps/FallbackStep";

// Step type definitions
export type StepType =
  | "info" | "scenario_card" | "example"
  | "mc" | "scenario" | "tf"
  | "highlight" | "fillblank" | "match"
  | "good_fit" | "quiz" | "builder"
  | "copy_action" | "paste_capture" | "compare"
  | "reflection" | "badge_unlock" | "streak_commitment"
  | "reminder_setup" | "completion"
  | "prompt_generator";

export interface StepBase {
  id: string;
  type: StepType;
  xp?: number;
  [key: string]: any;
}

export interface StepRendererProps {
  step: StepBase;
  onNext: () => void;
  onXP: (amount: number) => void;
  /** Optional: pass XP earned so far for completion display */
  xpEarned?: number;
  /** Optional: score percentage for completion display */
  scorePct?: number;
}

/**
 * STEP TYPE MAP — all 20 step types
 * Maps each StepType to its React component.
 */
const STEP_MAP: Record<StepType, React.ComponentType<any>> = {
  // Reading / content display
  info: InfoStep,
  scenario_card: ScenarioCardStep,
  example: ExampleStep,
  highlight: HighlightStep,

  // Interactive quiz
  mc: McStep,
  scenario: ScenarioCardStep,
  tf: TrueFalseStep,
  fillblank: FillBlankStep,
  match: MatchStep,

  // Judgment / confidence
  good_fit: GoodFitStep,
  quiz: QuizStep,

  // Tool / builder
  builder: BuilderStep,
  copy_action: CopyActionStep,
  paste_capture: PasteCaptureStep,

  // Comparison / reflection
  compare: CompareStep,
  reflection: ReflectionStep,

  // Tool / generator
  prompt_generator: PromptGenerator,

  // Gamification / progress
  badge_unlock: BadgeUnlockStep,
  streak_commitment: StreakCommitStep,
  reminder_setup: FallbackStep,

  // Completion
  completion: CompletionStep,
};

/**
 * StepRenderer — renders the correct component for any step type.
 * This is the single source of truth for step type → component mapping.
 */
export default function StepRenderer({ step, onNext, onXP, xpEarned, scorePct }: StepRendererProps) {
  const Component = STEP_MAP[step.type];

  if (!Component) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackIcon}>⚠️</Text>
        <Text style={styles.fallbackTitle}>Unknown Step Type</Text>
        <Text style={styles.fallbackText}>"{step.type}" is not a recognized step type.</Text>
      </View>
    );
  }

  // Pass additional context for completion steps
  const extraProps = step.type === "completion" ? { xpEarned, scorePct } : {};

  return (
    <Component
      step={step}
      onNext={onNext}
      onXP={onXP}
      {...extraProps}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  fallbackIcon: { fontSize: 48 },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D241C",
  },
  fallbackText: {
    fontSize: 15,
    color: "#A09484",
    textAlign: "center",
    lineHeight: 22,
  },
});
