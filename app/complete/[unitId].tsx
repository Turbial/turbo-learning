// ─── Unit Complete Screen ─────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { appTheme as t } from "../../src/theme/appTheme";
import { useProfile, useBadges } from "../../src/data/queries";
import { CompletionCelebration } from "../../src/components/feedback/CompletionCelebration";
import { LevelUpModal } from "../../src/components/feedback/LevelUpModal";
import { BadgeReveal } from "../../src/components/feedback/BadgeReveal";
import { KnowledgeMeter } from "../../src/components/gamification/KnowledgeMeter";
import { xpToLevel } from "../../src/engine/scoring";

const BADGE_INFO: Record<string, { name: string; icon: string }> = {
  first_day:       { name: "First Steps",    icon: "👣" },
  week_streak:     { name: "7-Day Streak",   icon: "🔥" },
  two_week_streak: { name: "14-Day Streak",  icon: "💪" },
  month_streak:    { name: "30-Day Streak",  icon: "👑" },
};

const levelNames = ["Beginner", "Learner", "Builder", "Operator", "Master"];

export default function CompleteScreen() {
  const { xp, score, totalXp, newLevel, streak: streakParam, correct: correctParam, total: totalParam } =
    useLocalSearchParams<{ xp: string; score: string; totalXp?: string; newLevel?: string; streak?: string; correct?: string; total?: string }>();

  const { data: profile, isLoading } = useProfile();
  const { data: badges }             = useBadges(profile?.id);

  const xpNum        = parseInt(xp ?? "0", 10);
  const scoreNum     = parseInt(score ?? "100", 10);
  const streakDays   = profile?.streak ?? parseInt(streakParam ?? "1", 10);
  const correctCount = parseInt(correctParam ?? "0", 10);
  const totalGraded  = parseInt(totalParam ?? "0", 10);

  const prevLevel    = profile ? xpToLevel((profile.xp ?? 0) - xpNum) : parseInt(newLevel ?? "1", 10) - 1;
  const currentLevel = parseInt(newLevel ?? String(profile?.level ?? 1), 10);
  const didLevelUp   = currentLevel > prevLevel;

  const [phase, setPhase]         = useState<"xp" | "meter" | "actions">("xp");
  const [showLevelUp, setShowLevelUp]   = useState(false);
  const [badgeQueue, setBadgeQueue]     = useState<Array<{ slug: string; name: string; icon: string }>>([]);
  const [activeBadge, setActiveBadge]   = useState<{ slug: string; name: string; icon: string } | null>(null);
  const [seenSlugs, setSeenSlugs]       = useState<Set<string>>(new Set());

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("meter"),   1400);
    const t2 = setTimeout(() => setPhase("actions"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!badges || badges.length === 0) return;
    const newBadges: Array<{ slug: string; name: string; icon: string }> = [];
    for (const b of badges) {
      const slug = (b as any).badges?.slug;
      if (slug && BADGE_INFO[slug] && !seenSlugs.has(slug)) newBadges.push({ slug, ...BADGE_INFO[slug]! });
    }
    if (newBadges.length > 0) setBadgeQueue((prev) => [...prev, ...newBadges]);
  }, [badges, seenSlugs]);

  useEffect(() => {
    if (didLevelUp) { const timer = setTimeout(() => setShowLevelUp(true), 3200); return () => clearTimeout(timer); }
  }, [didLevelUp]);

  useEffect(() => {
    if (badgeQueue.length > 0 && !activeBadge) {
      const delay = didLevelUp ? 5000 : 3500;
      const timer = setTimeout(() => setActiveBadge(badgeQueue[0]!), delay);
      return () => clearTimeout(timer);
    }
  }, [badgeQueue, activeBadge, didLevelUp]);

  const handleLevelUpClose = useCallback(() => setShowLevelUp(false), []);
  const handleBadgeClose   = useCallback(() => {
    if (activeBadge) setSeenSlugs((prev) => new Set(prev).add(activeBadge.slug));
    setActiveBadge(null);
    setBadgeQueue((prev) => prev.slice(1));
  }, [activeBadge]);

  const levelName = levelNames[Math.min(currentLevel - 1, 4)] ?? `Master +${currentLevel - 5}`;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <CompletionCelebration xpEarned={xpNum} streak={streakDays} />

        <View style={[s.scorePill, phase === "meter" && s.scorePillVisible]}>
          <Text style={s.scoreText}>{scoreNum}% Score</Text>
        </View>

        {totalGraded > 0 && (
          <View style={[s.meterWrapper, phase !== "xp" && s.meterVisible]}>
            <KnowledgeMeter correct={correctCount} total={totalGraded} animated />
          </View>
        )}

        {/* Streak card */}
        <View style={s.streakCard}>
          <Text style={s.streakEmoji}>🔥</Text>
          <View>
            {isLoading ? (
              <ActivityIndicator size="small" color={t.colors.accent} />
            ) : (
              <>
                <Text style={s.streakLabel}>
                  {streakDays === 1 ? "Streak started!" : `${streakDays}-day streak!`}
                </Text>
                <Text style={s.streakHint}>
                  {streakDays < 3  ? "Come back tomorrow to keep it going."
                  : streakDays < 7 ? "You're building real momentum. Keep it up!"
                  : "You're on fire. This is becoming a habit."}
                </Text>
              </>
            )}
          </View>
        </View>

        <Text style={s.totalXpText}>
          {totalXp ? parseInt(totalXp, 10).toLocaleString() : "0"} total XP
          {currentLevel > 1 ? ` · Level ${currentLevel} ${levelName}` : ""}
        </Text>

        <View style={[s.actionsRow, phase === "actions" && s.actionsVisible]}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => router.replace("/(tabs)/home")} activeOpacity={0.8}>
            <Text style={s.btnPrimaryText}>Continue Journey</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => router.replace("/(tabs)/progress")} activeOpacity={0.8}>
            <Text style={s.btnSecondaryText}>View Progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LevelUpModal visible={showLevelUp} level={currentLevel} levelName={levelName} onClose={handleLevelUpClose} />
      {activeBadge && <BadgeReveal visible={!!activeBadge} name={activeBadge.name} icon={activeBadge.icon} onClose={handleBadgeClose} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: t.colors.screenBg },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: t.spacing.lg },

  scorePill:        { backgroundColor: t.colors.cardBg, borderRadius: t.radius.pill, paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, marginBottom: t.spacing.md, opacity: 0.7 },
  scorePillVisible: { opacity: 1 },
  scoreText:        { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.accent },

  meterWrapper: { marginBottom: t.spacing.md, opacity: 0, transform: [{ scale: 0.9 }] },
  meterVisible: { opacity: 1, transform: [{ scale: 1 }] },

  streakCard:  { flexDirection: "row", alignItems: "center", gap: t.spacing.md, backgroundColor: t.colors.warningBg, borderRadius: t.radius.lg, padding: t.spacing.md, borderWidth: 1, borderColor: t.colors.warningBorder, marginBottom: t.spacing.md, width: "100%", maxWidth: 320 },
  streakEmoji: { fontSize: 32 },
  streakLabel: { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.warningText },
  streakHint:  { fontSize: t.text.caption, color: t.colors.warning, marginTop: 2 },

  totalXpText: { fontSize: t.text.bodyMd, color: t.colors.textMuted, fontWeight: t.text.weightSemibold, marginBottom: t.spacing.xl },

  actionsRow:    { width: "100%", maxWidth: 320, alignItems: "center", opacity: 0, transform: [{ translateY: 10 }] },
  actionsVisible:{ opacity: 1, transform: [{ translateY: 0 }] },

  btnPrimary:     { backgroundColor: t.colors.accent, paddingVertical: 16, borderRadius: t.radius.lg, width: "100%", alignItems: "center", marginBottom: t.spacing.sm },
  btnPrimaryText: { color: "#fff", fontSize: t.text.body, fontWeight: t.text.weightBold },
  btnSecondary:   { paddingVertical: 16, borderRadius: t.radius.lg, width: "100%", alignItems: "center" },
  btnSecondaryText:{ color: t.colors.accent, fontSize: t.text.body, fontWeight: t.text.weightSemibold },
});
