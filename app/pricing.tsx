// app/pricing.tsx — free vs premium tiers → Stripe checkout.
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { useTheme } from '../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../src/theme/tokens';

const TIERS = [
  { id: 'free', name: 'Free', price: '$0', features: ['Day 1 of every program', 'Streaks & XP', 'Progress tracking'] },
  { id: 'premium_monthly', name: 'Premium', price: '$19/mo', features: ['All programs, all days', 'Audio narration', 'Spaced-repetition review', 'Streak shields'] },
];

export default function Pricing() {
  const { colors } = useTheme(); const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: fontSize.display, fontWeight: fontWeight.bold }}>Choose your plan</Text>
      {TIERS.map(t => (
        <Card key={t.id} tinted={t.id !== 'free'}>
          <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>{t.name}</Text>
          <Text style={{ color: colors.accent, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold }}>{t.price}</Text>
          {t.features.map(f => <Text key={f} style={{ color: colors.textMuted }}>• {f}</Text>)}
          {t.id !== 'free' ? <Button title="Upgrade" onPress={() => router.push(`/checkout/${t.id}`)} /> : null}
        </Card>
      ))}
    </ScrollView>
  );
}
