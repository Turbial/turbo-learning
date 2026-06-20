// ─── LessonPlayer — generic step-progression driver ───
// Drives progression, accumulates XP with combo multiplier, persists state.
// Product-agnostic. Content controls the rhythm; the engine just plays it.

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import type { Step, StepResponse, NarrationController } from "./types";
import { stepRegistry } from "./stepRegistry";
import { lessonReducer, createInitialState, isLastStep, completionScore } from "./lessonMachine";
import { applyCombo, getComboLabel } from "./scoring";
import { createNarration } from "./narration/useNarration";
import { XpBurst } from "../components/feedback/XpBurst";
import { useLessonStateStore } from "../store/lessonStateStore";
import { useAddXp } from "../data/queries";

// ─── Props ───

export interface LessonPlayerProps {
  steps: Step[];
  lessonId: string;
  lessonTitle?: string;
  onComplete?: (sessionXp: number, score: number, correctCount: number, totalGraded: number) => void;
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
  isLast: boolean;
  progress: number; // 0–1
  comboStreak: number;
  lessonTitle?: string;
}

// ─── Component ───

export default function LessonPlayer({
  steps,
  lessonId,
  lessonTitle,
  onComplete,
  allowBack = true,
}: LessonPlayerProps) {
  const savedState = useLessonStateStore((s) => s.current);
  const saveState = useLessonStateStore((s) => s.save);
  const clearSavedState = useLessonStateStore((s) => s.clear);
  const addXp = useAddXp();

  const [session, dispatch] = useReducer(lessonReducer, createInitialState(lessonId));

  // Restore saved progress if same lesson — dispatched after Zustand's
  // AsyncStorage persistence hydrates. Must use dispatch (not initial state)
  // because useReducer only reads init on first render, but Zustand
  // hydration arrives asynchronously.
  const hasRestored = useRef(false);
  useEffect(() => {
    if (hasRestored.current) return;
    const saved = savedState;
    if (saved && saved.lessonId === lessonId && saved.stepIndex > 0) {
      hasRestored.current = true;
      dispatch({
        type: "RESTORE",
        payload: {
          stepIndex: Math.min(saved.stepIndex, steps.length - 1),
          sessionXp: saved.sessionXp,
          responses: saved.responses as Record<string, StepResponse>,
          correctCount: saved.correctCount,
          totalGraded: saved.totalGraded,
          comboStreak: saved.comboStreak,
        },
      });
    }
  }, [lessonId, savedState, steps.length]);
  const { stepIndex, sessionXp, responses, correctCount, totalGraded, comboStreak } = session;
  const [stepError, setStepError] = React.useState<string | null>(null);

  // Track XpBursts for floating "+N XP" animations
  const [xpBursts, setXpBursts] = useState<Array<{ id: number; xp: number; key: number }>>([]);
  const burstIdRef = useRef(0);

  // Keep a ref of latest state so auto-advance timeouts never read stale closures
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Persist mid-lesson state so the user can refresh without losing progress
  useEffect(() => {
    if (stepIndex > 0 || Object.keys(responses).length > 0) {
      saveState({
        lessonId,
        stepIndex,
        sessionXp,
        responses,
        correctCount,
        totalGraded,
        comboStreak,
        savedAt: 0, // filled by store
      });
    }
  }, [lessonId, stepIndex, sessionXp, JSON.stringify(responses), correctCount, totalGraded, comboStreak]);

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
      clearSavedState(); // Lesson done — don't resume here
      const snap = sessionRef.current;
      const score = completionScore(snap);
      // Level-up haptic: fires when the lesson completes (XP earned signals a level-up moment)
      if (Platform.OS !== "web" && snap.sessionXp > 0) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) { /* haptics unavailable on simulator/web */ }
      }
      onComplete?.(snap.sessionXp, score, snap.correctCount, snap.totalGraded);
    }
  }, [stepIndex, steps.length, onComplete, clearSavedState]);

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

      // Don't reward XP for re-answering the same step
      const alreadyAnswered = responses[step.id] !== undefined;

      const correct = handler.validate?.(step, res);

      // Calculate base XP (only for first answer)
      const baseXp = alreadyAnswered ? 0 : (handler.score?.(step, res) ?? step.xp ?? 10);

      // Compute combo streak: increment on correct, reset on wrong
      const newComboStreak = correct ? comboStreak + 1 : 0;

      // Apply combo multiplier to XP
      const xp = applyCombo(baseXp, newComboStreak);

      dispatch({ type: "ANSWER", stepId: step.id, response: res, xp, correct, comboStreak: newComboStreak });

      // Haptic feedback for correct / wrong answers
      if (Platform.OS !== "web") {
        try {
          if (correct === true) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else if (correct === false) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } catch (_) { /* haptics unavailable on simulator/web */ }
      }

      // Spawn XP burst animation when user earns XP (only on first answer)
      if (xp > 0) {
        const bid = ++burstIdRef.current;
        setXpBursts((prev) => [...prev, { id: bid, xp, key: bid }]);
        setTimeout(() => {
          setXpBursts((prev) => prev.filter((b) => b.id !== bid));
        }, 800);
        // Persist XP incrementally so Journey/Progress/Dashboard reflect it immediately
        addXp.mutate({ xp });

        // Light impact alongside the XP burst animation
        if (Platform.OS !== "web") {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (_) { /* haptics unavailable on simulator/web */ }
        }
      }

      // Auto-advance: just dispatch ADVANCE — completion is handled by useEffect
      if (handler.behavior.autoAdvanceMs) {
        setTimeout(() => {
          dispatch({ type: "ADVANCE" });
        }, handler.behavior.autoAdvanceMs);
      }
    },
    [step, handler, comboStreak, addXp, responses],
  );

  const handleBack = useCallback(() => {
    dispatch({ type: "BACK" });
  }, []);

  // ─── Derived state ───

  const playerState: LessonPlayerState = useMemo(
    () => ({
      stepIndex,
      sessionXp,
      responses,
      correctCount,
      totalGraded,
      isLast: isLastStep(stepIndex, steps.length),
      progress: steps.length > 0 ? stepIndex / steps.length : 0,
      comboStreak,
      lessonTitle,
    }),
    [stepIndex, sessionXp, responses, correctCount, totalGraded, steps.length, comboStreak, lessonTitle],
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

      {/* Combo indicator */}
      {comboStreak >= 2 && (
        <View style={styles.comboBar}>
          <Text style={styles.comboText}>
            🔥 {comboStreak}x Combo! {getComboLabel(comboStreak)}
          </Text>
        </View>
      )}

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

      {/* Floating XP bursts */}
      {xpBursts.map((burst) => (
        <View key={burst.key} style={styles.xpBurstContainer}>
          <XpBurst xp={burst.xp} />
        </View>
      ))}

      {/* Navigation — Continue on LEFT, Back on RIGHT */}
      <View style={styles.nav}>
        {(!handler.behavior.requiresInteraction || responses[step.id] !== undefined) && (
          <Text style={styles.continueBtn} onPress={handleContinue}>
            {playerState.isLast ? "Complete →" : "Continue →"}
          </Text>
        )}
        {allowBack && stepIndex > 0 && (
          <Text style={styles.backBtn} onPress={handleBack}>
            ← Back
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
  comboBar: {
    backgroundColor: "#fef3c7",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
    paddingVertical: 6,
    alignItems: "center",
  },
  comboText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  stepArea: {
    flex: 1,
    padding: 20,
  },
  xpBurstContainer: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    zIndex: 100,
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
