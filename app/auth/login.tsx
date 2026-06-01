// app/auth/login.tsx — redesigned login with branding
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../src/theme/tokens';

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (user) router.replace('/onboard');
  }, [user]);

  const submit = async () => {
    setErr(null);
    if (!email.trim()) { setErr('Please enter your email address.'); return; }
    if (!email.includes('@') || email.indexOf('@') < 1) { setErr('Please enter a valid email address.'); return; }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setBusy(true);
    const { error } = await signInWithEmail(email.trim(), pw);
    setBusy(false);
    if (error) setErr(error);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[s.safe, { backgroundColor: '#059669' }]}
    >
      <View style={s.container}>
        {/* Top section with branding */}
        <View style={s.brandSection}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🚀</Text>
          </View>
          <Text style={s.brandName}>Turbo Academy</Text>
          <Text style={s.brandTagline}>AI Operator · 28-Day Program</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSubtitle}>Sign in to continue your journey</Text>

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
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            autoComplete="password"
          />

          {err ? (
            <View style={s.errorPill}>
              <Text style={s.errorText}>{err}</Text>
            </View>
          ) : null}

          <Button
            title={busy ? 'Signing in…' : 'Sign in'}
            onPress={submit}
            disabled={busy}
          />

          <Link href="/auth/forgot-password" style={s.forgotLink}>
            Forgot password?
          </Link>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <Link href="/auth/register" style={s.registerLink}>
            <Text style={s.registerLinkText}>Create a free account →</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-end' },
  brandSection: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 80,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 34 },
  brandName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600' as const,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1a1a2e',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 8,
  },
  errorPill: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '600' as const },
  forgotLink: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  registerLink: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
