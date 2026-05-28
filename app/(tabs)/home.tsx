// ─── Home / Journey — uses real data from Supabase ───

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";
import { useAuth } from "../../src/data/useAuth";
import { useProfile, useUnits, useProgram, useLessonProgressMap, useActiveProgramSlug } from "../../src/data/queries";

export default function HomeScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activeSlug } = useActiveProgramSlug();
  const programSlug = activeSlug || "ai-operator";
  const { data: program } = useProgram(programSlug);
  const { data: units, isLoading: unitsLoading } = useUnits(program?.id);
  const { data: completedUnitIds } = useLessonProgressMap(user?.id);

  const handleDayPress = (day: number, unitId: string, status: string) => {
    if (status === "locked") return;
    router.push({ pathname: `/lesson/${day}`, params: { program: programSlug } });
  };

  if (profileLoading || unitsLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{program?.title ?? "AI Operator"}</Text>
            <Text style={styles.subtitle}>28-Day Program</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.level ?? 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.xp ?? 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.streak ?? 0}🔥</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Journey Map */}
        <View style={styles.journey}>
          <Text style={styles.sectionTitle}>Your Journey</Text>

          {units ? (
            <WeeksView units={units} completedUnitIds={completedUnitIds ?? new Set()} onDayPress={handleDayPress} />
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
  // Group units into weeks (7 days each)
  const weeks: Array<{
    weekNum: number;
    title: string;
    goal: string;
    days: Array<{
      day: number;
      unitId: string;
      title: string;
      status: "current" | "locked" | "done";
    }>;
  }> = [];

  const weekTitles = ["Foundation", "Automation", "Systems", "Launch"];
  const weekGoals = [
    "Understand AI and build your first workflows",
    "Build automations that run without you",
    "Create multi-tool AI systems",
    "Ship your AI workforce",
  ];

  for (let w = 0; w < 4; w++) {
    const startDay = w * 7 + 1;
    const endDay = Math.min(startDay + 6, 28);
    const weekUnits = units.filter(
      (u) => u.order_num >= startDay && u.order_num <= endDay
    );

    // Real progress: completed units → next is current, rest locked
    weeks.push({
      weekNum: w + 1,
      title: weekTitles[w] ?? `Week ${w + 1}`,
      goal: weekGoals[w] ?? "",
      days: weekUnits.map((u, idx) => {
        const isDone = completedUnitIds.has(u.id);
        // The first non-completed unit is "current"
        const prevAllDone = weekUnits.slice(0, idx).every((pu) => completedUnitIds.has(pu.id));
        const isCurrent = !isDone && prevAllDone;
        const isLocked = !isDone && !isCurrent;
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
      {weeks.map((week) => (
        <View key={week.weekNum} style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.weekLabel}>WEEK {week.weekNum}</Text>
              <Text style={styles.weekTitle}>{week.title}</Text>
            </View>
            <Text style={styles.weekGoal}>{week.goal}</Text>
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
                    isLocked && styles.dayRowLocked,
                  ]}
                  onPress={() => onDayPress(d.day, d.unitId, d.status)}
                  activeOpacity={isLocked ? 1 : 0.7}
                  disabled={isLocked}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isDone && styles.dayCircleDone,
                      isCurrent && styles.dayCircleCurrent,
                      isLocked && styles.dayCircleLocked,
                    ]}
                  >
                    {isDone ? (
                      <Text style={styles.dayCheck}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.dayNum,
                          isCurrent && styles.dayNumCurrent,
                          isLocked && styles.dayNumLocked,
                        ]}
                      >
                        {d.day}
                      </Text>
                    )}
                  </View>
                  <View style={styles.dayInfo}>
                    <Text
                      style={[
                        styles.dayTitle,
                        isLocked && styles.dayTitleLocked,
                      ]}
                    >
                      {d.title}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>▶ Continue</Text>
                      </View>
                    )}
                  </View>
                  {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: "#a7f3d0",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: "space-around",
  },
  stat: { alignItems: "center", flex: 1 },
  statValue: { fontSize: fontSize.xl, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: fontSize.xs, color: "#a7f3d0", marginTop: 2, fontWeight: "600" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  journey: { padding: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: "center", marginTop: 40 },
  weekCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  weekHeader: {
    padding: spacing.md,
    backgroundColor: colors.surfaceHover,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  weekLabel: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 2,
  },
  weekTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  weekGoal: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  daysList: { padding: spacing.sm },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.md,
    gap: 12,
  },
  dayRowCurrent: { backgroundColor: colors.primaryDim },
  dayRowLocked: { opacity: 0.5 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleDone: { backgroundColor: colors.success },
  dayCircleCurrent: { backgroundColor: colors.primary },
  dayCircleLocked: { backgroundColor: colors.surfaceBorder },
  dayCheck: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dayNum: { fontSize: 14, fontWeight: "700", color: colors.textMuted },
  dayNumCurrent: { color: "#fff" },
  dayNumLocked: { color: colors.textDim },
  dayInfo: { flex: 1 },
  dayTitle: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textPrimary },
  dayTitleLocked: { color: colors.textDim },
  currentBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  currentBadgeText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  lockIcon: { fontSize: 14, marginLeft: 4 },
});
