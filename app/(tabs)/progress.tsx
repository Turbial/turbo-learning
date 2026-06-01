// ─── Progress — XP, streaks, badges (real data from Supabase) with animated counters ───

import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";
import { Skeleton } from "../../src/components/ui/LoadingSkeleton";
import { useAuth } from "../../src/data/useAuth";
import { useProfile, useBadges, useProgress } from "../../src/data/queries";
import { xpToNextLevel, xpToLevel } from "../../src/engine/scoring";

function useCountUp(target: number, duration = 800, enabled = true): number {
  const [val, setVal] = useState(enabled ? 0 : target);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVal(target);
      return;
    }
    if (target <= 0) {
      setVal(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 30)));
    ref.current = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target && ref.current) {
        clearInterval(ref.current);
      }
    }, 30);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [target, duration, enabled]);

  return val;
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: badges } = useBadges(user?.id);
  const { data: progress } = useProgress(user?.id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!profileLoading) {
      const t = setTimeout(() => setReady(true), 200);
      return () => clearTimeout(t);
    }
  }, [profileLoading]);

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ padding: spacing.lg, gap: 16 }}>
          <Skeleton width={180} height={24} rounded={10} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1,2,3,4].map(i => <View key={i} style={{flex:1}}><Skeleton height={72} rounded={16} /></View>)}
          </View>
          <Skeleton height={88} rounded={20} />
          <Skeleton height={140} rounded={20} />
          <Skeleton height={100} rounded={20} />
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
  const xpProgress = Math.min(xpInCurrentLevel / Math.max(xpNeededForLevel, 1), 1);

  const completedLessons = progress?.filter((p: any) => p.completed_at) ?? [];
  const badgeList = badges?.map((b: any) => b.badges) ?? [];

  // Animated counters
  const animXp = useCountUp(totalXp, 1000, ready);
  const animStreak = useCountUp(streak, 600, ready);
  const animCompleted = useCountUp(completedLessons.length, 600, ready);
  const animBadges = useCountUp(badgeList.length, 400, ready);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Progress</Text>

        {/* Stats overview row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statNum}>{animXp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statNum, { color: colors.streak }]}>{animStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNum}>{animCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏅</Text>
            <Text style={[styles.statNum, { color: colors.badge }]}>{animBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCircle}>
            <Text style={styles.levelNum}>{level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>
              Level {level} • {levelName(level)}
            </Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${Math.max(xpProgress * 100, 2)}%` }]} />
            </View>
            <Text style={styles.xpText}>
              {totalXp.toLocaleString()} XP • {nextLevelXp} XP to Level {level + 1}
            </Text>
          </View>
        </View>

        {/* Streak visualization */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Streak Progress</Text>
          {streak === 0 ? (
            <View style={styles.emptyStreak}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyText}>Complete a lesson to start your streak!</Text>
            </View>
          ) : (
            <View style={styles.streakRow}>
              {Array.from({ length: 7 }, (_, i) => {
                const dayIdx = i + 1;
                const isFilled = dayIdx <= (streak % 7 || 7);
                const isToday = dayIdx === (streak % 7 || 7) && streak > 0;
                return (
                  <View key={i} style={styles.streakDay}>
                    <View
                      style={[
                        styles.streakDot,
                        isFilled && styles.streakDotFilled,
                        isToday && styles.streakDotToday,
                      ]}
                    >
                      <Text style={styles.streakDotEmoji}>
                        {isFilled ? "🔥" : "·"}
                      </Text>
                    </View>
                    <Text style={[styles.streakDayLabel, isToday && styles.streakDayLabelToday]}>
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
          {streak > 0 && (
            <Text style={styles.streakMotivation}>
              {streak < 3
                ? "You're building momentum! Keep it going."
                : streak < 7
                ? "Strong consistency! Almost a full week."
                : streak < 14
                ? "Incredible dedication! Two weeks strong."
                : "Legendary! You're unstoppable. 🔥"}
            </Text>
          )}
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 Badges ({badgeList.length})</Text>
          {badgeList.length > 0 ? (
            <View style={styles.badgeGrid}>
              {badgeList.map((b: any, idx: number) => (
                <View key={b.slug ?? idx} style={styles.badgeItem}>
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

        {/* Leaderboard link */}
        <TouchableOpacity
          style={styles.leaderboardLink}
          onPress={() => router.push("/(tabs)/leaderboard")}
          activeOpacity={0.8}
        >
          <Text style={styles.leaderboardLinkText}>🏆 View Leaderboard</Text>
        </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // Level card
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
  // Card
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
  // Streak visualization
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  streakDay: {
    alignItems: "center",
    flex: 1,
  },
  streakDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  streakDotFilled: {
    backgroundColor: colors.warningBg,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  streakDotToday: {
    backgroundColor: colors.warning,
    transform: [{ scale: 1.15 }],
  },
  streakDotEmoji: {
    fontSize: 16,
    color: colors.warning,
  },
  streakDayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  streakDayLabelToday: {
    color: colors.warning,
    fontWeight: "800",
  },
  streakMotivation: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
  emptyStreak: {
    alignItems: "center",
    padding: spacing.md,
  },
  // Badges
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
  badgeName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.lg,
  },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  leaderboardLink: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  leaderboardLinkText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.primary,
  },
});
