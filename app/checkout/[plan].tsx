// app/checkout/[plan].tsx — kicks off hosted Stripe checkout.
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { startCheckout } from '../../src/integrations/stripe';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Checkout() {
  const { colors } = useTheme(); const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true); setErr(null);
    try { await startCheckout(plan?.includes('annual') ? 'annual' : 'monthly'); }
    catch (e) { setErr(String(e)); } finally { setBusy(false); }
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>Confirm upgrade</Text>
      <Text style={{ color: colors.textMuted }}>Plan: {plan}</Text>
      {err ? <Text style={{ color: colors.error }}>{err}</Text> : null}
      <Button title={busy ? 'Opening checkout…' : 'Continue to payment'} onPress={go} disabled={busy} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
