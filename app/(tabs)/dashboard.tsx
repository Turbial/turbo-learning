// app/(tabs)/dashboard.tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { ProgressRing } from "../../src/components/ui/ProgressRing";
import { StreakFire } from "../../src/components/feedback/StreakFire";
import { Skeleton } from "../../src/components/ui/LoadingSkeleton";
import { useProfile, useLessonProgressMap } from "../../src/data/queries";
import { appTheme as t } from "../../src/theme/appTheme";

export default function Dashboard() {
  const router = useRouter();
  const { data: profile, isLoading }           = useProfile();
  const { data: progressMap, isLoading: prog } = useLessonProgressMap(profile?.id);

  if (isLoading || prog) return (
    <View style={{ padding: t.spacing.xl, gap: t.spacing.md, backgroundColor: t.colors.screenBg, flex: 1 }}>
      <Skeleton height={120} /><Skeleton height={200} />
    </View>
  );

  const completedCount = progressMap?.size ?? 0;
  const currentDay     = Math.min(completedCount + 1, 28);
  const days           = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <ScrollView contentContainerStyle={s.content}>
      {/* Header card */}
      <Card tinted>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerLabel}>LEVEL {profile?.level ?? 1}</Text>
            <Text style={s.headerXp}>{(profile?.xp ?? 0).toLocaleString()} XP</Text>
          </View>
          <StreakFire streak={profile?.streak ?? 0} />
        </View>
      </Card>

      {/* Quick start */}
      <Card>
        <View style={s.centered}>
          <Text style={s.todayLabel}>TODAY</Text>
          <Text style={s.todayDay}>Day {currentDay}</Text>
          <Text style={s.todayHint}>{completedCount}/28 days completed</Text>
          <Button title="Start today's lesson" onPress={() => router.push("/(tabs)/home")} />
        </View>
      </Card>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <ProgressRing value={currentDay - 1} max={28} />
          <Text style={s.statLabel}>Complete</Text>
        </View>
        <View style={[s.statCard, { alignItems: "center", justifyContent: "center" }]}>
          <Text style={s.statValue}>{profile?.streak ?? 0}🔥</Text>
          <Text style={s.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* 28-day grid */}
      <Card>
        <Text style={[s.sectionTitle, { textAlign: "center" }]}>Your 28 Days</Text>
        <View style={s.grid}>
          {days.map((d) => {
            const done   = d < currentDay;
            const active = d === currentDay;
            return (
              <View key={d} style={[s.gridCell, done && s.gridCellDone, active && s.gridCellActive]}>
                <Text style={[s.gridText, done && s.gridTextDone, active && s.gridTextActive]}>{d}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content:    { padding: t.spacing.xl, gap: t.spacing.lg, backgroundColor: t.colors.screenBg },
  headerRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLabel:{ color: t.colors.textDisabled, fontSize: 12, fontWeight: t.text.weightExtrabold, letterSpacing: 1.5 },
  headerXp:   { color: t.colors.textPrimary, fontSize: t.text.h1, fontWeight: t.text.weightExtrabold },
  centered:   { alignItems: "center", gap: 8 },
  todayLabel: { fontSize: 12, fontWeight: t.text.weightExtrabold, color: t.colors.textDisabled, letterSpacing: 1.5 },
  todayDay:   { fontSize: 24, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  todayHint:  { fontSize: t.text.bodyMd, color: t.colors.textMuted, marginBottom: 8 },
  statsRow:   { flexDirection: "row", gap: t.spacing.md },
  statCard: {
    flex: 1, backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, padding: 20,
    alignItems: "center", ...t.cardShadow,
  },
  statValue:    { fontSize: 28, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  statLabel:    { fontSize: 11, color: t.colors.textDisabled, marginTop: 4, fontWeight: t.text.weightBold, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  sectionTitle: { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: 14 },
  grid:         { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, paddingTop: 4 },
  gridCell:     { width: 38, height: 38, borderRadius: t.radius.md, alignItems: "center", justifyContent: "center", backgroundColor: t.colors.accentTint },
  gridCellDone:  { backgroundColor: t.colors.accent },
  gridCellActive:{ backgroundColor: t.colors.cardBg, borderWidth: 2, borderColor: t.colors.accent },
  gridText:       { fontSize: 13, fontWeight: t.text.weightSemibold, color: t.colors.textDisabled },
  gridTextDone:   { color: "#fff" },
  gridTextActive: { color: t.colors.accent, fontWeight: t.text.weightExtrabold },
});
