// ─── Lesson Player Screen — loads lesson from Supabase via unit UUID, drives LessonPlayer ───
//
// Route params:
//   id     — unit UUID (preferred) or day number (legacy fallback)
//   program — program slug (needed for local fallback key: "ai-2", "duo-3", etc.)
//   day    — day number for local fallback when UUID lookup fails

import { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, SafeAreaView, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LessonPlayer } from "../../src/engine";
import type { Lesson, Step } from "../../src/engine/types";
import { colors } from "../../src/theme/tokens";
import { useAuth } from "../../src/data/useAuth";
import { useLessonByUnit, useCompleteLesson } from "../../src/data/queries";
import { useLocalProgressStore } from "../../src/store/localProgressStore";
import { useLessonStateStore } from "../../src/store/lessonStateStore";
import ChatWidget from "../../src/components/chat/ChatWidget";
import { trackEvent } from "../../src/integrations/analytics";

// Local fallbacks when Supabase isn't available or lesson not found there
import aiDay1 from "../../src/content/ai_operator/day1.json";
import aiDay2 from "../../src/content/ai_operator/day2.json";
import aiDay3 from "../../src/content/ai_operator/day3.json";
import aiDay4 from "../../src/content/ai_operator/day4.json";
import aiDay5 from "../../src/content/ai_operator/day5.json";
import aiDay6 from "../../src/content/ai_operator/day6.json";
import aiDay7 from "../../src/content/ai_operator/day7.json";
import aiDay8 from "../../src/content/ai_operator/day8.json";
import aiDay9 from "../../src/content/ai_operator/day9.json";
import aiDay10 from "../../src/content/ai_operator/day10.json";
import aiDay11 from "../../src/content/ai_operator/day11.json";
import aiDay12 from "../../src/content/ai_operator/day12.json";
import aiDay13 from "../../src/content/ai_operator/day13.json";
import aiDay14 from "../../src/content/ai_operator/day14.json";
import aiDay15 from "../../src/content/ai_operator/day15.json";
import aiDay16 from "../../src/content/ai_operator/day16.json";
import aiDay17 from "../../src/content/ai_operator/day17.json";
import aiDay18 from "../../src/content/ai_operator/day18.json";
import aiDay19 from "../../src/content/ai_operator/day19.json";
import aiDay20 from "../../src/content/ai_operator/day20.json";
import aiDay21 from "../../src/content/ai_operator/day21.json";
import aiDay22 from "../../src/content/ai_operator/day22.json";
import aiDay23 from "../../src/content/ai_operator/day23.json";
import aiDay24 from "../../src/content/ai_operator/day24.json";
import aiDay25 from "../../src/content/ai_operator/day25.json";
import aiDay26 from "../../src/content/ai_operator/day26.json";
import aiDay27 from "../../src/content/ai_operator/day27.json";
import aiDay28 from "../../src/content/ai_operator/day28.json";
import duoDay1 from "../../src/content/duo/day1.json";
import duoDay2 from "../../src/content/duo/day2.json";
import duoDay3 from "../../src/content/duo/day3.json";
import duoDay4 from "../../src/content/duo/day4.json";
import duoDay5 from "../../src/content/duo/day5.json";
import duoDay6 from "../../src/content/duo/day6.json";
import duoDay7 from "../../src/content/duo/day7.json";

const DAY_CONTENT: Record<string, any> = {
  "ai-1": aiDay1, "ai-2": aiDay2, "ai-3": aiDay3,
  "ai-4": aiDay4, "ai-5": aiDay5, "ai-6": aiDay6, "ai-7": aiDay7,
  "ai-8": aiDay8, "ai-9": aiDay9, "ai-10": aiDay10,
  "ai-11": aiDay11, "ai-12": aiDay12, "ai-13": aiDay13, "ai-14": aiDay14,
  "ai-15": aiDay15, "ai-16": aiDay16, "ai-17": aiDay17, "ai-18": aiDay18,
  "ai-19": aiDay19, "ai-20": aiDay20, "ai-21": aiDay21, "ai-22": aiDay22,
  "ai-23": aiDay23, "ai-24": aiDay24, "ai-25": aiDay25, "ai-26": aiDay26,
  "ai-27": aiDay27, "ai-28": aiDay28,
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
  const { id, program, day } = useLocalSearchParams<{ id: string; program?: string; day?: string }>();
  const { user } = useAuth();
  const markLocalCompleted = useLocalProgressStore((s) => s.markCompleted);
  const clearLessonState = useLessonStateStore((s) => s.clear);

  const handleHome = useCallback(() => {
    clearLessonState();
    router.replace("/(tabs)/home");
  }, [clearLessonState]);

  // Try Supabase by unit UUID first (when id is a UUID), fall back to local JSON
  const supabaseQuery = useLessonByUnit(id);
  const dayNum = day ?? id;
  // Normalize program slug: "ai-operator" → "ai", "ai_for_everyone" → "ai"
  const normalizedProgram = program?.startsWith("ai") ? "ai" : (program ?? "ai");
  const localKey = `${normalizedProgram}-${dayNum}`;
  const localLesson = LOCAL_LESSONS[localKey] ?? LOCAL_LESSONS["ai-1"];
  const completeMutation = useCompleteLesson();

  const lesson: Lesson | undefined = supabaseQuery.data ?? localLesson;
  const isLoading = supabaseQuery.isLoading && !localLesson;

  const lessonStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (lesson) {
      lessonStartRef.current = Date.now();
      trackEvent({
        name: 'lesson_started',
        programSlug: program ?? 'ai-operator',
        unitOrder: parseInt(day ?? '1'),
        lessonId: lesson.id,
      });
    }
  }, [lesson?.id]);

  const handleComplete = useCallback(
    (sessionXp: number, score: number, correct: number, total: number) => {
      const dbLessonId = supabaseQuery.data?.id;
      const baseParams = {
        unitId: lesson?.unitId ?? "day1",
        xp: sessionXp,
        score: Math.round(score * 100),
        correct: String(correct),
        total: String(total),
      };
      trackEvent({
        name: 'lesson_completed',
        programSlug: program ?? 'ai-operator',
        unitOrder: parseInt(day ?? '1'),
        sessionXp,
        score: Math.round(score * 100),
        durationMs: Date.now() - lessonStartRef.current,
      });
      if (user && dbLessonId) {
        completeMutation.mutate(
          { lessonId: dbLessonId, xpEarned: sessionXp, score },
          {
            onSuccess: (result: any) => {
              markLocalCompleted(id);
              router.replace({
                pathname: "/complete/[unitId]",
                params: {
                  ...baseParams,
                  totalXp: String(result?.total_xp ?? 0),
                  newLevel: String(result?.new_level ?? 1),
                  streak: String(result?.streak ?? 1),
                },
              });
            },
            onError: (err) => {
              console.warn("complete_lesson RPC failed:", err);
              markLocalCompleted(id);
              router.replace({ pathname: "/complete/[unitId]", params: baseParams });
            },
          },
        );
      } else {
        markLocalCompleted(id);
        router.replace({ pathname: "/complete/[unitId]", params: baseParams });
      }
    },
    [user, supabaseQuery.data, lesson, completeMutation, id, markLocalCompleted],
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
          <TouchableOpacity onPress={handleHome}>
            <Text style={styles.homeLink}>🏠 Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Chat assistant — only on lesson screen */}
      <ChatWidget />
      {/* Home button */}
      <TouchableOpacity style={styles.homeBtn} onPress={handleHome}>
        <Text style={styles.homeBtnText}>🏠</Text>
      </TouchableOpacity>
      <LessonPlayer
        steps={lesson.steps}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
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
  homeBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  homeBtnText: { fontSize: 22 },
  homeLink: { fontSize: 16, fontWeight: "600", color: colors.primary, marginTop: 12 },
});
