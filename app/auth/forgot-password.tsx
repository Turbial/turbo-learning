// app/auth/forgot-password.tsx — request reset + confirmation state.
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function ForgotPassword() {
  const { colors } = useTheme();
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setErr(error.message); else setSent(true);
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>Reset your password</Text>
      {sent ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSize.bodyLg, lineHeight: 22 }}>
          If an account exists for {email}, a reset link is on its way.
        </Text>
      ) : (
        <>
          <Field value={email} onChangeText={setEmail} placeholder="Email" />
          {err ? <Text style={{ color: colors.error }}>{err}</Text> : null}
          <Button title="Send reset link" onPress={submit} />
        </>
      )}
      <Link href="/auth/login" style={{ color: colors.accent }}>Back to sign in</Link>
    </View>
  );
}
