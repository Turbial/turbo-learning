// app/auth/forgot-password.tsx — redesigned with branding
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email.trim()) { setErr('Please enter your email address.'); return; }
    if (!email.includes('@') || email.indexOf('@') < 1) { setErr('Please enter a valid email address.'); return; }
    setBusy(true);
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/login`
      : "turbo-learning://auth/login";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <View style={[s.safe, { backgroundColor: '#059669' }]}>
      <View style={s.container}>
        <View style={s.brandSection}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🔑</Text>
          </View>
          <Text style={s.brandName}>Reset Password</Text>
          <Text style={s.brandTagline}>We'll send you a reset link</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Forgot your password?</Text>
          <Text style={s.cardSubtitle}>Enter your email and we'll send you a link to reset it.</Text>

          {sent ? (
            <View style={s.sentBox}>
              <Text style={s.sentEmoji}>📧</Text>
              <Text style={s.sentTitle}>Check your email</Text>
              <Text style={s.sentBody}>
                If an account exists for{'\n'}
                <Text style={{ fontWeight: '700', color: '#1a1a2e' }}>{email}</Text>
                , a reset link is on its way.
              </Text>
            </View>
          ) : (
            <>
              <Field
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />

              {err ? (
                <View style={s.errorPill}>
                  <Text style={s.errorText}>{err}</Text>
                </View>
              ) : null}

              <Button
                title={busy ? 'Sending…' : 'Send reset link'}
                onPress={submit}
                disabled={busy}
              />
            </>
          )}

          <Link href="/auth/login" style={{ alignItems: 'center', paddingTop: 8 }}>
            <Text style={s.backLink}>← Back to sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-end' },
  brandSection: { alignItems: 'center', paddingBottom: 28, paddingTop: 48 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  logoEmoji: { fontSize: 34 },
  brandName: { fontSize: 28, fontWeight: '800' as const, color: '#fff', letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600' as const, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 10,
  },
  cardTitle: { fontSize: 24, fontWeight: '800' as const, color: '#1a1a2e', marginBottom: 2 },
  cardSubtitle: { fontSize: 15, color: '#6b7280', marginBottom: 8, lineHeight: 22 },
  errorPill: {
    backgroundColor: '#fef2f2', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '600' as const },
  sentBox: {
    backgroundColor: '#ecfdf5', borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#a7f3d0',
  },
  sentEmoji: { fontSize: 40 },
  sentTitle: { fontSize: 18, fontWeight: '700' as const, color: '#065f46' },
  sentBody: { fontSize: 15, color: '#4b5563', textAlign: 'center', lineHeight: 22 },
  backLink: { color: '#059669', fontSize: 15, fontWeight: '700' as const },
});
