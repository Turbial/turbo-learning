// app/auth/register.tsx — redesigned registration with branding
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { spacing, fontSize } from '../../src/theme/tokens';

export default function Register() {
  const router = useRouter();
  const { signUpWithEmail, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  React.useEffect(() => {
    if (user) router.replace('/onboard');
  }, [user]);

  const submit = async () => {
    setErr(null);
    setNeedsConfirmation(false);
    if (name.trim().length < 2) { setErr('Please enter your name (at least 2 characters).'); return; }
    if (!email.trim()) { setErr('Please enter your email address.'); return; }
    if (!email.includes('@') || email.indexOf('@') < 1) { setErr('Please enter a valid email address.'); return; }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setBusy(true);
    const result = await signUpWithEmail(email.trim(), pw, name.trim());
    setBusy(false);
    if (result.error) { setErr(result.error); return; }
    if (result.needsConfirmation) setNeedsConfirmation(true);
  };

  if (needsConfirmation) {
    return (
      <View style={[s.safe, { backgroundColor: '#059669' }]}>
        <View style={s.container}>
          <View style={s.brandSection}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>📧</Text>
            </View>
            <Text style={s.brandName}>Check your email</Text>
            <Text style={s.brandTagline}>We sent a magic link to get you started</Text>
          </View>
          <View style={[s.card, { alignItems: 'center', paddingVertical: 40 }]}>
            <Text style={{ fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 24 }}>
              We sent a confirmation link to{'\n'}
              <Text style={{ fontWeight: '700', color: '#1a1a2e' }}>{email}</Text>
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
              Click the link to verify your account and get started.
            </Text>
            <Link href="/auth/login" style={[s.backLink, { marginTop: 24 }]}>
              <Text style={{ color: '#059669', fontSize: 16, fontWeight: '700' }}>← Back to sign in</Text>
            </Link>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[s.safe, { backgroundColor: '#059669' }]}
    >
      <View style={s.container}>
        <View style={s.brandSection}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🚀</Text>
          </View>
          <Text style={s.brandName}>Turbo Academy</Text>
          <Text style={s.brandTagline}>Start your 28-day AI journey</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Create your account</Text>
          <Text style={s.cardSubtitle}>Free to start, no credit card required</Text>

          <Field
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
            textContentType="name"
          />

          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          <Field
            value={pw}
            onChangeText={setPw}
            placeholder="Password (6+ characters)"
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            autoComplete="new-password"
          />

          {err ? (
            <View style={s.errorPill}>
              <Text style={s.errorText}>{err}</Text>
            </View>
          ) : null}

          <Button
            title={busy ? 'Creating account…' : 'Create free account'}
            onPress={submit}
            disabled={busy}
          />

          <Text style={s.termsText}>
            By signing up you agree to our Terms and Privacy Policy
          </Text>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <Link href="/auth/login" style={s.loginLink}>
            <Text style={s.loginLinkText}>Already have an account? Sign in →</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  cardSubtitle: { fontSize: 15, color: '#6b7280', marginBottom: 8 },
  errorPill: {
    backgroundColor: '#fef2f2', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '600' as const },
  termsText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { color: '#9ca3af', fontSize: 13, fontWeight: '600' as const },
  loginLink: { backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  loginLinkText: { color: '#059669', fontSize: 16, fontWeight: '700' as const },
  backLink: { alignItems: 'center' },
});
