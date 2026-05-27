// app/(tabs)/dashboard.tsx — single-page hub: level/XP/streak header, 28-day grid, stats, quick start.
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
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
  // Calculate current day: 1 + number of completed units, clamped to 28
  const completedCount = progressMap ? progressMap.size : 0;
  const currentDay = Math.min(completedCount + 1, 28);

  if (isLoading || progressLoading) return <View style={{ padding: spacing.xl, gap: spacing.md }}><Skeleton height={120} /><Skeleton height={200} /></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background }}>
      {/* header */}
      <Card tinted>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, fontWeight: fontWeight.bold }}>LEVEL {profile?.level ?? 1}</Text>
            <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>{profile?.xp ?? 0} XP</Text>
          </View>
          <StreakFire streak={profile?.streak ?? 0} />
        </View>
      </Card>

      {/* quick start */}
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>TODAY</Text>
        <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold }}>Day {currentDay}</Text>
        <Button title="Start today's lesson" onPress={() => router.push('/home')} />
      </Card>

      {/* 28-day grid */}
      <Card>
        <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold }}>Your 28 days</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
          {days.map(d => {
            const done = d < currentDay, active = d === currentDay;
            return (
              <View key={d} style={{ width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center',
                backgroundColor: done ? colors.accent : active ? colors.accentSoft : colors.surfaceAlt,
                borderWidth: active ? 2 : 0, borderColor: colors.accent }}>
                <Text style={{ color: done ? colors.accentText : colors.textMuted, fontSize: fontSize.caption, fontWeight: fontWeight.semibold }}>{d}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* stats */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Card style={{ flex: 1, alignItems: 'center' }}><ProgressRing value={currentDay - 1} max={28} /><Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>Complete</Text></Card>
        <Card style={{ flex: 1, alignItems: 'center' }}><Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>{profile?.streak ?? 0}</Text><Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>Day streak</Text></Card>
      </View>
    </ScrollView>
  );
}
