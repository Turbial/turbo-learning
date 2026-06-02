// app/(tabs)/dashboard.tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Skeleton } from "../../src/components/ui/LoadingSkeleton";
import { useProfile, useLessonProgressMap } from "../../src/data/queries";
import { useAuth } from "../../src/data/useAuth";
import { appTheme as t } from "../../src/theme/appTheme";

function getFirstName(name?: string | null, email?: string | null): string {
  if (name) return name.trim().split(/\s+/)[0]!;
  if (email) return email.split("@")[0]!;
  return "Learner";
}

export default function Dashboard() {
  const router = useRouter();
  const { user }                               = useAuth();
  const { data: profile, isLoading }           = useProfile();
  const { data: progressMap, isLoading: prog } = useLessonProgressMap(profile?.id);

  if (isLoading || prog) return (
    <SafeAreaView style={s.safe}>
      <View style={{ padding: t.spacing.md, gap: 14 }}>
        <Skeleton height={170} rounded={t.radius.xxl} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[1,2,3].map(i => <View key={i} style={{flex:1}}><Skeleton height={80} rounded={t.radius.lg} /></View>)}
        </View>
        <Skeleton height={260} rounded={t.radius.xl} />
      </View>
    </SafeAreaView>
  );

  const completedCount = progressMap?.size ?? 0;
  const currentDay     = Math.min(completedCount + 1, 28);
  const days           = Array.from({ length: 28 }, (_, i) => i + 1);
  const overallPct     = Math.round((completedCount / 28) * 100);
  const firstName      = getFirstName(profile?.name, profile?.email ?? user?.email);
  const hour           = new Date().getHours();
  const greeting       = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero / greeting card ── */}
        <View style={s.hero}>
          <View style={[s.ring, s.rA]} /><View style={[s.ring, s.rB]} />
          <View style={[s.ring, s.rC]} /><View style={[s.ring, s.rD]} />

          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>{greeting} 👋</Text>
              <Text style={s.heroName}>{firstName}</Text>
              <Text style={s.heroProgramLbl}>AI Operator · Day {currentDay} of 28</Text>
            </View>
            <View style={s.lvBadge}>
              <Text style={s.lvBadgeTxt}>⭐ Lv {profile?.level ?? 1}</Text>
            </View>
          </View>

          {/* XP progress bar */}
          <View style={s.xpRow}>
            <Text style={s.xpLbl}>{(profile?.xp ?? 0).toLocaleString()} XP</Text>
            <Text style={s.xpPct}>{overallPct}%</Text>
          </View>
          <View style={s.xpTrack}>
            <View style={[s.xpFill, { width: `${Math.max(overallPct, overallPct > 0 ? 3 : 0)}%` as any }]} />
          </View>

          {/* Continue button */}
          <TouchableOpacity style={s.heroCta} onPress={() => router.push("/(tabs)/home")} activeOpacity={0.85}>
            <Text style={s.heroCtaTxt}>Continue Today's Lesson →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          {[
            { emoji: "🔥", val: String(profile?.streak ?? 0), label: "Day Streak", color: t.colors.streakText },
            { emoji: "✅", val: String(completedCount),        label: "Completed",  color: t.colors.success },
            { emoji: "⚡", val: String(profile?.xp ?? 0),     label: "Total XP",   color: t.colors.accent },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statEmoji}>{st.emoji}</Text>
              <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── 28-day grid ── */}
        <View style={s.gridCard}>
          <View style={[s.gridAccent, { backgroundColor: t.weekColors[0] }]} />
          <View style={s.gridBody}>
            <View style={s.gridHeader}>
              <Text style={s.gridTitle}>Your 28 Days</Text>
              <Text style={s.gridCount}>{completedCount}/28</Text>
            </View>
            <View style={s.grid}>
              {days.map((d) => {
                const done   = d < currentDay;
                const active = d === currentDay;
                return (
                  <View key={d} style={[s.gridCell, done && s.gridCellDone, active && s.gridCellActive]}>
                    <Text style={[s.gridTxt, done && s.gridTxtDone, active && s.gridTxtActive]}>
                      {done ? "✓" : String(d)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: t.colors.screenBg },
  content: { padding: t.spacing.md, gap: 14, paddingBottom: t.spacing.xxl },

  // Hero
  hero: { backgroundColor: t.hero.bg, borderRadius: t.radius.xxl, padding: t.spacing.lg, overflow: "hidden", shadowColor: t.hero.bg, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 20, elevation: 8 },
  ring: { position: "absolute", borderRadius: 9999 },
  rA: { width: 260, height: 260, top: -90, right: -70, backgroundColor: "rgba(255,255,255,0.06)" },
  rB: { width: 150, height: 150, bottom: -55, left: -30, backgroundColor: "rgba(255,255,255,0.07)" },
  rC: { width: 80,  height: 80,  top: 20, right: 60, backgroundColor: "rgba(255,255,255,0.09)" },
  rD: { width: 50,  height: 50,  top: 65, right: 20, backgroundColor: "rgba(255,255,255,0.11)" },

  heroTop:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: t.spacing.md },
  heroGreeting: { fontSize: t.text.bodyMd, color: "rgba(255,255,255,0.70)", fontWeight: t.text.weightMedium },
  heroName:     { fontSize: t.text.display, fontWeight: t.text.weightExtrabold, color: "#fff", letterSpacing: -0.5, lineHeight: t.text.display * 1.15 },
  heroProgramLbl:{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  lvBadge:      { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: t.radius.pill },
  lvBadgeTxt:   { fontSize: 13, fontWeight: t.text.weightBold, color: "#fff" },

  xpRow:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  xpLbl:  { fontSize: t.text.caption, color: "rgba(255,255,255,0.70)", fontWeight: t.text.weightSemibold },
  xpPct:  { fontSize: t.text.caption, color: "rgba(255,255,255,0.70)", fontWeight: t.text.weightSemibold },
  xpTrack:{ height: 7, backgroundColor: "rgba(255,255,255,0.20)", borderRadius: t.radius.pill, overflow: "hidden", marginBottom: t.spacing.md },
  xpFill: { height: "100%", backgroundColor: t.hero.progressFill, borderRadius: t.radius.pill },

  heroCta:  { backgroundColor: "#fff", borderRadius: t.radius.lg, paddingVertical: 14, alignItems: "center" },
  heroCtaTxt:{ fontSize: t.text.body, fontWeight: t.text.weightExtrabold, color: t.hero.ctaText, letterSpacing: 0.2 },

  // Stats
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: t.spacing.md, alignItems: "center", borderWidth: 1, borderColor: t.colors.border },
  statEmoji:{ fontSize: 20, marginBottom: 4 },
  statVal:  { fontSize: 20, fontWeight: t.text.weightExtrabold },
  statLbl:  { fontSize: 10, fontWeight: t.text.weightSemibold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5, marginTop: 2 },

  // 28-day grid card — week card pattern
  gridCard:   { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, overflow: "hidden", flexDirection: "row", ...t.cardShadow },
  gridAccent: { width: 5 },
  gridBody:   { flex: 1, padding: t.spacing.md },
  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing.md },
  gridTitle:  { fontSize: t.text.h3, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  gridCount:  { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: t.colors.accent },
  grid:       { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  gridCell:   { width: 36, height: 36, borderRadius: t.radius.md, alignItems: "center", justifyContent: "center", backgroundColor: t.colors.accentTint },
  gridCellDone:  { backgroundColor: t.colors.accent },
  gridCellActive:{ backgroundColor: t.colors.cardBg, borderWidth: 2, borderColor: t.colors.accent },
  gridTxt:       { fontSize: 12, fontWeight: t.text.weightSemibold, color: t.colors.textDisabled },
  gridTxtDone:   { color: "#fff", fontWeight: t.text.weightBlack, fontSize: 13 },
  gridTxtActive: { color: t.colors.accent, fontWeight: t.text.weightExtrabold, fontSize: 13 },
});
