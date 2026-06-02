// ─── Progress tab ─────────────────────────────────────────────────────────────

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
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 30)));
    ref.current = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target && ref.current) clearInterval(ref.current);
    }, 30);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [target, duration, enabled]);
  return val;
}

function levelName(level: number): string {
  const names = ["Beginner", "Learner", "Builder", "Operator", "Master"];
  return level <= 5 ? (names[level - 1] ?? "Master") : `Master +${level - 5}`;
}

export default function ProgressScreen() {
  const { user }   = useAuth();
  const router     = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { data: badges }   = useBadges(user?.id);
  const { data: progress } = useProgress(user?.id);
  const [ready, setReady]  = useState(false);

  useEffect(() => {
    if (!isLoading) { const id = setTimeout(() => setReady(true), 200); return () => clearTimeout(id); }
  }, [isLoading]);

  if (isLoading) return (
    <SafeAreaView style={s.safe}>
      <View style={{ padding: t.spacing.lg, gap: 14 }}>
        <Skeleton height={160} rounded={t.radius.xxl} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[1,2,3].map(i => <View key={i} style={{flex:1}}><Skeleton height={80} rounded={t.radius.lg} /></View>)}
        </View>
        <Skeleton height={130} rounded={t.radius.xl} />
        <Skeleton height={110} rounded={t.radius.xl} />
      </View>
    </SafeAreaView>
  );

  const xp        = profile?.xp ?? 0;
  const level     = profile?.level ?? 1;
  const streak    = profile?.streak ?? 0;
  const nextXp    = xpToNextLevel(xp);
  const xpInLv    = xp - (Math.pow(level - 1, 2) * 100);
  const xpNeeded  = Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100;
  const xpPct     = Math.min(xpInLv / Math.max(xpNeeded, 1), 1);
  const completed = progress?.filter((p: any) => p.completed_at) ?? [];
  const badgeList = badges?.map((b: any) => b.badges) ?? [];

  const animXp    = useCountUp(xp,             1000, ready);
  const animStr   = useCountUp(streak,          600, ready);
  const animComp  = useCountUp(completed.length, 600, ready);
  const animBadge = useCountUp(badgeList.length, 400, ready);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero card: level + XP ── */}
        <View style={s.hero}>
          <View style={[s.ring, s.rA]} /><View style={[s.ring, s.rB]} />
          <View style={[s.ring, s.rC]} /><View style={[s.ring, s.rD]} />

          {/* Left: level circle + xp bar */}
          <View style={s.heroLeft}>
            <View style={s.lvCircle}>
              <Text style={s.lvNum}>{level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.lvLabel}>Level {level} · {levelName(level)}</Text>
              <View style={s.xpBar}>
                <View style={[s.xpFill, { width: `${Math.max(xpPct * 100, 2)}%` as any }]} />
              </View>
              <Text style={s.xpHint}>{nextXp} XP to Level {level + 1}</Text>
            </View>
          </View>

          {/* Right: XP + streak */}
          <View style={s.heroRight}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>⚡ {animXp.toLocaleString()}</Text>
              <Text style={s.heroStatLbl}>Total XP</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>🔥 {animStr}</Text>
              <Text style={s.heroStatLbl}>Streak</Text>
            </View>
          </View>
        </View>

        {/* ── Stat chips row ── */}
        <View style={s.statsRow}>
          {[
            { icon: "✅", val: String(animComp),  label: "Completed", color: t.colors.success },
            { icon: "🏅", val: String(animBadge), label: "Badges",    color: t.colors.accentLight },
            { icon: "📅", val: "28",              label: "Day Program",color: t.colors.accent },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statIcon}>{st.icon}</Text>
              <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Streak week view ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🔥 This Week's Streak</Text>
          {streak === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🎯</Text>
              <Text style={s.emptyTxt}>Complete a lesson to start your streak!</Text>
            </View>
          ) : (
            <>
              <View style={s.streakRow}>
                {["M","T","W","T","F","S","S"].map((day, i) => {
                  const filled  = (i + 1) <= (streak % 7 || 7);
                  const isToday = (i + 1) === (streak % 7 || 7) && streak > 0;
                  return (
                    <View key={i} style={s.streakDay}>
                      <View style={[s.streakDot, filled && s.streakDotFilled, isToday && s.streakDotToday]}>
                        <Text style={[s.streakDotTxt, filled && s.streakDotTxtFilled]}>{filled ? "🔥" : "·"}</Text>
                      </View>
                      <Text style={[s.streakDayLbl, isToday && s.streakDayLblToday]}>{day}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={s.streakMotiv}>
                {streak < 3 ? "You're building momentum!"
                 : streak < 7 ? "Strong consistency — almost a full week."
                 : streak < 14 ? "Incredible — two weeks strong."
                 : "Legendary! You're unstoppable. 🔥"}
              </Text>
            </>
          )}
        </View>

        {/* ── Badges ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🏅 Badges ({badgeList.length})</Text>
          {badgeList.length > 0 ? (
            <View style={s.badgeGrid}>
              {badgeList.map((b: any, i: number) => (
                <View key={b.slug ?? i} style={s.badgeItem}>
                  <Text style={s.badgeIcon}>{b.icon ?? "🏅"}</Text>
                  <Text style={s.badgeName}>{b.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🎯</Text>
              <Text style={s.emptyTxt}>Complete Day 1 to earn your first badge!</Text>
            </View>
          )}
        </View>

        {/* ── Leaderboard link ── */}
        <TouchableOpacity style={s.leaderBtn} onPress={() => router.push("/(tabs)/leaderboard")} activeOpacity={0.85}>
          <Text style={s.leaderBtnTxt}>🏆 View Leaderboard →</Text>
        </TouchableOpacity>

        <View style={{ height: t.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: t.colors.screenBg },
  content: { padding: t.spacing.md, gap: 14 },

  // Hero
  hero: {
    backgroundColor: t.hero.bg, borderRadius: t.radius.xxl, overflow: "hidden",
    padding: t.spacing.lg, shadowColor: t.hero.bg, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30, shadowRadius: 20, elevation: 8,
  },
  ring: { position: "absolute", borderRadius: 9999 },
  rA: { width: 220, height: 220, top: -70, right: -60, backgroundColor: "rgba(255,255,255,0.07)" },
  rB: { width: 130, height: 130, bottom: -40, left: -20, backgroundColor: "rgba(255,255,255,0.06)" },
  rC: { width: 80,  height: 80,  top: 20, right: 80, backgroundColor: "rgba(255,255,255,0.09)" },
  rD: { width: 45,  height: 45,  top: 60, right: 40, backgroundColor: "rgba(255,255,255,0.11)" },

  heroLeft:    { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  lvCircle:    { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.20)", justifyContent: "center", alignItems: "center" },
  lvNum:       { fontSize: 26, fontWeight: t.text.weightExtrabold, color: "#fff" },
  lvLabel:     { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: "rgba(255,255,255,0.85)", marginBottom: 6 },
  xpBar:       { height: 7, backgroundColor: "rgba(255,255,255,0.20)", borderRadius: t.radius.pill, overflow: "hidden", marginBottom: 5 },
  xpFill:      { height: "100%", backgroundColor: t.hero.progressFill, borderRadius: t.radius.pill },
  xpHint:      { fontSize: t.text.caption, color: "rgba(255,255,255,0.60)", fontWeight: t.text.weightMedium },

  heroRight:   { flexDirection: "row", gap: 0 },
  heroStat:    { flex: 1, alignItems: "center", paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: t.radius.lg },
  heroStatVal: { fontSize: t.text.h2, fontWeight: t.text.weightExtrabold, color: "#fff" },
  heroStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2, fontWeight: t.text.weightSemibold, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  heroDivider: { width: 10 },

  // Stat chips
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: t.spacing.md, alignItems: "center", borderWidth: 1, borderColor: t.colors.border },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal:  { fontSize: 20, fontWeight: t.text.weightExtrabold },
  statLbl:  { fontSize: 10, fontWeight: t.text.weightSemibold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5, marginTop: 2 },

  // Card
  card:      { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, ...t.cardShadow },
  cardTitle: { fontSize: t.text.h3, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: t.spacing.md },

  // Streak
  streakRow:       { flexDirection: "row", justifyContent: "space-between", marginBottom: t.spacing.sm },
  streakDay:       { alignItems: "center", flex: 1 },
  streakDot:       { width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.accentTint, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  streakDotFilled: { backgroundColor: t.colors.warningBg, borderWidth: 2, borderColor: t.colors.warning },
  streakDotToday:  { backgroundColor: t.colors.warning, transform: [{ scale: 1.15 }] },
  streakDotTxt:    { fontSize: 12, color: t.colors.textDisabled },
  streakDotTxtFilled: { fontSize: 16 },
  streakDayLbl:    { fontSize: 11, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  streakDayLblToday:{ color: t.colors.warning, fontWeight: t.text.weightExtrabold },
  streakMotiv:     { fontSize: t.text.bodyMd, color: t.colors.textMuted, textAlign: "center", fontStyle: "italic" },

  // Badges
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeItem: { alignItems: "center", backgroundColor: t.colors.accentTint, padding: t.spacing.sm + 4, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, minWidth: 72 },
  badgeIcon: { fontSize: 24, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: t.text.weightSemibold, color: t.colors.textBody, textAlign: "center" },

  // Empty
  empty:     { alignItems: "center", paddingVertical: t.spacing.lg },
  emptyEmoji:{ fontSize: 36, marginBottom: t.spacing.sm },
  emptyTxt:  { fontSize: t.text.bodyMd, color: t.colors.textMuted, textAlign: "center" },

  // Leaderboard link — styled like heroCta
  leaderBtn:    { backgroundColor: t.colors.accent, borderRadius: t.radius.lg, paddingVertical: 16, alignItems: "center" },
  leaderBtnTxt: { fontSize: t.text.body, fontWeight: t.text.weightExtrabold, color: "#fff", letterSpacing: 0.2 },
});
