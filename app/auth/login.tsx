// app/auth/login.tsx
import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/data/useAuth";
import { Field } from "../../src/components/ui/Field";
import { Button } from "../../src/components/ui/Button";
import { appTheme as t } from "../../src/theme/appTheme";

export default function Login() {
  const router = useRouter();
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (user) router.replace("/onboard");
  }, [user]);

  const submit = async () => {
    setErr(null);
    if (!email.trim()) { setErr("Please enter your email address."); return; }
    if (!email.includes("@") || email.indexOf("@") < 1) { setErr("Please enter a valid email address."); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    const { error } = await signInWithEmail(email.trim(), pw);
    setBusy(false);
    if (error) setErr(error);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[s.safe, { backgroundColor: t.hero.bg }]}
    >
      <View style={s.container}>
        {/* Branding */}
        <View style={s.brandSection}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🌊</Text>
          </View>
          <Text style={s.brandName}>Turbo Learning</Text>
          <Text style={s.brandTagline}>AI Operator · 28-Day Program</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSubtitle}>Sign in to continue your journey</Text>

          <Field value={email} onChangeText={setEmail} placeholder="Email address"
            autoCapitalize="none" keyboardType="email-address"
            textContentType="emailAddress" autoComplete="email" />

          <Field value={pw} onChangeText={setPw} placeholder="Password"
            secureTextEntry autoCapitalize="none"
            textContentType="password" autoComplete="password" />

          {err && (
            <View style={s.errorPill}>
              <Text style={s.errorText}>{err}</Text>
            </View>
          )}

          <Button title={busy ? "Signing in…" : "Sign in"} onPress={submit} disabled={busy} />

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
  safe:      { flex: 1 },
  container: { flex: 1, justifyContent: "flex-end" },
  brandSection: { alignItems: "center", paddingBottom: 32, paddingTop: 80 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  logoEmoji:    { fontSize: 34 },
  brandName:    { fontSize: 28, fontWeight: t.text.weightExtrabold, color: "#fff", letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: t.text.weightSemibold, marginTop: 4 },

  card: {
    backgroundColor: t.colors.cardBg,
    borderTopLeftRadius: t.radius.xxl,
    borderTopRightRadius: t.radius.xxl,
    padding: 24, paddingBottom: 40, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 10,
  },
  cardTitle:    { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { fontSize: t.text.bodyMd, color: t.colors.textMuted, marginBottom: 8 },

  errorPill: {
    backgroundColor: t.colors.errorBg, borderRadius: t.radius.md, padding: 12,
    borderWidth: 1, borderColor: "#fecaca",
  },
  errorText: { color: t.colors.error, fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold },

  forgotLink:  { textAlign: "center", color: t.colors.textMuted, fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold },
  divider:     { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: t.colors.border },
  dividerText: { color: t.colors.textDisabled, fontSize: 13, fontWeight: t.text.weightSemibold },

  registerLink:     { backgroundColor: t.colors.accentTint, paddingVertical: 14, borderRadius: t.radius.lg, alignItems: "center" },
  registerLinkText: { color: t.colors.accent, fontSize: t.text.body, fontWeight: t.text.weightBold },
});
