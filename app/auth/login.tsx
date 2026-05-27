// app/auth/login.tsx — email + password login.
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(null);
    if (!email.includes('@') || pw.length < 6) { setErr('Enter a valid email and a 6+ character password.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(error.message); else router.replace('/home');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: fontSize.display, fontWeight: fontWeight.bold }}>Welcome back</Text>
        <Field value={email} onChangeText={setEmail} placeholder="Email" />
        <Field value={pw} onChangeText={setPw} placeholder="Password" />
        {err ? <Text style={{ color: colors.error, fontSize: fontSize.body }}>{err}</Text> : null}
        <Button title={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy} />
        <Link href="/auth/forgot-password" style={{ color: colors.accent, fontSize: fontSize.body }}>Forgot password?</Link>
        <Link href="/auth/register" style={{ color: colors.textMuted, fontSize: fontSize.body }}>New here? Create an account</Link>
      </View>
    </KeyboardAvoidingView>
  );
}
