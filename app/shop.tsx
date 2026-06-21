// app/shop.tsx — Shield Shop: buy streak protection shields

import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/data/useAuth';
import { useStreakShield } from '../src/data/useStreakShield';
import { useProfile } from '../src/data/queries';
import { colors, spacing, radius } from '../src/theme/tokens';

const HOW_IT_WORKS = [
  { icon: '📅', title: 'Miss a day', body: 'You forget to complete a lesson — it happens.' },
  { icon: '🛡️', title: 'Shield activates', body: 'One shield is automatically consumed to protect your streak.' },
  { icon: '🔥', title: 'Streak saved', body: 'Your streak continues unbroken. No setback, no guilt.' },
];

export default function ShopScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: shields, purchase } = useStreakShield(user?.id);
  const [buying, setBuying] = useState(false);

  const shieldCount = shields?.count ?? 0;
  const streak = profile?.streak ?? 0;

  const handleBuy = async () => {
    setBuying(true);
    try {
      await purchase.mutateAsync();
      Alert.alert('🛡️ Shield Added!', 'You now have ' + (shieldCount + 1) + ' shield(s) protecting your streak.');
    } catch (e: any) {
      Alert.alert('Could not add shield', e?.message ?? 'Please try again');
    } finally {
      setBuying(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Shield Shop</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🛡️</Text>
          <Text style={s.heroTitle}>Streak Protection</Text>
          <Text style={s.heroSub}>
            Don't let a missed day erase your progress.{'\n'}Shields keep your streak alive automatically.
          </Text>
        </View>

        {/* Your shields */}
        <View style={s.inventoryCard}>
          <View style={s.inventoryRow}>
            <View>
              <Text style={s.inventoryLabel}>YOUR SHIELDS</Text>
              <Text style={s.inventoryCount}>{shieldCount}</Text>
              <Text style={s.inventoryStatus}>
                {shieldCount === 0
                  ? 'No shields — your streak is unprotected'
                  : shieldCount === 1
                  ? '1 missed day covered'
                  : `${shieldCount} missed days covered`}
              </Text>
            </View>
            <View style={[s.shieldCircle, shieldCount > 0 && s.shieldCircleActive]}>
              <Text style={s.shieldCircleEmoji}>🛡️</Text>
              <Text style={s.shieldCircleNum}>{shieldCount}</Text>
            </View>
          </View>

          {streak > 0 && (
            <View style={s.streakRow}>
              <Text style={s.streakText}>🔥 Current streak: <Text style={s.streakBold}>{streak} days</Text></Text>
              {shieldCount === 0 && (
                <Text style={s.streakWarning}>⚠️ Unprotected</Text>
              )}
            </View>
          )}
        </View>

        {/* Buy button */}
        <TouchableOpacity
          style={[s.buyBtn, buying && { opacity: 0.7 }]}
          onPress={handleBuy}
          disabled={buying || purchase.isPending}
          activeOpacity={0.85}
        >
          <Text style={s.buyBtnEmoji}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.buyBtnTitle}>{buying ? 'Adding shield…' : 'Get a Shield'}</Text>
            <Text style={s.buyBtnSub}>Protects 1 missed day</Text>
          </View>
          <View style={s.buyBtnBadge}>
            <Text style={s.buyBtnBadgeText}>FREE</Text>
          </View>
        </TouchableOpacity>

        {/* How it works */}
        <Text style={s.sectionTitle}>How it works</Text>
        <View style={s.stepsCard}>
          {HOW_IT_WORKS.map((step, i) => (
            <View key={i} style={[s.stepRow, i < HOW_IT_WORKS.length - 1 && s.stepRowBorder]}>
              <View style={s.stepIconWrap}>
                <Text style={s.stepIcon}>{step.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fine print */}
        <View style={s.fineCard}>
          <Text style={s.fineText}>
            🔒 Shields are awarded for milestones and available to purchase. One shield activates per missed day — they stack. Shields do not expire.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },

  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  back:     { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },

  hero:      { alignItems: 'center', paddingVertical: 24, gap: 10 },
  heroEmoji: { fontSize: 72 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#1a1a2e' },
  heroSub:   { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  inventoryCard: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: 20,
    borderWidth: 1, borderColor: '#e5e7eb', gap: 14,
  },
  inventoryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inventoryLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' },
  inventoryCount: { fontSize: 48, fontWeight: '900', color: '#1a1a2e', lineHeight: 52 },
  inventoryStatus:{ fontSize: 13, color: '#6b7280', fontWeight: '500', marginTop: 2 },
  shieldCircle:   { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  shieldCircleActive:{ backgroundColor: '#ecfdf5', borderWidth: 2, borderColor: '#059669' },
  shieldCircleEmoji: { fontSize: 24 },
  shieldCircleNum:   { fontSize: 12, fontWeight: '800', color: '#059669' },
  streakRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef3c7', borderRadius: 10, padding: 10 },
  streakText:   { fontSize: 13, color: '#92400e' },
  streakBold:   { fontWeight: '800' },
  streakWarning:{ fontSize: 12, fontWeight: '700', color: '#b45309' },

  buyBtn:       { backgroundColor: '#059669', borderRadius: radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  buyBtnEmoji:  { fontSize: 28 },
  buyBtnTitle:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  buyBtnSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  buyBtnBadge:  { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  buyBtnBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6b7280', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 },

  stepsCard: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: '#e5e7eb' },
  stepRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  stepIconWrap:  { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  stepIcon:      { fontSize: 20 },
  stepTitle:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  stepBody:      { fontSize: 13, color: '#6b7280', lineHeight: 18 },

  fineCard: { backgroundColor: '#f9fafb', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  fineText: { fontSize: 12, color: '#9ca3af', lineHeight: 18, textAlign: 'center' },
});
