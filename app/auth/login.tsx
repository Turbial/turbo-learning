// app/auth/login.tsx
import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/data/useAuth";
import { appTheme as t } from "../../src/theme/appTheme";

export default function Login() {
  const router = useRouter();
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");
  const [err, setErr]     = useState<string | null>(null);
  const [busy, setBusy]   = useState(false);

  React.useEffect(() => { if (user) router.replace("/onboard"); }, [user]);

  const submit = async () => {
    setErr(null);
    if (!email.trim())                               { setErr("Please enter your email."); return; }
    if (!email.includes("@") || email.indexOf("@") < 1) { setErr("Please enter a valid email."); return; }
    if (pw.length < 6)                               { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    const { error } = await signInWithEmail(email.trim(), pw);
    setBusy(false);
    if (error) setErr(error);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.root}>
      {/* ── Hero background with caustic rings ── */}
      <View style={s.hero}>
        <View style={[s.ring, s.rA]} />
        <View style={[s.ring, s.rB]} />
        <View style={[s.ring, s.rC]} />
        <View style={[s.ring, s.rD]} />

        <View style={s.brand}>
          <View style={s.logoWrap}>
            <Text style={s.logoEmoji}>🌊</Text>
          </View>
          <Text style={s.brandName}>Turbo Learning</Text>
          <Text style={s.brandTag}>AI Operator · 28-Day Program</Text>
        </View>
      </View>

      {/* ── Bottom card ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Welcome back</Text>
        <Text style={s.cardSub}>Sign in to continue your journey</Text>

        <TextInput style={s.input} value={email} onChangeText={setEmail}
          placeholder="Email address" placeholderTextColor={t.colors.textDisabled}
          autoCapitalize="none" keyboardType="email-address"
          textContentType="emailAddress" autoComplete="email" />

        <TextInput style={s.input} value={pw} onChangeText={setPw}
          placeholder="Password" placeholderTextColor={t.colors.textDisabled}
          secureTextEntry autoCapitalize="none"
          textContentType="password" autoComplete="password" />

        {err && <View style={s.errPill}><Text style={s.errText}>{err}</Text></View>}

        <TouchableOpacity style={[s.btn, busy && s.btnBusy]} onPress={submit} disabled={busy} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{busy ? "Signing in…" : "Sign in"}</Text>
        </TouchableOpacity>

        <Link href="/auth/forgot-password">
          <Text style={s.link}>Forgot password?</Text>
        </Link>

        <View style={s.divider}>
          <View style={s.divLine} /><Text style={s.divTxt}>or</Text><View style={s.divLine} />
        </View>

        <Link href="/auth/register">
          <View style={s.altBtn}><Text style={s.altBtnTxt}>Create a free account →</Text></View>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.hero.bg },
  hero: { flex: 1, overflow: "hidden", justifyContent: "flex-end", paddingBottom: 32 },
  ring: { position: "absolute", borderRadius: 9999 },
  rA: { width: 340, height: 340, top: -120, right: -100, backgroundColor: "rgba(255,255,255,0.06)" },
  rB: { width: 200, height: 200, top: 80,  left: -60,  backgroundColor: "rgba(255,255,255,0.05)" },
  rC: { width: 110, height: 110, top: 40,  right: 40,  backgroundColor: "rgba(255,255,255,0.08)" },
  rD: { width: 60,  height: 60,  top: 100, right: 100, backgroundColor: "rgba(255,255,255,0.10)" },

  brand:     { alignItems: "center", paddingHorizontal: 24 },
  logoWrap:  { width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 18 },
  logoEmoji: { fontSize: 38 },
  brandName: { fontSize: 32, fontWeight: t.text.weightExtrabold, color: "#fff", letterSpacing: -0.5, marginBottom: 4 },
  brandTag:  { fontSize: t.text.bodyMd, color: "rgba(255,255,255,0.7)", fontWeight: t.text.weightMedium },

  card: {
    backgroundColor: t.colors.cardBg,
    borderTopLeftRadius: t.radius.xxl, borderTopRightRadius: t.radius.xxl,
    padding: 28, paddingBottom: 40, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 12,
  },
  cardTitle: { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  cardSub:   { fontSize: t.text.bodyMd, color: t.colors.textMuted, marginBottom: 4 },

  input: {
    height: 52, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: t.colors.border,
    backgroundColor: t.colors.inputBg, color: t.colors.textPrimary,
    paddingHorizontal: t.spacing.md, fontSize: t.text.body,
  },

  errPill: { backgroundColor: t.colors.errorBg, borderRadius: t.radius.md, padding: 12, borderWidth: 1, borderColor: "#fecaca" },
  errText: { color: t.colors.error, fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold },

  btn:    { height: 52, backgroundColor: t.colors.accent, borderRadius: t.radius.lg, alignItems: "center", justifyContent: "center" },
  btnBusy:{ opacity: 0.7 },
  btnTxt: { color: "#fff", fontSize: t.text.body, fontWeight: t.text.weightExtrabold, letterSpacing: 0.2 },

  link:   { textAlign: "center", color: t.colors.textMuted, fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold, alignSelf: "center" },
  divider:{ flexDirection: "row", alignItems: "center", gap: 12 },
  divLine:{ flex: 1, height: 1, backgroundColor: t.colors.border },
  divTxt: { color: t.colors.textDisabled, fontSize: 13, fontWeight: t.text.weightSemibold },

  altBtn:   { backgroundColor: t.colors.accentTint, paddingVertical: 14, borderRadius: t.radius.lg, alignItems: "center" },
  altBtnTxt:{ color: t.colors.accent, fontSize: t.text.body, fontWeight: t.text.weightBold },
});
