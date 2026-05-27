// ─── Home / Journey — the learning path map ───

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";

// Mock data — will be fetched from Supabase via TanStack Query
const weeks = [
  {
    week: 1,
    title: "Foundation",
    goal: "Understand AI and build your first workflows",
    days: [
      { day: 1, title: "What AI Actually Is", status: "current" as const },
      { day: 2, title: "The Tool Landscape", status: "locked" as const },
      { day: 3, title: "Your First AI Workflow", status: "locked" as const },
      { day: 4, title: "Prompt Engineering 101", status: "locked" as const },
      { day: 5, title: "AI for Writing & Content", status: "locked" as const },
      { day: 6, title: "AI for Research", status: "locked" as const },
      { day: 7, title: "Week 1 Checkpoint", status: "locked" as const },
    ],
  },
  {
    week: 2,
    title: "Automation",
    goal: "Build workflows that run without you",
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 8,
      title: `Day ${i + 8}`,
      status: "locked" as const,
    })),
  },
  {
    week: 3,
    title: "Systems",
    goal: "Create multi-tool AI systems",
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 15,
      title: `Day ${i + 15}`,
      status: "locked" as const,
    })),
  },
  {
    week: 4,
    title: "Launch",
    goal: "Ship your AI workforce",
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 22,
      title: `Day ${i + 22}`,
      status: "locked" as const,
    })),
  },
];

export default function HomeScreen() {
  const handleDayPress = (day: number, status: string) => {
    if (status === "locked") return;
    router.push(`/lesson/${day}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>AI Operator</Text>
            <Text style={styles.subtitle}>28-Day Program</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Day</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>🔥</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Journey Map */}
        <View style={styles.journey}>
          <Text style={styles.sectionTitle}>Your Journey</Text>

          {weeks.map((week) => (
            <View key={week.week} style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <View>
                  <Text style={styles.weekLabel}>WEEK {week.week}</Text>
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
                      onPress={() => handleDayPress(d.day, d.status)}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
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
