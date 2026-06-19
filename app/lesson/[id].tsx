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
import { useIsPremium } from "../../src/data/useSubscription";

const FREE_DAYS = 3;
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
import afeDay1 from "../../src/content/ai_for_everyone/day1.json";
import afeDay2 from "../../src/content/ai_for_everyone/day2.json";
import afeDay3 from "../../src/content/ai_for_everyone/day3.json";
import afeDay4 from "../../src/content/ai_for_everyone/day4.json";
import afeDay5 from "../../src/content/ai_for_everyone/day5.json";
import afeDay6 from "../../src/content/ai_for_everyone/day6.json";
import afeDay7 from "../../src/content/ai_for_everyone/day7.json";
import afeDay8 from "../../src/content/ai_for_everyone/day8.json";
import afeDay9 from "../../src/content/ai_for_everyone/day9.json";
import afeDay10 from "../../src/content/ai_for_everyone/day10.json";
import afeDay11 from "../../src/content/ai_for_everyone/day11.json";
import afeDay12 from "../../src/content/ai_for_everyone/day12.json";
import afeDay13 from "../../src/content/ai_for_everyone/day13.json";
import afeDay14 from "../../src/content/ai_for_everyone/day14.json";
import afeDay15 from "../../src/content/ai_for_everyone/day15.json";
import afeDay16 from "../../src/content/ai_for_everyone/day16.json";
import afeDay17 from "../../src/content/ai_for_everyone/day17.json";
import afeDay18 from "../../src/content/ai_for_everyone/day18.json";
import afeDay19 from "../../src/content/ai_for_everyone/day19.json";
import afeDay20 from "../../src/content/ai_for_everyone/day20.json";
import afeDay21 from "../../src/content/ai_for_everyone/day21.json";
import afeDay22 from "../../src/content/ai_for_everyone/day22.json";
import afeDay23 from "../../src/content/ai_for_everyone/day23.json";
import afeDay24 from "../../src/content/ai_for_everyone/day24.json";
import afeDay25 from "../../src/content/ai_for_everyone/day25.json";
import afeDay26 from "../../src/content/ai_for_everyone/day26.json";
import afeDay27 from "../../src/content/ai_for_everyone/day27.json";
import afeDay28 from "../../src/content/ai_for_everyone/day28.json";
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
  "afe-1": afeDay1, "afe-2": afeDay2, "afe-3": afeDay3,
  "afe-4": afeDay4, "afe-5": afeDay5, "afe-6": afeDay6, "afe-7": afeDay7,
  "afe-8": afeDay8, "afe-9": afeDay9, "afe-10": afeDay10,
  "afe-11": afeDay11, "afe-12": afeDay12, "afe-13": afeDay13, "afe-14": afeDay14,
  "afe-15": afeDay15, "afe-16": afeDay16, "afe-17": afeDay17, "afe-18": afeDay18,
  "afe-19": afeDay19, "afe-20": afeDay20, "afe-21": afeDay21, "afe-22": afeDay22,
  "afe-23": afeDay23, "afe-24": afeDay24, "afe-25": afeDay25, "afe-26": afeDay26,
  "afe-27": afeDay27, "afe-28": afeDay28,
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
    // Support both old schema (json.title) and new schema (json.meta.lessonTitle / unitTitle)
    title: json.title ?? json.meta?.lessonTitle ?? json.meta?.unitTitle ?? key,
    estMinutes: json.estMinutes ?? json.meta?.minutes,
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
  const dayInt = parseInt(dayNum ?? "1", 10);
  const isPremium = useIsPremium(user?.id);

  // Normalize program slug → local content key prefix
  // "ai-operator" | "ai_operator" → "ai"
  // "ai-for-everyone" | "ai_for_everyone" → "afe"
  // "duo" → "duo"
  const normalizedProgram =
    program?.includes("for_everyone") || program?.includes("for-everyone")
      ? "afe"
      : program?.startsWith("ai")
      ? "ai"
      : (program ?? "ai");
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
        day: String(dayInt),
        program: program ?? "ai-operator",
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
    [user, supabaseQuery.data, lesson, completeMutation, id, markLocalCompleted, program, dayInt],
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

  // Paywall: days beyond FREE_DAYS require premium
  if (dayInt > FREE_DAYS && !isPremium) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
          <Text style={[styles.missingText, { marginBottom: 8 }]}>Day {dayInt} is Premium</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
            Upgrade to unlock all 28 days and your full learning journey.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, marginBottom: 12 }}
            onPress={() => router.push("/pricing")}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>See plans →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleHome}>
            <Text style={styles.homeLink}>← Back to Journey</Text>
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
