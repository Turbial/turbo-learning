// app/auth/register.tsx — registration (name, email, password).
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Register() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signUpWithEmail, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (user) router.replace('/onboard');
  }, [user]);

  const submit = async () => {
    setErr(null);
    setNeedsConfirmation(false);

    // Validate
    if (name.trim().length < 2) {
      setErr('Please enter your name (at least 2 characters).');
      return;
    }
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
    const result = await signUpWithEmail(email.trim(), pw, name.trim());
    setBusy(false);

    if (result.error) {
      setErr(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setNeedsConfirmation(true);
    }
    // If auto-confirmed, the AuthGate will redirect via the user state change
  };

  // Show confirmation message instead of form
  if (needsConfirmation) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
          gap: spacing.md,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            textAlign: 'center',
          }}
        >
          Check your email
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fontSize.bodyLg,
            lineHeight: 22,
            textAlign: 'center',
          }}
        >
          We sent a confirmation link to {email}. Click the link to verify your
          account and get started.
        </Text>
        <Link
          href="/auth/login"
          style={{ color: colors.accent, fontSize: fontSize.body }}
        >
          Back to sign in
        </Link>
      </View>
    );
  }

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
            textAlign: 'center',
          }}
        >
          Create your account
        </Text>

        <Field
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
          textContentType="name"
        />

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
          placeholder="Password (6+ characters)"
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
          autoComplete="new-password"
        />

        {err ? (
          <Text style={{ color: colors.error, fontSize: fontSize.body }}>
            {err}
          </Text>
        ) : null}

        <Button
          title={busy ? 'Creating…' : 'Create account'}
          onPress={submit}
          disabled={busy}
        />

        <Link
          href="/auth/login"
          style={{ color: colors.textMuted, fontSize: fontSize.body }}
        >
          Already have an account? Sign in
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
