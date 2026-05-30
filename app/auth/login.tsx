// app/auth/login.tsx — email + password login.
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (user) router.replace('/onboard');
  }, [user]);

  const submit = async () => {
    setErr(null);
    // Validate
    if (!email.trim()) {
      setErr('Please enter your email address.');
      return;
    }
    if (!email.includes('@') || email.indexOf('@') < 1) {
      setErr('Please enter a valid email address.');
      return;
    }
    if (pw.length < 6) {
      setErr('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    const { error } = await signInWithEmail(email.trim(), pw);
    setBusy(false);

    if (error) {
      setErr(error);
    }
    // On success, the AuthGate will redirect via the user state change
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
          gap: spacing.md,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: fontSize.display,
            fontWeight: fontWeight.bold,
          }}
        >
          Welcome back
        </Text>

        <Field
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
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
          <Text style={{ color: colors.error, fontSize: fontSize.body }}>
            {err}
          </Text>
        ) : null}

        <Button
          title={busy ? 'Signing in…' : 'Sign in'}
          onPress={submit}
          disabled={busy}
        />

        <Link
          href="/auth/forgot-password"
          style={{ color: colors.accent, fontSize: fontSize.body }}
        >
          Forgot password?
        </Link>

        <Link
          href="/auth/register"
          style={{ color: colors.textMuted, fontSize: fontSize.body }}
        >
          New here? Create an account
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
