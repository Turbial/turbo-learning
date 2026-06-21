// app/profile/badges.tsx — Full badge gallery: unlocked + locked catalog

import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { useBadges, useAllBadges } from '../../src/data/queries';
import { useProfile } from '../../src/data/queries';
import { colors, spacing, radius } from '../../src/theme/tokens';

// Badges that have streak-based progress
const STREAK_BADGES: Record<string, { target: number; label: string }> = {
  week_streak:      { target: 7,  label: '7-day streak' },
  two_week_streak:  { target: 14, label: '14-day streak' },
};

function BadgeCard({ icon, name, condition, earned, earnedAt }: {
  icon: string | null; name: string; condition: string | null;
  earned: boolean; earnedAt?: string;
}) {
  return (
    <View style={[b.badgeCard, !earned && b.badgeCardLocked]}>
      <View style={[b.badgeIconWrap, earned ? b.badgeIconWrapEarned : b.badgeIconWrapLocked]}>
        <Text style={[b.badgeIcon, !earned && b.badgeIconLocked]}>{icon ?? '🏅'}</Text>
        {!earned && <View style={b.lockOverlay}><Text style={b.lockIcon}>🔒</Text></View>}
      </View>
      <Text style={[b.badgeName, !earned && b.badgeNameLocked]}>{name}</Text>
      {earned && earnedAt ? (
        <Text style={b.badgeEarnedDate}>
          {new Date(earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      ) : condition ? (
        <Text style={b.badgeCondition}>{condition}</Text>
      ) : null}
    </View>
  );
}

export default function BadgesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: earned = [] }  = useBadges(user?.id);
  const { data: catalog = [] } = useAllBadges();

  const earnedSlugs = new Set(earned.map((e: any) => e.badges?.slug ?? e.badge_id));
  const earnedBadges  = earned.map((e: any) => e.badges).filter(Boolean);
  const lockedBadges  = catalog.filter((b) => !earnedSlugs.has(b.slug));

  const streak = profile?.streak ?? 0;

  return (
    <SafeAreaView style={b.safe}>
      <ScrollView contentContainerStyle={b.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={b.header}>
          <TouchableOpacity onPress={() => router.back()} style={b.back}>
            <Text style={b.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={b.title}>Badges</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Summary */}
        <View style={b.summaryCard}>
          <Text style={b.summaryEmoji}>🏅</Text>
          <Text style={b.summaryCount}>{earnedBadges.length}</Text>
          <Text style={b.summaryOf}>of {catalog.length || earnedBadges.length + lockedBadges.length} earned</Text>
          {earnedBadges.length > 0 && (
            <View style={b.summaryBar}>
              <View style={[b.summaryBarFill, {
                width: `${Math.round((earnedBadges.length / Math.max(catalog.length, earnedBadges.length)) * 100)}%` as any
              }]} />
            </View>
          )}
        </View>

        {/* Streak progress */}
        {Object.entries(STREAK_BADGES).map(([slug, { target, label }]) => {
          const isEarned = earnedSlugs.has(slug);
          const badge = catalog.find(c => c.slug === slug);
          if (!badge && !isEarned) return null;
          return (
            <View key={slug} style={b.progressCard}>
              <View style={b.progressTop}>
                <Text style={b.progressIcon}>{badge?.icon ?? '🔥'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={b.progressName}>{badge?.name ?? label}</Text>
                  <Text style={b.progressLabel}>{isEarned ? '✓ Earned!' : `${Math.min(streak, target)} / ${target} days`}</Text>
                </View>
                {isEarned && <Text style={b.progressCheck}>✓</Text>}
              </View>
              {!isEarned && (
                <View style={b.progressTrack}>
                  <View style={[b.progressFill, { width: `${Math.min(Math.round((streak / target) * 100), 100)}%` as any }]} />
                </View>
              )}
            </View>
          );
        })}

        {/* Earned */}
        {earnedBadges.length > 0 && (
          <>
            <Text style={b.sectionTitle}>Earned ({earnedBadges.length})</Text>
            <View style={b.grid}>
              {earnedBadges.map((badge: any) => (
                <BadgeCard
                  key={badge.slug}
                  icon={badge.icon}
                  name={badge.name}
                  condition={badge.unlock_condition}
                  earned
                />
              ))}
            </View>
          </>
        )}

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <>
            <Text style={b.sectionTitle}>Locked ({lockedBadges.length})</Text>
            <View style={b.grid}>
              {lockedBadges.map((badge) => (
                <BadgeCard
                  key={badge.slug}
                  icon={badge.icon}
                  name={badge.name}
                  condition={badge.unlock_condition}
                  earned={false}
                />
              ))}
            </View>
          </>
        )}

        {/* Empty */}
        {earnedBadges.length === 0 && catalog.length === 0 && (
          <View style={b.emptyState}>
            <Text style={{ fontSize: 48 }}>🏅</Text>
            <Text style={b.emptyTitle}>No badges yet</Text>
            <Text style={b.emptyBody}>Complete lessons and build streaks to earn your first badge.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const b = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },

  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  back:     { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },

  summaryCard: {
    backgroundColor: '#059669', borderRadius: radius.lg,
    padding: 24, alignItems: 'center', gap: 4,
  },
  summaryEmoji:    { fontSize: 36 },
  summaryCount:    { fontSize: 48, fontWeight: '900', color: '#fff', lineHeight: 52 },
  summaryOf:       { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  summaryBar:      { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  summaryBarFill:  { height: '100%', backgroundColor: '#fff', borderRadius: 3 },

  progressCard: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb', gap: 10,
  },
  progressTop:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressIcon:  { fontSize: 24 },
  progressName:  { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  progressLabel: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  progressCheck: { fontSize: 20, color: '#059669', fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: '#f59e0b', borderRadius: 4 },

  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: '#6b7280',
    letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  badgeCard:        { width: '30%', alignItems: 'center', gap: 6, padding: 12, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: '#e5e7eb' },
  badgeCardLocked:  { opacity: 0.6 },
  badgeIconWrap:    { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  badgeIconWrapEarned: { backgroundColor: '#ecfdf5', borderWidth: 2, borderColor: '#059669' },
  badgeIconWrapLocked: { backgroundColor: '#f3f4f6' },
  badgeIcon:        { fontSize: 28 },
  badgeIconLocked:  { opacity: 0.5 },
  lockOverlay:      { position: 'absolute', top: -4, right: -4, backgroundColor: '#fff', borderRadius: 10, padding: 2 },
  lockIcon:         { fontSize: 12 },
  badgeName:        { fontSize: 11, fontWeight: '700', color: '#1a1a2e', textAlign: 'center' },
  badgeNameLocked:  { color: '#9ca3af' },
  badgeEarnedDate:  { fontSize: 10, color: '#059669', fontWeight: '600' },
  badgeCondition:   { fontSize: 10, color: '#9ca3af', textAlign: 'center', lineHeight: 14 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  emptyBody:  { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});
