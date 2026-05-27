// ─── Progress — XP, streaks, badges ───

import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Progress</Text>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCircle}>
            <Text style={styles.levelNum}>1</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Level 1 • Beginner</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: "0%" }]} />
            </View>
            <Text style={styles.xpText}>0 / 100 XP to Level 2</Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Current Streak</Text>
          <Text style={styles.streakNum}>0 days</Text>
          <Text style={styles.cardHint}>Complete a lesson to start your streak!</Text>
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 Badges</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No badges yet. Complete Day 1 to earn your first!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  levelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  levelNum: { fontSize: 28, fontWeight: "800", color: "#fff" },
  levelInfo: { flex: 1 },
  levelLabel: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  xpBar: {
    height: 8,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 4,
    marginBottom: 6,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: colors.xp,
    borderRadius: 4,
  },
  xpText: { fontSize: fontSize.xs, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  streakNum: {
    fontSize: fontSize.hero,
    fontWeight: "800",
    color: colors.streak,
    marginBottom: spacing.sm,
  },
  cardHint: { fontSize: fontSize.sm, color: colors.textMuted },
  emptyState: { alignItems: "center", padding: spacing.lg },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
