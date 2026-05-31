// app/pricing.tsx — fetches plans from Supabase and links to Stripe checkout.
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
  slug: string;
  name: string;
  price_cents: number;
  price_monthly_usd: number;
  interval: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  features: string[];
  is_popular: boolean;
}

// ─── Feature lookup by plan slug ───

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    'Day 1 of every program',
    'Streaks & XP tracking',
    'Progress dashboard',
    'Community access',
  ],
  pro: [
    'All programs, all days',
    'Audio narration',
    'Spaced-repetition review',
    'Streak shields',
    'Priority support',
    'PayPal or card payment',
  ],
};

// ─── Helpers ───

function formatPrice(plan: Plan): string {
  // Use price_monthly_usd in cents, or price_cents if set
  const cents = plan.price_cents || plan.price_monthly_usd || 0;
  const interval = plan.interval;
  if (!interval) return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
  if (interval === 'month') return `$${(cents / 100).toFixed(2)}/mo`;
  if (interval === 'year') return `$${(cents / 100).toFixed(2)}/yr`;
  return `$${(cents / 100).toFixed(2)}`;
}

function getFeatures(plan: Plan): string[] {
  return plan.features ?? PLAN_FEATURES[plan.slug] ?? [];
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
        .select('id, slug, name, price_cents, price_monthly_usd, interval, stripe_price_id_monthly, stripe_price_id_annual, features, is_popular')
        .eq('is_active', true)
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
        const features = getFeatures(plan);
        const isFree = plan.slug === 'free';
        const isCurrentPlan =
          user?.app_metadata?.plan_id === plan.slug ||
          (isFree && !user?.app_metadata?.plan_id);

        return (
          <Card key={plan.id} tinted={!isFree}>
            <View style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: fontSize.title,
                    fontWeight: fontWeight.bold,
                  }}
                >
                  {plan.name}
                </Text>
                {plan.is_popular && (
                  <View style={{ backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>POPULAR</Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  color: isFree ? colors.textMuted : colors.accent,
                  fontSize: fontSize.subtitle,
                  fontWeight: fontWeight.bold,
                }}
              >
                {isFree ? 'Free' : `$${(plan.price_monthly_usd || plan.price_cents)?.toLocaleString()}/mo`}
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
                  onPress={() => router.push(`/checkout/${plan.slug}`)}
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
