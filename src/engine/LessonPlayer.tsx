// ─── LessonPlayer — generic step-progression driver ───
// Drives progression, accumulates XP, persists state.
// Product-agnostic. Content controls the rhythm; the engine just plays it.

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import type { Step, StepResponse, NarrationController } from "./types";
import { stepRegistry } from "./stepRegistry";
import { lessonReducer, createInitialState, isLastStep, completionScore } from "./lessonMachine";
import { createNarration } from "./narration/useNarration";
import { applyCombo, getComboLabel, getComboMultiplier } from "./scoring";
import { XpBurst } from "../components/feedback/XpBurst";

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
  const [stepError, setStepError] = React.useState<string | null>(null);

  // Keep a ref of latest state so auto-advance timeouts never read stale closures
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Guard against double-firing onComplete
  const completedRef = useRef(false);

  // XP burst animation state
  const [xpBursts, setXpBursts] = useState<{ id: number; xp: number }[]>([]);
  const xpBurstIdRef = useRef(0);

  const spawnXpBurst = useCallback((xp: number) => {
    if (xp <= 0) return;
    const id = xpBurstIdRef.current++;
    setXpBursts((prev) => [...prev, { id, xp }]);
  }, []);

  const removeXpBurst = useCallback((id: number) => {
    setXpBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

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

      // Spawn XP burst animation when user earns XP
      if (xp > 0) {
        spawnXpBurst(xp);
      }

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
        {stepError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
            <Text style={styles.errorDetail}>{stepError}</Text>
            <TouchableOpacity style={styles.errorSkipBtn} onPress={() => { setStepError(null); dispatch({ type: "ADVANCE" }); }}>
              <Text style={styles.errorSkipText}>Skip this step →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <StepErrorBoundary stepId={step.id} onError={(msg) => setStepError(msg)}>
            <StepComponent
              step={step}
              onAnswer={handleAnswer}
              onContinue={handleContinue}
              narration={getNarration()}
              state={playerState}
            />
          </StepErrorBoundary>
        )}
      </View>

      {/* XP burst overlay */}
      <View style={styles.xpBurstLayer} pointerEvents="none">
        {xpBursts.map((burst) => (
          <View key={burst.id} style={styles.xpBurstItem}>
            <XpBurst xp={burst.xp} onDone={() => removeXpBurst(burst.id)} />
          </View>
        ))}
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
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#059669",
    borderRadius: 2,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "#A09484",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  errorSkipBtn: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  errorSkipText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  xpBurstLayer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  xpBurstItem: {
    position: "absolute",
  },
});

// ─── StepErrorBoundary — catches render errors in individual steps ───

class StepErrorBoundary extends React.Component<{
  stepId: string;
  onError: (msg: string) => void;
  children: React.ReactNode;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }

  render() {
    return this.props.children;
  }
}
