// app/pricing.tsx — fetches plans from Supabase and links to Stripe checkout.
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useTheme } from '../src/theme/ThemeContext';
import { useAuth } from '../src/data/useAuth';
import { supabase } from '../src/data/supabase';
import { spacing, fontSize, fontWeight } from '../src/theme/tokens';

// ─── Types ───

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  interval: string | null;
}

// ─── Feature lookup by plan id ───

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    'Day 1 of every program',
    'Streaks & XP tracking',
    'Progress dashboard',
    'Community access',
  ],
  premium_monthly: [
    'All programs, all days',
    'Audio narration',
    'Spaced-repetition review',
    'Streak shields',
    'Priority support',
  ],
  premium_annual: [
    'All programs, all days',
    'Audio narration',
    'Spaced-repetition review',
    'Streak shields',
    'Priority support',
    '2 months free vs monthly',
  ],
};

// ─── Helpers ───

function formatPrice(cents: number, interval: string | null): string {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  if (!interval) return cents === 0 ? 'Free' : `$${dollars}`;
  if (interval === 'month') return `$${dollars}/mo`;
  if (interval === 'year') return `$${dollars}/yr`;
  return `$${dollars}`;
}

function getFeatures(planId: string): string[] {
  return PLAN_FEATURES[planId] ?? [];
}

// ─── Component ───

export default function Pricing() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: plans,
    isLoading,
    error,
    refetch,
  } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name, price_cents, interval')
        .order('price_cents', { ascending: true });

      if (error) throw error;
      return (data as Plan[]) ?? [];
    },
    staleTime: 10 * 60 * 1000, // plans rarely change
  });

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: spacing.xl }]}>
        <Text style={{ color: colors.error, fontSize: fontSize.body, textAlign: 'center', marginBottom: spacing.md }}>
          Failed to load plans. Please try again.
        </Text>
        <Button title="Retry" variant="ghost" onPress={() => refetch()} />
      </View>
    );
  }

  // ── Empty state ──
  if (!plans || plans.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>📋</Text>}
          title="No plans available"
          message="Check back soon for pricing options."
        />
      </View>
    );
  }

  // ── Plans list ──
  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        gap: spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: fontSize.display,
          fontWeight: fontWeight.bold,
        }}
      >
        Choose your plan
      </Text>

      {plans.map((plan) => {
        const features = getFeatures(plan.id);
        const isFree = plan.id === 'free';
        const isCurrentPlan =
          user?.app_metadata?.plan_id === plan.id ||
          (isFree && !user?.app_metadata?.plan_id);

        return (
          <Card key={plan.id} tinted={!isFree}>
            <View style={{ gap: spacing.xs }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: fontSize.title,
                  fontWeight: fontWeight.bold,
                }}
              >
                {plan.name}
              </Text>
              <Text
                style={{
                  color: isFree ? colors.textMuted : colors.accent,
                  fontSize: fontSize.subtitle,
                  fontWeight: fontWeight.bold,
                }}
              >
                {formatPrice(plan.price_cents, plan.interval)}
              </Text>
            </View>

            {/* Feature list */}
            <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
              {features.length > 0 ? (
                features.map((feature, i) => (
                  <Text
                    key={i}
                    style={{ color: colors.textMuted, fontSize: fontSize.body }}
                  >
                    • {feature}
                  </Text>
                ))
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: fontSize.body }}>
                  Plan details coming soon.
                </Text>
              )}
            </View>

            {/* Action button */}
            <View style={{ marginTop: spacing.md }}>
              {isFree ? (
                isCurrentPlan ? (
                  <Button title="Current plan" onPress={() => {}} disabled />
                ) : (
                  <Button
                    title="Get started"
                    variant="secondary"
                    onPress={() => router.push('/onboard')}
                  />
                )
              ) : isCurrentPlan ? (
                <Button title="Current plan" onPress={() => {}} disabled />
              ) : (
                <Button
                  title="Upgrade"
                  onPress={() => router.push(`/checkout/${plan.id}`)}
                />
              )}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
