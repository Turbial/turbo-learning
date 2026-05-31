// ─── Unit Complete Screen — XP tally, streak fire, level-up celebration, badge reveal ───

import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";
import { useProfile, useBadges } from "../../src/data/queries";
import { CompletionCelebration } from "../../src/components/feedback/CompletionCelebration";
import { LevelUpModal } from "../../src/components/feedback/LevelUpModal";
import { BadgeReveal } from "../../src/components/feedback/BadgeReveal";
import { xpToLevel } from "../../src/engine/scoring";

const BADGE_INFO: Record<string, { name: string; icon: string }> = {
  first_day: { name: "First Steps", icon: "👣" },
  week_streak: { name: "7-Day Streak", icon: "🔥" },
  two_week_streak: { name: "14-Day Streak", icon: "💪" },
  month_streak: { name: "30-Day Streak", icon: "👑" },
};

export default function CompleteScreen() {
  const { xp, score, totalXp, newLevel, streak: streakParam } = useLocalSearchParams<{
    xp: string;
    score: string;
    totalXp?: string;
    newLevel?: string;
    streak?: string;
  }>();
  const { data: profile, isLoading } = useProfile();
  const { data: badges } = useBadges(profile?.id);

  const xpNum = parseInt(xp ?? "0", 10);
  const scoreNum = parseInt(score ?? "100", 10);
  const streakDays = profile?.streak ?? parseInt(streakParam ?? "1", 10);

  // Level-up detection: compare previous level from profile (before update) vs new
  const prevLevel = profile ? xpToLevel((profile.xp ?? 0) - xpNum) : parseInt(newLevel ?? "1", 10) - 1;
  const currentLevel = parseInt(newLevel ?? String(profile?.level ?? 1), 10);
  const didLevelUp = currentLevel > prevLevel;

  // Badge reveal: show the most recent badge that hasn't been seen
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [badgeQueue, setBadgeQueue] = useState<Array<{ slug: string; name: string; icon: string }>>([]);
  const [activeBadge, setActiveBadge] = useState<{ slug: string; name: string; icon: string } | null>(null);
  const [seenSlugs, setSeenSlugs] = useState<Set<string>>(new Set());

  // Detect new badges when badge data loads
  useEffect(() => {
    if (!badges || badges.length === 0) return;
    const newBadges: Array<{ slug: string; name: string; icon: string }> = [];
    for (const b of badges) {
      const badgeRow = b as any;
      const slug = badgeRow.badges?.slug;
      if (slug && BADGE_INFO[slug] && !seenSlugs.has(slug)) {
        newBadges.push({ slug, ...BADGE_INFO[slug] });
      }
    }
    if (newBadges.length > 0) {
      setBadgeQueue((prev) => [...prev, ...newBadges]);
    }
  }, [badges, seenSlugs]);

  // Trigger level-up modal after a short delay
  useEffect(() => {
    if (didLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(true), 600);
      return () => clearTimeout(timer);
    }
  }, [didLevelUp]);

  // Show first badge in queue
  useEffect(() => {
    if (badgeQueue.length > 0 && !activeBadge) {
      const timer = setTimeout(() => {
        setActiveBadge(badgeQueue[0]);
      }, didLevelUp ? 2000 : 800);
      return () => clearTimeout(timer);
    }
  }, [badgeQueue, activeBadge, didLevelUp]);

  const handleLevelUpClose = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  const handleBadgeClose = useCallback(() => {
    if (activeBadge) {
      setSeenSlugs((prev) => new Set(prev).add(activeBadge.slug));
    }
    setActiveBadge(null);
    setBadgeQueue((prev) => prev.slice(1));
  }, [activeBadge]);

  const levelNames = ["Beginner", "Learner", "Builder", "Operator", "Master"];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Animated XP counter + streak */}
        <CompletionCelebration xpEarned={xpNum} streak={streakDays} />

        {/* Score ring */}
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{scoreNum}% Score</Text>
        </View>

        {/* Streak card with dynamic message */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text style={styles.streakLabel}>
                  {streakDays === 1 ? "Streak started!" : `${streakDays}-day streak!`}
                </Text>
                <Text style={styles.streakHint}>
                  {streakDays < 3
                    ? "Come back tomorrow to keep it going."
                    : streakDays < 7
                    ? "You're building real momentum. Keep it up!"
                    : "You're on fire. This is becoming a habit."}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Total XP from DB */}
        {totalXp && (
          <Text style={styles.totalXpText}>
            {parseInt(totalXp, 10).toLocaleString()} total XP
            {currentLevel > 1 ? ` · Level ${currentLevel} ${levelNames[Math.min(currentLevel - 1, 4)] ?? "Master"}` : ""}
          </Text>
        )}

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

      {/* Level-up modal */}
      <LevelUpModal
        visible={showLevelUp}
        level={currentLevel}
        levelName={levelNames[Math.min(currentLevel - 1, 4)] ?? `Master +${currentLevel - 5}`}
        onClose={handleLevelUpClose}
      />

      {/* Badge reveal — shows one at a time from queue */}
      {activeBadge && (
        <BadgeReveal
          visible={!!activeBadge}
          name={activeBadge.name}
          icon={activeBadge.icon}
          onClose={handleBadgeClose}
        />
      )}
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
  scorePill: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  scoreText: { fontSize: fontSize.md, fontWeight: "700", color: colors.primary },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.warningBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    marginBottom: spacing.md,
    width: "100%",
    maxWidth: 320,
  },
  streakEmoji: { fontSize: 32 },
  streakLabel: { fontSize: fontSize.md, fontWeight: "700", color: "#92400e" },
  streakHint: { fontSize: fontSize.xs, color: "#a16207", marginTop: 2 },
  totalXpText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: spacing.xl,
  },
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
