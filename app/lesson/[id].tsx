// ─── Lesson Player Screen — loads a lesson and drives the LessonPlayer ───

import React, { useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LessonPlayer } from "@/src/engine";
import type { Lesson, Step } from "@/src/engine/types";
import { colors } from "@/src/theme/tokens";

// For M1–M2, load from local JSON instead of Supabase.
// In M3+, this becomes a TanStack Query fetch from Supabase.
import day1Json from "@/src/content/ai_operator/day1.json";

// Map of available lessons (local JSON → Supabase in M3+)
const LOCAL_LESSONS: Record<string, { unitId: string; lesson: Lesson }> = {
  "1": {
    unitId: "day1",
    lesson: {
      id: "day1",
      unitId: "day1",
      orderNum: 1,
      title: day1Json.title,
      estMinutes: day1Json.estMinutes,
      steps: day1Json.steps as Step[],
    },
  },
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonData = LOCAL_LESSONS[id ?? "1"];

  const handleComplete = useCallback(
    (sessionXp: number, score: number) => {
      const unitId = lessonData?.unitId ?? "day1";
      router.replace({
        pathname: "/complete/[unitId]",
        params: { unitId, xp: sessionXp, score: Math.round(score * 100) },
      });
    },
    [lessonData],
  );

  if (!lessonData) {
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

  const { lesson } = lessonData;

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
  missingText: { fontSize: 18, fontWeight: "700", color: colors.textSecondary, marginBottom: 12 },
  backLink: { fontSize: 16, fontWeight: "600", color: colors.primary },
});
