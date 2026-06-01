// app/(tabs)/dashboard.tsx — redesigned: centered grid, clean stats
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { StreakFire } from '../../src/components/feedback/StreakFire';
import { Skeleton } from '../../src/components/ui/LoadingSkeleton';
import { useProfile, useLessonProgressMap } from '../../src/data/queries';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../src/theme/tokens';

export default function Dashboard() {
  const { colors } = useTheme(); const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { data: progressMap, isLoading: progressLoading } = useLessonProgressMap(profile?.id);
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const completedCount = progressMap ? progressMap.size : 0;
  const currentDay = Math.min(completedCount + 1, 28);

  if (isLoading || progressLoading) return (
    <View style={{ padding: spacing.xl, gap: spacing.md }}>
      <Skeleton height={120} /><Skeleton height={200} />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={s.content}>
      {/* header card */}
      <Card tinted>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerLabel}>LEVEL {profile?.level ?? 1}</Text>
            <Text style={s.headerXp}>{profile?.xp?.toLocaleString() ?? 0} XP</Text>
          </View>
          <StreakFire streak={profile?.streak ?? 0} />
        </View>
      </Card>

      {/* quick start — centered */}
      <Card>
        <View style={s.centered}>
          <Text style={s.todayLabel}>TODAY</Text>
          <Text style={s.todayDay}>Day {currentDay}</Text>
          <Text style={s.todayHint}>{completedCount}/28 days completed</Text>
          <Button title="Start today's lesson" onPress={() => router.push('/(tabs)/home')} />
        </View>
      </Card>

      {/* stats row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <ProgressRing value={currentDay - 1} max={28} />
          <Text style={s.statLabel}>Complete</Text>
        </View>
        <View style={[s.statCard, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={s.statValue}>{profile?.streak ?? 0}🔥</Text>
          <Text style={s.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* 28-day grid — centered */}
      <Card>
        <Text style={[s.sectionTitle, { textAlign: 'center' }]}>Your 28 Days</Text>
        <View style={s.grid}>
          {days.map(d => {
            const done = d < currentDay, active = d === currentDay;
            return (
              <View key={d} style={[
                s.gridCell,
                done && s.gridCellDone,
                active && s.gridCellActive,
              ]}>
                <Text style={[
                  s.gridText,
                  done && s.gridTextDone,
                  active && s.gridTextActive,
                ]}>{d}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.lg, backgroundColor: '#f9fafb' },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '800' as const, letterSpacing: 1.5 },
  headerXp: { color: '#1a1a2e', fontSize: 22, fontWeight: '800' as const },
  // Today
  centered: { alignItems: 'center', gap: 8 },
  todayLabel: { fontSize: 12, fontWeight: '800' as const, color: '#9ca3af', letterSpacing: 1.5 },
  todayDay: { fontSize: 24, fontWeight: '800' as const, color: '#1a1a2e' },
  todayHint: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: '800' as const, color: '#1a1a2e' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a2e', marginBottom: 14 },
  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8,
    paddingTop: 4,
  },
  gridCell: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  gridCellDone: { backgroundColor: '#059669' },
  gridCellActive: { backgroundColor: '#ecfdf5', borderWidth: 2, borderColor: '#059669' },
  gridText: { fontSize: 13, fontWeight: '600' as const, color: '#9ca3af' },
  gridTextDone: { color: '#fff' },
  gridTextActive: { color: '#059669', fontWeight: '800' as const },
});
