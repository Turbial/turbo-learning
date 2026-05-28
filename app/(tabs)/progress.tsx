// ─── Progress — XP, streaks, badges (real data from Supabase) ───

import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";
import { useAuth } from "../../src/data/useAuth";
import { useProfile, useBadges, useProgress } from "../../src/data/queries";
import { xpToNextLevel } from "../../src/engine/scoring";

export default function ProgressScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: badges } = useBadges(user?.id);
  const { data: progress } = useProgress(user?.id);

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalXp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;
  const nextLevelXp = xpToNextLevel(totalXp);
  const xpInCurrentLevel = totalXp - (Math.pow(level - 1, 2) * 100);
  const xpNeededForLevel = Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100;
  const xpProgress = Math.min(xpInCurrentLevel / xpNeededForLevel, 1);

  const completedLessons = progress?.filter((p: any) => p.completed_at) ?? [];
  const badgeList = badges?.map((b: any) => b.badges) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Progress</Text>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCircle}>
            <Text style={styles.levelNum}>{level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Level {level} • {levelName(level)}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${Math.max(xpProgress * 100, 2)}%` }]} />
            </View>
            <Text style={styles.xpText}>
              {totalXp} XP • {nextLevelXp} XP to Level {level + 1}
            </Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Current Streak</Text>
          <Text style={styles.streakNum}>{streak} day{streak !== 1 ? "s" : ""}</Text>
          {streak === 0 && (
            <Text style={styles.cardHint}>Complete a lesson to start your streak!</Text>
          )}
        </View>

        {/* Completed Lessons */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Lessons Completed</Text>
          <Text style={styles.statNum}>{completedLessons.length}</Text>
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 Badges ({badgeList.length})</Text>
          {badgeList.length > 0 ? (
            <View style={styles.badgeGrid}>
              {badgeList.map((b: any) => (
                <View key={b.slug} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{b.icon ?? "🏅"}</Text>
                  <Text style={styles.badgeName}>{b.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyText}>Complete Day 1 to earn your first badge!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function levelName(level: number): string {
  const names = ["Beginner", "Learner", "Builder", "Operator", "Master"];
  if (level <= 5) return names[level - 1] ?? "Master";
  return `Master +${level - 5}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
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
  statNum: {
    fontSize: fontSize.hero,
    fontWeight: "800",
    color: colors.primary,
  },
  cardHint: { fontSize: fontSize.sm, color: colors.textMuted },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badgeItem: {
    alignItems: "center",
    backgroundColor: colors.bg,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minWidth: 72,
  },
  badgeIcon: { fontSize: 24, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: "600", color: colors.textSecondary, textAlign: "center" },
  emptyState: { alignItems: "center", padding: spacing.lg },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
