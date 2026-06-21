// app/leagues.tsx — Tier progression detail: XP thresholds, your standing, reset countdown

import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/data/useAuth';
import { useMyLeague, TIER_INFO } from '../src/data/useLeagues';
import { useProfile } from '../src/data/queries';
import { colors, spacing, radius } from '../src/theme/tokens';

const TIERS = [
  { key: 'bronze',  minXp: 0,    maxXp: 199,  ...TIER_INFO.bronze,  perks: ['Weekly league competition', 'Basic leaderboard ranking'] },
  { key: 'silver',  minXp: 200,  maxXp: 799,  ...TIER_INFO.silver,  perks: ['Silver league placement', 'Top 3 weekly bonus'] },
  { key: 'gold',    minXp: 800,  maxXp: 1999, ...TIER_INFO.gold,    perks: ['Gold league prestige', 'Priority lesson access'] },
  { key: 'diamond', minXp: 2000, maxXp: 4999, ...TIER_INFO.diamond, perks: ['Diamond elite status', 'Shield rewards on milestones'] },
  { key: 'master',  minXp: 5000, maxXp: null, ...TIER_INFO.master,  perks: ['Master tier — top of the platform', 'Exclusive Master badge (coming soon)'] },
];

function msUntilMonday(): number {
  const now = new Date();
  const nextMonday = new Date(now);
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysToMonday = day === 0 ? 1 : 8 - day;
  nextMonday.setDate(now.getDate() + daysToMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function LeaguesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: league } = useMyLeague(user?.id);

  const totalXp   = profile?.xp ?? 0;
  const myTierKey = league?.tier ?? 'bronze';
  const myTier    = TIERS.find(t => t.key === myTierKey) ?? TIERS[0];
  const nextTier  = TIERS.find(t => t.minXp > totalXp);
  const xpToNext  = nextTier ? nextTier.minXp - totalXp : 0;
  const resetIn   = formatCountdown(msUntilMonday());

  return (
    <SafeAreaView style={l.safe}>
      <ScrollView contentContainerStyle={l.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={l.header}>
          <TouchableOpacity onPress={() => router.back()} style={l.back}>
            <Text style={l.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={l.title}>Leagues</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Your tier card */}
        <View style={[l.myTierCard, { borderColor: myTier.color }]}>
          <Text style={l.myTierEmoji}>{myTier.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={l.myTierLabel}>YOUR TIER</Text>
            <Text style={[l.myTierName, { color: myTier.color }]}>{myTier.label}</Text>
            <Text style={l.myTierXp}>{totalXp.toLocaleString()} total XP</Text>
          </View>
          <View style={l.resetBadge}>
            <Text style={l.resetLabel}>Resets in</Text>
            <Text style={l.resetValue}>{resetIn}</Text>
          </View>
        </View>

        {/* Next tier progress */}
        {nextTier && (
          <View style={l.nextCard}>
            <View style={l.nextRow}>
              <Text style={l.nextLabel}>
                {xpToNext.toLocaleString()} XP to {nextTier.emoji} {nextTier.label}
              </Text>
              <Text style={l.nextPct}>
                {Math.round((totalXp / nextTier.minXp) * 100)}%
              </Text>
            </View>
            <View style={l.nextTrack}>
              <View style={[l.nextFill, {
                width: `${Math.min(Math.round((totalXp / nextTier.minXp) * 100), 100)}%` as any,
                backgroundColor: nextTier.color,
              }]} />
            </View>
          </View>
        )}

        {/* Tier ladder */}
        <Text style={l.sectionTitle}>Tier Ladder</Text>
        <View style={l.ladderCard}>
          {[...TIERS].reverse().map((tier, i) => {
            const isCurrent = tier.key === myTierKey;
            const isUnlocked = totalXp >= tier.minXp;
            return (
              <View key={tier.key} style={[l.tierRow, i < TIERS.length - 1 && l.tierRowBorder]}>
                <View style={[l.tierIconWrap, { backgroundColor: tier.color + '18', borderColor: tier.color + '44' }, isCurrent && { borderColor: tier.color, backgroundColor: tier.color + '28' }]}>
                  <Text style={l.tierEmoji}>{tier.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={l.tierNameRow}>
                    <Text style={[l.tierName, { color: isUnlocked ? '#1a1a2e' : '#9ca3af' }]}>{tier.label}</Text>
                    {isCurrent && (
                      <View style={[l.currentBadge, { backgroundColor: tier.color }]}>
                        <Text style={l.currentBadgeText}>YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={l.tierXpRange}>
                    {tier.maxXp ? `${tier.minXp.toLocaleString()} – ${tier.maxXp.toLocaleString()} XP` : `${tier.minXp.toLocaleString()}+ XP`}
                  </Text>
                  {tier.perks.map((perk, pi) => (
                    <Text key={pi} style={[l.tierPerk, !isUnlocked && l.tierPerkLocked]}>
                      {isUnlocked ? '✓' : '○'} {perk}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* How leagues work */}
        <Text style={l.sectionTitle}>How it works</Text>
        <View style={l.infoCard}>
          {[
            { icon: '📅', text: 'Leagues reset every Monday at midnight UTC' },
            { icon: '⚡', text: 'You earn weekly XP by completing lessons' },
            { icon: '🏆', text: 'Top 3 in your group at week\'s end get promoted' },
            { icon: '📉', text: 'Bottom 3 get relegated to the tier below' },
            { icon: '🎯', text: 'Your lifetime XP determines which tier you enter each week' },
          ].map(({ icon, text }, i) => (
            <View key={i} style={[l.infoRow, i < 4 && l.infoRowBorder]}>
              <Text style={l.infoIcon}>{icon}</Text>
              <Text style={l.infoText}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={l.leaderboardBtn} onPress={() => router.push('/(tabs)/leaderboard')} activeOpacity={0.8}>
          <Text style={l.leaderboardBtnText}>View My League Rankings →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const l = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },

  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  back:     { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },

  myTierCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2 },
  myTierEmoji:{ fontSize: 44 },
  myTierLabel:{ fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' },
  myTierName: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  myTierXp:   { fontSize: 13, color: '#6b7280', marginTop: 2 },
  resetBadge: { alignItems: 'flex-end', gap: 2 },
  resetLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  resetValue: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },

  nextCard:  { backgroundColor: '#fff', borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', gap: 8 },
  nextRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  nextPct:   { fontSize: 13, fontWeight: '800', color: '#059669' },
  nextTrack: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  nextFill:  { height: '100%', borderRadius: 4 },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6b7280', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 },

  ladderCard: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: '#e5e7eb' },
  tierRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  tierRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tierIconWrap:  { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginTop: 2 },
  tierEmoji:     { fontSize: 24 },
  tierNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  tierName:      { fontSize: 16, fontWeight: '800' },
  currentBadge:  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  currentBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tierXpRange:   { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginBottom: 4 },
  tierPerk:      { fontSize: 12, color: '#059669', lineHeight: 18 },
  tierPerkLocked:{ color: '#d1d5db' },

  infoCard:    { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: '#e5e7eb' },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  infoRowBorder:{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoIcon:    { fontSize: 18, width: 28 },
  infoText:    { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },

  leaderboardBtn:     { backgroundColor: '#fff', borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  leaderboardBtnText: { fontSize: 15, fontWeight: '700', color: colors.primary },
});
