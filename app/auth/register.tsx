// app/auth/register.tsx — registration (name, email, password).
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Register() {
  const { colors } = useTheme(); const router = useRouter();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(null);
    if (name.trim().length < 2 || !email.includes('@') || pw.length < 6) { setErr('Fill all fields (password 6+ chars).'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { name } } });
    setBusy(false);
    if (error) setErr(error.message); else router.replace('/home');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: fontSize.display, fontWeight: fontWeight.bold }}>Create your account</Text>
        <Field value={name} onChangeText={setName} placeholder="Your name" />
        <Field value={email} onChangeText={setEmail} placeholder="Email" />
        <Field value={pw} onChangeText={setPw} placeholder="Password (6+ characters)" />
        {err ? <Text style={{ color: colors.error, fontSize: fontSize.body }}>{err}</Text> : null}
        <Button title={busy ? 'Creating…' : 'Create account'} onPress={submit} disabled={busy} />
        <Link href="/auth/login" style={{ color: colors.textMuted, fontSize: fontSize.body }}>Already have an account? Sign in</Link>
      </View>
    </KeyboardAvoidingView>
  );
}
