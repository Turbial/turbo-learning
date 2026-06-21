// app/profile/billing.tsx — Subscription management + payment history

import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { useSubscription } from '../../src/data/useSubscription';
import { usePaymentHistory } from '../../src/data/queries';
import { cancelSubscription, openCustomerPortal } from '../../src/integrations/stripe';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

const TIER_COLORS: Record<string, string> = {
  premium: '#059669',
  free: '#9ca3af',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#059669',
  canceling: '#f59e0b',
  canceled: '#ef4444',
  past_due: '#ef4444',
  none: '#9ca3af',
};

function formatCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BillingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: sub, isLoading: subLoading } = useSubscription(user?.id);
  const { data: history = [], isLoading: histLoading } = usePaymentHistory(user?.id);
  const [portalBusy, setPortalBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  const isPremium = sub?.tier === 'premium' && sub?.status === 'active';
  const isCanceling = sub?.status === 'canceling';

  const handlePortal = async () => {
    setPortalBusy(true);
    try {
      await openCustomerPortal();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not open billing portal');
    } finally {
      setPortalBusy(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel subscription',
      'Your plan stays active until the billing period ends. Cancel anyway?',
      [
        { text: 'Keep plan', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelBusy(true);
            try {
              await cancelSubscription();
              Alert.alert('Canceled', 'Your subscription will end at the current period.');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not cancel subscription');
            } finally {
              setCancelBusy(false);
            }
          },
        },
      ],
    );
  };

  if (subLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Billing</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Current plan card */}
        <View style={s.planCard}>
          <View style={s.planTop}>
            <View>
              <Text style={s.planLabel}>CURRENT PLAN</Text>
              <Text style={s.planName}>{isPremium ? 'Premium' : 'Free'}</Text>
            </View>
            <View style={[s.tierBadge, { backgroundColor: TIER_COLORS[sub?.tier ?? 'free'] + '22', borderColor: TIER_COLORS[sub?.tier ?? 'free'] }]}>
              <Text style={[s.tierBadgeText, { color: TIER_COLORS[sub?.tier ?? 'free'] }]}>
                {(sub?.tier ?? 'free').toUpperCase()}
              </Text>
            </View>
          </View>

          {sub?.status && sub.status !== 'none' && (
            <View style={s.statusRow}>
              <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[sub.status] ?? '#9ca3af' }]} />
              <Text style={[s.statusText, { color: STATUS_COLORS[sub.status] ?? '#9ca3af' }]}>
                {sub.status === 'active' ? 'Active' :
                 sub.status === 'canceling' ? 'Cancels at period end' :
                 sub.status === 'canceled' ? 'Canceled' :
                 sub.status === 'past_due' ? 'Payment past due' :
                 sub.status}
              </Text>
            </View>
          )}

          {sub?.current_period_end && (
            <Text style={s.renewDate}>
              {isCanceling ? 'Ends' : 'Renews'} {formatDate(sub.current_period_end)}
            </Text>
          )}
        </View>

        {/* Actions */}
        {isPremium || isCanceling ? (
          <View style={s.actionsCard}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnPrimary]}
              onPress={handlePortal}
              disabled={portalBusy}
              activeOpacity={0.8}
            >
              <Text style={s.actionBtnPrimaryText}>
                {portalBusy ? 'Opening…' : '🔗 Manage Billing in Stripe'}
              </Text>
              <Text style={s.actionBtnSub}>Update card, download invoices</Text>
            </TouchableOpacity>

            {!isCanceling && (
              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnDanger]}
                onPress={handleCancel}
                disabled={cancelBusy}
                activeOpacity={0.8}
              >
                <Text style={s.actionBtnDangerText}>
                  {cancelBusy ? 'Canceling…' : 'Cancel Subscription'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={s.upgradeCard}
            onPress={() => router.push('/pricing')}
            activeOpacity={0.85}
          >
            <Text style={s.upgradeEmoji}>🚀</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={s.upgradeSub}>Unlock all 28 days, audio, review queue & more</Text>
            </View>
            <Text style={s.upgradeArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Payment history */}
        <Text style={s.sectionTitle}>Payment History</Text>
        <View style={s.card}>
          {histLoading ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 24 }} />
          ) : history.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🧾</Text>
              <Text style={s.emptyText}>No payments yet</Text>
            </View>
          ) : (
            history.map((p, i) => (
              <View key={p.id} style={[s.payRow, i < history.length - 1 && s.payRowBorder]}>
                <View>
                  <Text style={s.payAmount}>{formatCents(p.amount_cents, p.currency)}</Text>
                  <Text style={s.payDate}>{formatDate(p.created_at)}</Text>
                </View>
                <View style={[s.payStatus, { backgroundColor: p.status === 'succeeded' ? '#ecfdf5' : '#fef2f2' }]}>
                  <Text style={[s.payStatusText, { color: p.status === 'succeeded' ? '#059669' : '#ef4444' }]}>
                    {p.status === 'succeeded' ? '✓ Paid' : p.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  back:     { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },

  planCard: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: 20,
    borderWidth: 1, borderColor: '#e5e7eb', gap: 10,
  },
  planTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planLabel:{ fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' },
  planName: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', marginTop: 2 },
  tierBadge:{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1.5 },
  tierBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusRow:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot:{ width: 8, height: 8, borderRadius: 4 },
  statusText:{ fontSize: 13, fontWeight: '600' },
  renewDate:{ fontSize: 13, color: '#6b7280' },

  actionsCard:{ gap: 10 },
  actionBtn:  { borderRadius: radius.lg, padding: 16 },
  actionBtnPrimary:   { backgroundColor: '#059669' },
  actionBtnPrimaryText:{ fontSize: 15, fontWeight: '700', color: '#fff' },
  actionBtnSub:       { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  actionBtnDanger:    { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#fecaca' },
  actionBtnDangerText:{ fontSize: 15, fontWeight: '700', color: '#ef4444', textAlign: 'center' },

  upgradeCard: {
    backgroundColor: '#0d0621', borderRadius: radius.lg, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  upgradeEmoji: { fontSize: 28 },
  upgradeTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  upgradeSub:   { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  upgradeArrow: { fontSize: 20, color: '#a78bfa', fontWeight: '700' },

  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: '#6b7280',
    letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4,
  },
  card: {
    backgroundColor: '#fff', borderRadius: radius.lg,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  payRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  payRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  payAmount:    { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  payDate:      { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  payStatus:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  payStatusText:{ fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', padding: 32, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText:  { fontSize: 14, color: '#9ca3af', fontWeight: '600' },
});
