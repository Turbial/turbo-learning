// ─── Unit Complete Screen — XP tally, streak fire, continue ───

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, spacing, radius, fontSize } from "@/src/theme/tokens";

export default function CompleteScreen() {
  const { unitId, xp, score } = useLocalSearchParams<{
    unitId: string;
    xp: string;
    score: string;
  }>();

  const xpNum = parseInt(xp ?? "0", 10);
  const scoreNum = parseInt(score ?? "100", 10);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Celebration */}
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Day Complete!</Text>
        <Text style={styles.subtitle}>
          {scoreNum >= 80 ? "Great work! You're off to an amazing start." : "Nice job! Every day builds momentum."}
        </Text>

        {/* XP / Score */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>+{xpNum}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{scoreNum}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakLabel}>Streak started!</Text>
            <Text style={styles.streakHint}>Come back tomorrow to keep it going.</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Continue Journey</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.replace("/(tabs)/progress")}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  emoji: { fontSize: 72, marginBottom: spacing.md },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: colors.surfaceBorder },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.warningBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    marginBottom: spacing.xl,
    width: "100%",
    maxWidth: 320,
  },
  streakEmoji: { fontSize: 32 },
  streakLabel: { fontSize: fontSize.md, fontWeight: "700", color: "#92400e" },
  streakHint: { fontSize: fontSize.xs, color: "#a16207", marginTop: 2 },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  btnPrimaryText: { color: "#fff", fontSize: fontSize.md, fontWeight: "700" },
  btnSecondary: {
    paddingVertical: 16,
    borderRadius: radius.lg,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
