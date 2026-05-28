// ─── LessonPlayer — generic step-progression driver ───
// Drives progression, accumulates XP, persists state.
// Product-agnostic. Content controls the rhythm; the engine just plays it.

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import type { Step, StepResponse, NarrationController } from "./types";
import { stepRegistry } from "./stepRegistry";
import { lessonReducer, createInitialState, isLastStep, completionScore } from "./lessonMachine";
import { createNarration } from "./narration/useNarration";
import { applyCombo, getComboLabel, getComboMultiplier } from "./scoring";

// ─── Props ───

export interface LessonPlayerProps {
  steps: Step[];
  lessonId: string;
  onComplete?: (sessionXp: number, score: number) => void;
  /** If true, renders a "Back" button to the previous step */
  allowBack?: boolean;
}

// ─── Public state (read by step components) ───

export interface LessonPlayerState {
  stepIndex: number;
  sessionXp: number;
  responses: Record<string, StepResponse>;
  correctCount: number;
  totalGraded: number;
  comboStreak: number;
  comboMultiplier: number;
  comboLabel: string;
  isLast: boolean;
  progress: number; // 0–1
}

// ─── Component ───

export default function LessonPlayer({
  steps,
  lessonId,
  onComplete,
  allowBack = true,
}: LessonPlayerProps) {
  const [session, dispatch] = useReducer(lessonReducer, createInitialState(lessonId));
  const { stepIndex, sessionXp, responses, correctCount, totalGraded, comboStreak } = session;

  // Keep a ref of latest state so auto-advance timeouts never read stale closures
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Guard against double-firing onComplete
  const completedRef = useRef(false);

  // Current step and handler
  const step: Step | undefined = steps[stepIndex];
  const handler = step ? stepRegistry[step.type] : null;

  // Narration controller for the current step
  const narrationRef = useRef<NarrationController | null>(null);
  const currentStepIdRef = useRef<string | null>(null);

  const getNarration = useCallback((): NarrationController => {
    const text = getStepText(step);
    if (!narrationRef.current || currentStepIdRef.current !== step?.id) {
      narrationRef.current?.stop();
      narrationRef.current = createNarration(text);
      currentStepIdRef.current = step?.id ?? null;
    }
    return narrationRef.current;
  }, [step]);

  // Clean up narration on unmount
  useEffect(() => {
    return () => {
      narrationRef.current?.stop();
    };
  }, []);

  // ─── Completion check — useEffect-based instead of inside setTimeout ───
  // This avoids the stale-closure race condition when auto-advancing on the last step.
  // When stepIndex advances past the last step, fire onComplete with sessionRef.current.
  useEffect(() => {
    if (stepIndex >= steps.length && !completedRef.current) {
      completedRef.current = true;
      const snap = sessionRef.current;
      const score = completionScore(snap);
      onComplete?.(snap.sessionXp, score);
    }
  }, [stepIndex, steps.length, onComplete]);

  // Reset completed guard when lesson id changes
  useEffect(() => {
    completedRef.current = false;
  }, [lessonId]);

  // ─── Handlers ───

  const handleContinue = useCallback(() => {
    if (step && isLastStep(stepIndex, steps.length)) {
      // Advance past the last step — the useEffect below catches stepIndex >= steps.length
      // and calls onComplete with sessionRef.current (stable, no stale closure)
      dispatch({ type: "ADVANCE" });
      return;
    }
    dispatch({ type: "ADVANCE" });
  }, [step, stepIndex, steps.length]);

  const handleAnswer = useCallback(
    (res: StepResponse) => {
      if (!step || !handler) return;
      const correct = handler.validate?.(step, res);

      // Calculate base XP
      const baseXp = handler.score?.(step, res) ?? step.xp ?? 10;

      // Compute combo streak: increment on correct, reset on wrong
      const newComboStreak = correct ? comboStreak + 1 : 0;

      // Apply combo multiplier to XP
      const xp = applyCombo(baseXp, newComboStreak);

      dispatch({ type: "ANSWER", stepId: step.id, response: res, xp, correct, comboStreak: newComboStreak });

      // Auto-advance: just dispatch ADVANCE — completion is handled by useEffect
      if (handler.behavior.autoAdvanceMs) {
        setTimeout(() => {
          dispatch({ type: "ADVANCE" });
        }, handler.behavior.autoAdvanceMs);
      }
    },
    [step, handler, comboStreak],
  );

  const handleBack = useCallback(() => {
    dispatch({ type: "BACK" });
  }, []);

  // ─── Derived state ───

  const comboMultiplier = getComboMultiplier(comboStreak);
  const comboLabel = getComboLabel(comboStreak);

  const playerState: LessonPlayerState = useMemo(
    () => ({
      stepIndex,
      sessionXp,
      responses,
      correctCount,
      totalGraded,
      comboStreak,
      comboMultiplier,
      comboLabel,
      isLast: isLastStep(stepIndex, steps.length),
      progress: steps.length > 0 ? stepIndex / steps.length : 0,
    }),
    [stepIndex, sessionXp, responses, correctCount, totalGraded, comboStreak, comboMultiplier, comboLabel, steps.length],
  );

  // ─── Render ───

  if (!step || !handler) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  const StepComponent = handler.component;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.max(playerState.progress * 100, 2)}%` },
          ]}
        />
      </View>

      {/* Step content */}
      <View style={styles.stepArea}>
        <StepComponent
          step={step}
          onAnswer={handleAnswer}
          onContinue={handleContinue}
          narration={getNarration()}
          state={playerState}
        />
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        {allowBack && stepIndex > 0 && (
          <Text style={styles.backBtn} onPress={handleBack}>
            ← Back
          </Text>
        )}
        {/* Show Continue for non-interactive steps OR after user has answered an interactive step */}
        {(!handler.behavior.requiresInteraction || responses[step.id] !== undefined) && (
          <Text style={styles.continueBtn} onPress={handleContinue}>
            {playerState.isLast ? "Complete →" : "Continue →"}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Helpers ───

function getStepText(step?: Step): string {
  if (!step) return "";
  if ("body" in step && step.body) return step.body as string;
  if ("question" in step && step.question) return step.question as string;
  if ("title" in step && step.title) return step.title as string;
  return "";
}

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF8F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#A09484",
    fontFamily: "NunitoSans_400Regular",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0d9cf",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#059669",
  },
  stepArea: {
    flex: 1,
    padding: 20,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e8e2d9",
    backgroundColor: "#FAF8F5",
  },
  backBtn: {
    fontSize: 15,
    color: "#6B5E50",
    fontWeight: "600",
  },
  continueBtn: {
    fontSize: 15,
    color: "#059669",
    fontWeight: "700",
    marginLeft: "auto",
  },
});
