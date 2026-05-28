// ─── Lesson Player Screen — loads lesson from Supabase, drives LessonPlayer ───

import React, { useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LessonPlayer } from "../../src/engine";
import type { Lesson, Step } from "../../src/engine/types";
import { colors } from "../../src/theme/tokens";
import { useAuth } from "../../src/data/useAuth";
import { useLesson, useLessonByUnit, useCompleteLesson } from "../../src/data/queries";

// Local fallbacks when Supabase isn't ready
import aiDay1 from "../../src/content/ai_operator/day1.json";
import aiDay2 from "../../src/content/ai_operator/day2.json";
import duoDay1 from "../../src/content/duo/day1.json";
import duoDay2 from "../../src/content/duo/day2.json";
import duoDay3 from "../../src/content/duo/day3.json";
import duoDay4 from "../../src/content/duo/day4.json";
import duoDay5 from "../../src/content/duo/day5.json";
import duoDay6 from "../../src/content/duo/day6.json";
import duoDay7 from "../../src/content/duo/day7.json";

const DAY_CONTENT: Record<string, any> = {
  "ai-1": aiDay1, "ai-2": aiDay2,
  "duo-1": duoDay1, "duo-2": duoDay2, "duo-3": duoDay3,
  "duo-4": duoDay4, "duo-5": duoDay5, "duo-6": duoDay6,
  "duo-7": duoDay7,
};

const LOCAL_LESSONS: Record<string, Lesson> = {};
for (const [key, json] of Object.entries(DAY_CONTENT)) {
  LOCAL_LESSONS[key] = {
    id: `${key}-local`,
    unitId: `day${key.split("-")[1]}`,
    orderNum: parseInt(key.split("-")[1]),
    title: json.title,
    estMinutes: json.estMinutes,
    steps: json.steps as Step[],
  };
}

export default function LessonScreen() {
  const { id, program } = useLocalSearchParams<{ id: string; program?: string }>();
  const { user } = useAuth();

  // Try Supabase first, fall back to local JSON
  const supabaseQuery = useLesson(id);
  const localKey = program ? `${program}-${id}` : id ?? "1";
  const localLesson = LOCAL_LESSONS[localKey] ?? LOCAL_LESSONS[id ?? "1"];
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
