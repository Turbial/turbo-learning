// app/pricing.tsx — fetches plans from Supabase and links to Stripe checkout.
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { useTheme } from '../src/theme/ThemeContext';
import { supabase } from '../src/data/supabase';
import { spacing, fontSize, fontWeight } from '../src/theme/tokens';

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  interval: string | null;
}

export default function Pricing() {
  const { colors } = useTheme();
  const router = useRouter();

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name, price_cents, interval')
        .order('price_cents', { ascending: true });
      if (error) throw error;
      return data as Plan[];
    },
    staleTime: 10 * 60 * 1000, // plans rarely change
  });

  const formatPrice = (cents: number, interval: string | null) => {
    const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
    if (!interval) return `$${dollars}`;
    if (interval === 'month') return `$${dollars}/mo`;
    if (interval === 'year') return `$${dollars}/yr`;
    return `$${dollars}`;
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !plans) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.error, fontSize: fontSize.body, textAlign: 'center' }}>
          Failed to load plans. Please try again.
        </Text>
        <Button title="Retry" variant="ghost" onPress={() => router.replace('/pricing')} />
      </View>
    );
  }

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

      {plans.map((plan) => (
        <Card key={plan.id} tinted={plan.id !== 'free'}>
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
              color: colors.accent,
              fontSize: fontSize.subtitle,
              fontWeight: fontWeight.bold,
            }}
          >
            {formatPrice(plan.price_cents, plan.interval)}
          </Text>

          {/* Feature list varies by plan */}
          {plan.id === 'free' && (
            <>
              <Text style={{ color: colors.textMuted }}>• Day 1 of every program</Text>
              <Text style={{ color: colors.textMuted }}>• Streaks & XP</Text>
              <Text style={{ color: colors.textMuted }}>• Progress tracking</Text>
            </>
          )}
          {plan.id !== 'free' && (
            <>
              <Text style={{ color: colors.textMuted }}>• All programs, all days</Text>
              <Text style={{ color: colors.textMuted }}>• Audio narration</Text>
              <Text style={{ color: colors.textMuted }}>• Spaced-repetition review</Text>
              <Text style={{ color: colors.textMuted }}>• Streak shields</Text>
              <Button
                title="Upgrade"
                onPress={() => router.push(`/checkout/${plan.id}`)}
              />
            </>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}
