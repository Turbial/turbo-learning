// âââ Home / Journey â redesigned with gradient header, cleaner stats, week cards âââ

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/tokens";
import { Skeleton } from "../../src/components/ui/LoadingSkeleton";
import { useAuth } from "../../src/data/useAuth";
import { useProfile, useUnits, useProgram, useLessonProgressMap, useActiveProgramSlug } from "../../src/data/queries";
import { useStreakAtRisk } from "../../src/data/useStreakAtRisk";
import { LOCAL_UNITS } from "../../src/data/useLocalUnits";
import { useLocalProgressStore } from "../../src/store/localProgressStore";
import { useStreakRiskNotification } from "../../src/hooks/useStreakRiskNotification";

function HomeScreenMobile() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activeSlug } = useActiveProgramSlug();
  const programSlug = activeSlug || "ai-operator";
  const { data: program } = useProgram(programSlug);
  const { data: units, isLoading: unitsLoading } = useUnits(program?.id);
  const { data: completedUnitIds } = useLessonProgressMap(user?.id);
  const localCompletedIds = useLocalProgressStore((s) => s.completedUnitIds);
  const { data: streakRisk } = useStreakAtRisk(user?.id);
  useStreakRiskNotification(user?.id);

  const allCompletedIds = new Set([
    ...(completedUnitIds ?? new Set<string>()),
    ...localCompletedIds,
  ]);

  const fallbackUnits = LOCAL_UNITS[programSlug] ?? LOCAL_UNITS["ai-operator"];
  const displayUnits = units ?? fallbackUnits;
  const completedCount = allCompletedIds.size;

  const handleDayPress = (day: number, unitId: string, status: string) => {
    if (status === "locked") return;
    router.push({ pathname: `/lesson/${unitId}`, params: { program: programSlug, day: String(day) } });
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.skeletonHeader}>
          <Skeleton width={180} height={20} rounded={10} />
          <Skeleton width={120} height={14} rounded={8} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
            {[1,2,3,4].map(i => <View key={i} style={{flex:1}}><Skeleton height={56} rounded={16} /></View>)}
          </View>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton width={140} height={18} rounded={10} />
          <Skeleton height={6} rounded={3} />
          {[1,2,3,4].map(i => <Skeleton key={i} height={120} rounded={20} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Gradient-like header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.programBadge}>{(program?.title ?? programSlug).toUpperCase()}</Text>
              <Text style={styles.greeting}>{program?.title ?? "AI Operator"}</Text>
              <Text style={styles.subtitle}>{program?.subtitle ?? "28 days to build real AI skills"}</Text>
            </View>
            <View style={styles.headerEmoji}>
              <Text style={{ fontSize: 48 }}>ð¤</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>â¡</Text>
              <Text style={styles.statValue}>{profile?.xp ?? 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>ð¥</Text>
              <Text style={styles.statValue}>{profile?.streak ?? 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>â</Text>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#4A8ED4' }]}>{profile?.level ?? 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Streak at-risk */}
        {streakRisk?.isAtRisk && (
          <View style={styles.streakRisk}>
            <Text style={{ fontSize: 20 }}>â ï¸</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakRiskTitle}>
                Your {streakRisk.streakDays}-day streak is at risk!
              </Text>
              <Text style={styles.streakRiskHint}>
                Complete a lesson in the next {streakRisk.expiresInHours}h.
                {streakRisk.shieldCount > 0 ? ` ${streakRisk.shieldCount} shield${streakRisk.shieldCount !== 1 ? "s" : ""} ready.` : ""}
              </Text>
            </View>
          </View>
        )}

        {/* Story Mode banner */}
        <TouchableOpacity
          style={styles.storyBanner}
          onPress={() => router.push("/story")}
          activeOpacity={0.8}
        >
          <Text style={styles.storyBannerIcon}>🎬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.storyBannerTitle}>Story Mode</Text>
            <Text style={styles.storyBannerSub}>Experience Day 1 as an interactive story</Text>
          </View>
          <Text style={styles.storyBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Journey */}
        <View style={styles.journey}>
          <View style={[styles.journeyHeader, { justifyContent: 'center' }]}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <Text style={[styles.journeyProgress, { marginLeft: 12 }]}>{completedCount}/28 days</Text>
          </View>

          {/* Overall progress bar */}
          <View style={styles.overallBar}>
            <View style={[styles.overallFill, { width: `${Math.max((completedCount / 28) * 100, 2)}%` }]} />
          </View>

          {displayUnits.length > 0 ? (
            <WeeksView units={displayUnits as any} completedUnitIds={allCompletedIds} onDayPress={handleDayPress} />
          ) : (
            <Text style={styles.emptyText}>Loading program...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WeeksView({
  units,
  completedUnitIds,
  onDayPress,
}: {
  units: Array<{ id: string; order_num: number; label: string; title: string; program_id: string }>;
  completedUnitIds: Set<string>;
  onDayPress: (day: number, unitId: string, status: string) => void;
}) {
  const weekTitles = ["Foundation", "Automation", "Systems", "Launch"];
  const weekGoals = [
    "Understand AI and build your first workflows",
    "Build automations that run without you",
    "Create multi-tool AI systems",
    "Ship your AI workforce",
  ];
  const weekEmojis = ["ð§±", "âï¸", "ð", "ð"];
  const weekColors = ["#059669", "#0284c7", "#2B6CB0", "#f59e0b"];

  const weeks: Array<{
    weekNum: number; title: string; goal: string; emoji: string; color: string;
    days: Array<{ day: number; unitId: string; title: string; status: "current" | "locked" | "done" }>;
  }> = [];

  for (let w = 0; w < 4; w++) {
    const startDay = w * 7 + 1;
    const endDay = Math.min(startDay + 6, 28);
    const weekUnits = units.filter((u) => u.order_num >= startDay && u.order_num <= endDay);

    weeks.push({
      weekNum: w + 1,
      title: weekTitles[w] ?? `Week ${w + 1}`,
      goal: weekGoals[w] ?? "",
      emoji: weekEmojis[w] ?? "ð",
      color: weekColors[w] ?? "#059669",
      days: weekUnits.map((u) => {
        const isDone = completedUnitIds.has(u.id);
        const prevDayUnit = u.order_num > 1 ? units.find((pu) => pu.order_num === u.order_num - 1) : null;
        const prevDayDone = u.order_num === 1 || (prevDayUnit != null && completedUnitIds.has(prevDayUnit.id));
        const isCurrent = !isDone && prevDayDone;
        return {
          day: u.order_num,
          unitId: u.id,
          title: u.title,
          status: (isDone ? "done" : isCurrent ? "current" : "locked") as "current" | "locked" | "done",
        };
      }),
    });
  }

  return (
    <>
      {weeks.map((week) => {
        const doneCount = week.days.filter(d => d.status === "done").length;
        const weekProgress = week.days.length > 0 ? doneCount / week.days.length : 0;

        return (
          <View key={week.weekNum} style={styles.weekCard}>
            {/* Week header with accent bar */}
            <View style={[styles.weekAccent, { backgroundColor: week.color }]} />
            <View style={styles.weekHeader}>
              <View style={styles.weekHeaderRow}>
                <Text style={styles.weekEmoji}>{week.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.weekLabel}>WEEK {week.weekNum}</Text>
                  <Text style={styles.weekTitle}>{week.title}</Text>
                </View>
                <Text style={[styles.weekCount, { color: week.color }]}>{doneCount}/{week.days.length}</Text>
              </View>
              <Text style={styles.weekGoal}>{week.goal}</Text>
              {/* Mini progress bar */}
              <View style={styles.weekMiniBar}>
                <View style={[styles.weekMiniFill, { width: `${Math.max(weekProgress * 100, 2)}%`, backgroundColor: week.color }]} />
              </View>
            </View>

            <View style={styles.daysList}>
              {week.days.map((d) => {
                const isCurrent = d.status === "current";
                const isDone = d.status === "done";
                const isLocked = d.status === "locked";

                return (
                  <TouchableOpacity
                    key={d.day}
                    style={[
                      styles.dayRow,
                      isCurrent && styles.dayRowCurrent,
                    ]}
                    onPress={() => onDayPress(d.day, d.unitId, d.status)}
                    activeOpacity={isLocked ? 1 : 0.7}
                    disabled={isLocked}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        isDone && [styles.dayCircleDone, { backgroundColor: week.color }],
                        isCurrent && styles.dayCircleCurrent,
                        isLocked && styles.dayCircleLocked,
                      ]}
                    >
                      {isDone ? (
                        <Text style={styles.dayCheck}>â</Text>
                      ) : (
                        <Text style={[styles.dayNum, isCurrent && styles.dayNumCurrent, isLocked && styles.dayNumLocked]}>
                          {d.day}
                        </Text>
                      )}
                    </View>
                    <View style={styles.dayInfo}>
                      <Text style={[styles.dayTitle, isLocked && styles.dayTitleLocked]}>{d.title}</Text>
                      {isCurrent && (
                        <Text style={[styles.currentPill, { color: week.color }]}>Now</Text>
                      )}
                    </View>
                    {isLocked && <Text style={styles.lockIcon}>ð</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </>
  );
}

// âââ Platform switch âââââââââââââââââââââââââââââââââââââââââââ

import { Platform } from "react-native";
import HomeDesktop from "./HomeDesktop";

export default function HomeScreen() {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.innerWidth >= 768) {
    return <HomeDesktop />;
  }
  return <HomeScreenMobile />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#f9fafb' },

  // Header
  header: {
    backgroundColor: '#059669',
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerEmoji: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  programBadge: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: "#fff",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600" as const,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    marginHorizontal: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "800" as const, color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 2, fontWeight: "700" as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },

  // Story Mode banner
  storyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0d0621',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  storyBannerIcon: { fontSize: 28 },
  storyBannerTitle: { fontSize: 14, fontWeight: '800' as const, color: '#e8edf2' },
  storyBannerSub: { fontSize: 11, color: '#8b9bb4', marginTop: 1 },
  storyBannerArrow: { fontSize: 18, color: '#a78bfa', fontWeight: '700' as const },

  // Streak risk
  streakRisk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakRiskTitle: { fontSize: 13, fontWeight: '800' as const, color: '#92400e' },
  streakRiskHint: { fontSize: 12, color: '#a16207', marginTop: 2 },

  // Journey
  journey: { padding: 20, paddingTop: 24 },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800" as const, color: '#1a1a2e' },
  journeyProgress: { fontSize: 14, fontWeight: '700' as const, color: '#059669' },
  overallBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: "center", marginTop: 40 },
  skeletonHeader: {
    backgroundColor: '#059669',
    padding: 24,
    paddingTop: 52,
    gap: 8,
  },

  // Week cards
  weekCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekAccent: {
    height: 4,
  },
  weekHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekEmoji: { fontSize: 24 },
  weekLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 2,
    color: '#9ca3af',
    marginBottom: 2,
  },
  weekTitle: { fontSize: 17, fontWeight: "700" as const, color: '#1a1a2e' },
  weekCount: { fontSize: 15, fontWeight: '800' as const },
  weekGoal: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  weekMiniBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  weekMiniFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Day items
  daysList: { padding: 8 },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  dayRowCurrent: { backgroundColor: '#f9fafb' },
  dayCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: "center", alignItems: "center",
  },
  dayCircleDone: {},
  dayCircleCurrent: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#059669' },
  dayCircleLocked: { backgroundColor: '#f9fafb' },
  dayCheck: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dayNum: { fontSize: 14, fontWeight: "700" as const, color: '#6b7280' },
  dayNumCurrent: { color: '#059669' },
  dayNumLocked: { color: '#d1d5db' },
  dayInfo: { flex: 1 },
  dayTitle: { fontSize: 14, fontWeight: "600" as const, color: '#1a1a2e' },
  dayTitleLocked: { color: '#d1d5db' },
  currentPill: { fontSize: 12, fontWeight: '700' as const, marginTop: 2 },
  lockIcon: { fontSize: 14 },
});
