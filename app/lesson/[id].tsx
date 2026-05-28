// ─── Lesson Player Screen — loads lesson from Supabase, drives LessonPlayer ───

import React, { useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LessonPlayer } from "../../src/engine";
import type { Lesson, Step } from "../../src/engine/types";
import { colors } from "../../src/theme/tokens";
import { useAuth } from "../../src/data/useAuth";
import { useLesson, useLessonByUnit, useCompleteLesson } from "../../src/data/queries";

// Local fallback for Day 1 when Supabase isn't ready
import day1Json from "../../src/content/ai_operator/day1.json";

const LOCAL_LESSONS: Record<string, Lesson> = {
  "1": {
    id: "day1-local",
    unitId: "day1",
    orderNum: 1,
    title: day1Json.title,
    estMinutes: day1Json.estMinutes,
    steps: day1Json.steps as Step[],
  },
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // Try Supabase first, fall back to local JSON
  const supabaseQuery = useLesson(id);
  const localLesson = LOCAL_LESSONS[id ?? "1"];
  const completeMutation = useCompleteLesson();

  const lesson: Lesson | undefined = supabaseQuery.data ?? localLesson;
  const isLoading = supabaseQuery.isLoading && !localLesson;

  const handleComplete = useCallback(
    (sessionXp: number, score: number) => {
      if (user && supabaseQuery.data) {
        // Persist to Supabase
        completeMutation.mutate({
          lessonId: supabaseQuery.data.id,
          xpEarned: sessionXp,
          score,
        });
      }

      router.replace({
        pathname: "/complete/[unitId]",
        params: {
          unitId: lesson?.unitId ?? "day1",
          xp: sessionXp,
          score: Math.round(score * 100),
        },
      });
    },
    [user, supabaseQuery.data, lesson, completeMutation],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.missingText}>Lesson not found.</Text>
          <Text style={styles.backLink} onPress={() => router.back()}>
            ← Go back
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LessonPlayer
        steps={lesson.steps}
        lessonId={lesson.id}
        onComplete={handleComplete}
        allowBack
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.textMuted },
  missingText: { fontSize: 18, fontWeight: "700", color: colors.textSecondary, marginBottom: 12 },
  backLink: { fontSize: 16, fontWeight: "600", color: colors.primary },
});
