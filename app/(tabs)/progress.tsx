// ─── Progress — XP, streaks, badges with animated counters ───────────────────

import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { appTheme as t } from "../../src/theme/appTheme";
import { Skeleton } from "../../src/components/ui/LoadingSkeleton";
import { useAuth } from "../../src/data/useAuth";
import { useProfile, useBadges, useProgress } from "../../src/data/queries";
import { xpToNextLevel, xpToLevel } from "../../src/engine/scoring";

function useCountUp(target: number, duration = 800, enabled = true): number {
  const [val, setVal] = useState(enabled ? 0 : target);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!enabled) { setVal(target); return; }
    if (target <= 0) { setVal(0); return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 30)));
    ref.current = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target && ref.current) clearInterval(ref.current);
    }, 30);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [target, duration, enabled]);
  return val;
}

function levelName(level: number): string {
  const names = ["Beginner", "Learner", "Builder", "Operator", "Master"];
  if (level <= 5) return names[level - 1] ?? "Master";
  return `Master +${level - 5}`;
}

export default function ProgressScreen() {
  const { user }   = useAuth();
  const router     = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { data: badges }   = useBadges(user?.id);
  const { data: progress } = useProgress(user?.id);
  const [ready, setReady]  = useState(false);

  useEffect(() => {
    if (!isLoading) { const t2 = setTimeout(() => setReady(true), 200); return () => clearTimeout(t2); }
  }, [isLoading]);

  if (isLoading) return (
    <SafeAreaView style={s.safe}>
      <View style={{ padding: t.spacing.lg, gap: 16 }}>
        <Skeleton width={180} height={24} rounded={10} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[1,2,3,4].map(i => <View key={i} style={{flex:1}}><Skeleton height={72} rounded={t.radius.lg} /></View>)}
        </View>
        <Skeleton height={88} rounded={t.radius.lg} />
        <Skeleton height={140} rounded={t.radius.lg} />
        <Skeleton height={100} rounded={t.radius.lg} />
      </View>
    </SafeAreaView>
  );

  const totalXp      = profile?.xp ?? 0;
  const level        = profile?.level ?? 1;
  const streak       = profile?.streak ?? 0;
  const nextLevelXp  = xpToNextLevel(totalXp);
  const xpInLevel    = totalXp - (Math.pow(level - 1, 2) * 100);
  const xpNeeded     = Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100;
  const xpProgress   = Math.min(xpInLevel / Math.max(xpNeeded, 1), 1);
  const completed    = progress?.filter((p: any) => p.completed_at) ?? [];
  const badgeList    = badges?.map((b: any) => b.badges) ?? [];

  const animXp        = useCountUp(totalXp, 1000, ready);
  const animStreak    = useCountUp(streak, 600, ready);
  const animCompleted = useCountUp(completed.length, 600, ready);
  const animBadges    = useCountUp(badgeList.length, 400, ready);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={[s.title, { textAlign: "center" }]}>Your Progress</Text>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { icon: "⚡", val: animXp.toLocaleString(), label: "XP", color: t.colors.accent },
            { icon: "🔥", val: String(animStreak),      label: "Day Streak", color: t.colors.streakText },
            { icon: "✅", val: String(animCompleted),   label: "Completed",  color: t.colors.success },
            { icon: "🏅", val: String(animBadges),      label: "Badges",     color: t.colors.accentLight },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statIcon}>{st.icon}</Text>
              <Text style={[s.statNum, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Level card */}
        <View style={s.levelCard}>
          <View style={s.levelCircle}>
            <Text style={s.levelNum}>{level}</Text>
          </View>
          <View style={s.levelInfo}>
            <Text style={s.levelLabel}>Level {level} · {levelName(level)}</Text>
            <View style={s.xpBar}>
              <View style={[s.xpFill, { width: `${Math.max(xpProgress * 100, 2)}%` as any }]} />
            </View>
            <Text style={s.xpText}>
              {totalXp.toLocaleString()} XP · {nextLevelXp} XP to Level {level + 1}
            </Text>
          </View>
        </View>

        {/* Streak visualization */}
        <View style={s.card}>
          <Text style={[s.cardTitle, { textAlign: "center" }]}>🔥 Streak Progress</Text>
          {streak === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🎯</Text>
              <Text style={s.emptyText}>Complete a lesson to start your streak!</Text>
            </View>
          ) : (
            <View style={s.streakRow}>
              {Array.from({ length: 7 }, (_, i) => {
                const dayIdx  = i + 1;
                const filled  = dayIdx <= (streak % 7 || 7);
                const isToday = dayIdx === (streak % 7 || 7) && streak > 0;
                return (
                  <View key={i} style={s.streakDay}>
                    <View style={[s.streakDot, filled && s.streakDotFilled, isToday && s.streakDotToday]}>
                      <Text style={s.streakDotEmoji}>{filled ? "🔥" : "·"}</Text>
                    </View>
                    <Text style={[s.streakDayLabel, isToday && s.streakDayLabelToday]}>
                      {["M","T","W","T","F","S","S"][i]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
          {streak > 0 && (
            <Text style={s.streakMotivation}>
              {streak < 3 ? "You're building momentum! Keep it going."
               : streak < 7 ? "Strong consistency! Almost a full week."
               : streak < 14 ? "Incredible dedication! Two weeks strong."
               : "Legendary! You're unstoppable. 🔥"}
            </Text>
          )}
        </View>

        {/* Badges */}
        <View style={s.card}>
          <Text style={[s.cardTitle, { textAlign: "center" }]}>🏅 Badges ({badgeList.length})</Text>
          {badgeList.length > 0 ? (
            <View style={[s.badgeGrid, { justifyContent: "center" }]}>
              {badgeList.map((b: any, idx: number) => (
                <View key={b.slug ?? idx} style={s.badgeItem}>
                  <Text style={s.badgeIcon}>{b.icon ?? "🏅"}</Text>
                  <Text style={s.badgeName}>{b.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🎯</Text>
              <Text style={s.emptyText}>Complete Day 1 to earn your first badge!</Text>
            </View>
          )}
        </View>

        {/* Leaderboard link */}
        <TouchableOpacity style={s.leaderboardLink} onPress={() => router.push("/(tabs)/leaderboard")} activeOpacity={0.8}>
          <Text style={s.leaderboardLinkText}>🏆 View Leaderboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: t.colors.screenBg },
  scroll:  { flex: 1 },
  content: { padding: t.spacing.lg, paddingBottom: t.spacing.xxl },
  title:   { fontSize: t.text.display, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, marginBottom: t.spacing.lg },

  statsRow: { flexDirection: "row", gap: t.spacing.sm, marginBottom: t.spacing.md },
  statCard: { flex: 1, backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: t.spacing.md, alignItems: "center", borderWidth: 1, borderColor: t.colors.border },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statNum:  { fontSize: 20, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  statLabel:{ fontSize: 10, fontWeight: t.text.weightSemibold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5, marginTop: 2 },

  levelCard: {
    flexDirection: "row", alignItems: "center", gap: t.spacing.md,
    backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg,
    padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, marginBottom: t.spacing.md,
  },
  levelCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: t.colors.accent, justifyContent: "center", alignItems: "center" },
  levelNum:    { fontSize: 28, fontWeight: t.text.weightExtrabold, color: "#fff" },
  levelInfo:   { flex: 1 },
  levelLabel:  { fontSize: t.text.h2, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: 8 },
  xpBar:       { height: 8, backgroundColor: t.colors.accentTint, borderRadius: 4, marginBottom: 6, overflow: "hidden" },
  xpFill:      { height: "100%", backgroundColor: t.colors.accent, borderRadius: 4 },
  xpText:      { fontSize: t.text.caption, color: t.colors.textMuted },

  card:      { backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, marginBottom: t.spacing.md },
  cardTitle: { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: t.spacing.md },

  streakRow:        { flexDirection: "row", justifyContent: "space-between", marginBottom: t.spacing.sm },
  streakDay:        { alignItems: "center", flex: 1 },
  streakDot:        { width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.border, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  streakDotFilled:  { backgroundColor: t.colors.warningBg, borderWidth: 2, borderColor: t.colors.warning },
  streakDotToday:   { backgroundColor: t.colors.warning, transform: [{ scale: 1.15 }] },
  streakDotEmoji:   { fontSize: 16, color: t.colors.warning },
  streakDayLabel:      { fontSize: 11, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  streakDayLabelToday: { color: t.colors.warning, fontWeight: t.text.weightExtrabold },
  streakMotivation:    { fontSize: t.text.bodyMd, color: t.colors.textMuted, textAlign: "center", fontStyle: "italic" },

  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeItem: { alignItems: "center", backgroundColor: t.colors.accentTint, padding: t.spacing.sm + 4, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, minWidth: 72 },
  badgeIcon: { fontSize: 24, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: t.text.weightSemibold, color: t.colors.textBody, textAlign: "center" },

  emptyState: { alignItems: "center", padding: t.spacing.lg },
  emptyEmoji: { fontSize: 40, marginBottom: t.spacing.sm },
  emptyText:  { fontSize: t.text.bodyMd, color: t.colors.textMuted, textAlign: "center", lineHeight: 20 },

  leaderboardLink:     { backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: t.spacing.md + 4, borderWidth: 1, borderColor: t.colors.border, alignItems: "center", marginTop: t.spacing.sm },
  leaderboardLinkText: { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.accent },
});
