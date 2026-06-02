// app/auth/forgot-password.tsx
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../src/data/supabase";
import { appTheme as t } from "../../src/theme/appTheme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email.trim())                                  { setErr("Please enter your email."); return; }
    if (!email.includes("@") || email.indexOf("@") < 1) { setErr("Please enter a valid email."); return; }
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
    <View style={s.root}>
      {/* Hero background */}
      <View style={s.hero}>
        <View style={[s.ring, s.rA]} /><View style={[s.ring, s.rB]} />
        <View style={[s.ring, s.rC]} />
        <View style={s.brand}>
          <View style={s.logoWrap}><Text style={s.logoEmoji}>🔑</Text></View>
          <Text style={s.brandName}>Reset Password</Text>
          <Text style={s.brandTag}>We'll send you a reset link</Text>
        </View>
      </View>

      {/* Bottom card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Forgot your password?</Text>
        <Text style={s.cardSub}>Enter your email and we'll send you a link to reset it.</Text>

        {sent ? (
          <View style={s.sentBox}>
            <Text style={s.sentEmoji}>📧</Text>
            <Text style={s.sentTitle}>Check your email</Text>
            <Text style={s.sentBody}>
              If an account exists for{"\n"}
              <Text style={{ fontWeight: t.text.weightBold, color: t.colors.textPrimary }}>{email}</Text>
              , a reset link is on its way.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              style={s.input} value={email} onChangeText={setEmail}
              placeholder="Email address" placeholderTextColor={t.colors.textDisabled}
              autoCapitalize="none" keyboardType="email-address"
              textContentType="emailAddress" autoComplete="email"
            />
            {err && <View style={s.errPill}><Text style={s.errText}>{err}</Text></View>}
            <TouchableOpacity style={[s.btn, busy && { opacity: 0.7 }]} onPress={submit} disabled={busy} activeOpacity={0.85}>
              <Text style={s.btnTxt}>{busy ? "Sending…" : "Send reset link"}</Text>
            </TouchableOpacity>
          </>
        )}

        <Link href="/auth/login">
          <Text style={s.backLink}>← Back to sign in</Text>
        </Link>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.hero.bg },
  hero: { flex: 1, overflow: "hidden", justifyContent: "flex-end", paddingBottom: 32, minHeight: 240 },
  ring: { position: "absolute", borderRadius: 9999 },
  rA: { width: 300, height: 300, top: -100, right: -80, backgroundColor: "rgba(255,255,255,0.06)" },
  rB: { width: 160, height: 160, top: 80,  left: -40,  backgroundColor: "rgba(255,255,255,0.05)" },
  rC: { width: 90,  height: 90,  top: 50,  right: 50,  backgroundColor: "rgba(255,255,255,0.09)" },
  brand:     { alignItems: "center", paddingHorizontal: 24 },
  logoWrap:  { width: 72, height: 72, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logoEmoji: { fontSize: 34 },
  brandName: { fontSize: 28, fontWeight: t.text.weightExtrabold, color: "#fff", letterSpacing: -0.5, marginBottom: 4 },
  brandTag:  { fontSize: t.text.bodyMd, color: "rgba(255,255,255,0.7)", fontWeight: t.text.weightMedium },
  card: {
    backgroundColor: t.colors.cardBg, borderTopLeftRadius: t.radius.xxl, borderTopRightRadius: t.radius.xxl,
    padding: 28, paddingBottom: 40, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 12,
  },
  cardTitle: { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  cardSub:   { fontSize: t.text.bodyMd, color: t.colors.textMuted, marginBottom: 4, lineHeight: 22 },
  input: { height: 52, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.inputBg, color: t.colors.textPrimary, paddingHorizontal: t.spacing.md, fontSize: t.text.body },
  errPill: { backgroundColor: t.colors.errorBg, borderRadius: t.radius.md, padding: 12, borderWidth: 1, borderColor: "#fecaca" },
  errText: { color: t.colors.error, fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold },
  btn:    { height: 52, backgroundColor: t.colors.accent, borderRadius: t.radius.lg, alignItems: "center", justifyContent: "center" },
  btnTxt: { color: "#fff", fontSize: t.text.body, fontWeight: t.text.weightExtrabold },
  sentBox:   { backgroundColor: t.colors.accentTint, borderRadius: t.radius.lg, padding: 24, alignItems: "center", gap: 10, borderWidth: 1, borderColor: t.colors.border },
  sentEmoji: { fontSize: 40 },
  sentTitle: { fontSize: t.text.h2, fontWeight: t.text.weightBold, color: t.colors.accentDark },
  sentBody:  { fontSize: t.text.bodyMd, color: t.colors.textBody, textAlign: "center", lineHeight: 22 },
  backLink:  { color: t.colors.accent, fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, textAlign: "center", alignSelf: "center" },
});
