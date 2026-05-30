// app/checkout/[plan].tsx — payment method selection: Stripe or PayPal.
import { useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { startCheckout } from '../../src/integrations/stripe';
import { startPayPalCheckout, isPayPalAvailable } from '../../src/integrations/paypal';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../src/theme/tokens';

export default function Checkout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<'stripe' | 'paypal' | null>(null);

  const handleStripe = async () => {
    if (!plan) return;
    setMethod('stripe');
    setBusy(true);
    setErr(null);
    try {
      await startCheckout(plan);
    } catch (e) {
      setErr(String(e));
      setBusy(false);
      setMethod(null);
    }
  };

  const handlePayPal = async () => {
    if (!plan) return;
    setMethod('paypal');
    setBusy(true);
    setErr(null);
    try {
      await startPayPalCheckout(plan);
    } catch (e) {
      setErr(String(e));
      setBusy(false);
      setMethod(null);
    }
  };

  const planLabel = plan === 'pro' ? 'Premium' : (plan || 'Premium');
  const price = plan === 'pro' ? '$9.99/mo' : '';

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <View>
        <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>
          Choose payment method
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.body, marginTop: 4 }}>
          {planLabel} {price ? `· ${price}` : ''}
        </Text>
      </View>

      {err ? (
        <View style={{ backgroundColor: '#fef2f2', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: '#fecaca' }}>
          <Text style={{ color: '#ef4444', fontSize: fontSize.sm }}>{err}</Text>
        </View>
      ) : null}

      {/* Stripe */}
      <Card>
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: '700' }}>
            💳 Credit / Debit Card
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            Pay securely with Stripe. All major cards accepted.
          </Text>
          <Button
            title={busy && method === 'stripe' ? 'Opening Stripe…' : 'Pay with Card'}
            onPress={handleStripe}
            disabled={busy}
          />
        </View>
      </Card>

      {/* PayPal */}
      {isPayPalAvailable() && (
        <Card>
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: '700' }}>
              🅿️ PayPal
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
              Pay with your PayPal account or PayPal balance.
            </Text>
            <Button
              title={busy && method === 'paypal' ? 'Opening PayPal…' : 'Pay with PayPal'}
              variant="secondary"
              onPress={handlePayPal}
              disabled={busy}
            />
          </View>
        </Card>
      )}

      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
