// app/auth/register.tsx
import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/data/useAuth";
import { appTheme as t } from "../../src/theme/appTheme";

export default function Register() {
  const router = useRouter();
  const { signUpWithEmail, user } = useAuth();
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [pw, setPw]                   = useState("");
  const [err, setErr]                 = useState<string | null>(null);
  const [busy, setBusy]               = useState(false);
  const [needsConfirmation, setNeeds] = useState(false);

  React.useEffect(() => { if (user) router.replace("/onboard"); }, [user]);

  const submit = async () => {
    setErr(null); setNeeds(false);
    if (name.trim().length < 2)                        { setErr("Please enter your name (at least 2 characters)."); return; }
    if (!email.trim())                                  { setErr("Please enter your email."); return; }
    if (!email.includes("@") || email.indexOf("@") < 1) { setErr("Please enter a valid email."); return; }
    if (pw.length < 6)                                  { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    const result = await signUpWithEmail(email.trim(), pw, name.trim());
    setBusy(false);
    if (result.error) { setErr(result.error); return; }
    if (result.needsConfirmation) setNeeds(true);
  };

  if (needsConfirmation) {
    return (
      <View style={[s.root, { justifyContent: "flex-end" }]}>
        <View style={[s.ring, s.rA]} /><View style={[s.ring, s.rB]} /><View style={[s.ring, s.rC]} />
        <View style={s.brand}>
          <View style={s.logoWrap}><Text style={s.logoEmoji}>📧</Text></View>
          <Text style={s.brandName}>Check your email</Text>
          <Text style={s.brandTag}>We sent a magic link to get you started</Text>
        </View>
        <View style={[s.card, { alignItems: "center", paddingVertical: 40, gap: 12 }]}>
          <Text style={{ fontSize: t.text.body, color: t.colors.textBody, textAlign: "center", lineHeight: 26 }}>
            We sent a confirmation link to{"\n"}
            <Text style={{ fontWeight: t.text.weightBold, color: t.colors.textPrimary }}>{email}</Text>
          </Text>
          <Text style={{ fontSize: t.text.bodyMd, color: t.colors.textMuted, textAlign: "center" }}>
            Click the link to verify and get started.
          </Text>
          <Link href="/auth/login">
            <View style={[s.altBtn, { marginTop: 8 }]}>
              <Text style={s.altBtnTxt}>← Back to sign in</Text>
            </View>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.root}>
      <View style={s.hero}>
        <View style={[s.ring, s.rA]} /><View style={[s.ring, s.rB]} />
        <View style={[s.ring, s.rC]} /><View style={[s.ring, s.rD]} />
        <View style={s.brand}>
          <View style={s.logoWrap}><Text style={s.logoEmoji}>🌊</Text></View>
          <Text style={s.brandName}>Turbo Learning</Text>
          <Text style={s.brandTag}>Start your 28-day AI journey</Text>
        </View>
      </View>

      <ScrollView style={{ backgroundColor: t.colors.cardBg }} contentContainerStyle={s.card} keyboardShouldPersistTaps="handled">
        <Text style={s.cardTitle}>Create your account</Text>
        <Text style={s.cardSub}>Free to start · no credit card required</Text>

        <TextInput style={s.input} value={name} onChangeText={setName}
          placeholder="Your full name" placeholderTextColor={t.colors.textDisabled}
          autoCapitalize="words" textContentType="name" />
        <TextInput style={s.input} value={email} onChangeText={setEmail}
          placeholder="Email address" placeholderTextColor={t.colors.textDisabled}
          autoCapitalize="none" keyboardType="email-address"
          textContentType="emailAddress" autoComplete="email" />
        <TextInput style={s.input} value={pw} onChangeText={setPw}
          placeholder="Password (6+ characters)" placeholderTextColor={t.colors.textDisabled}
          secureTextEntry autoCapitalize="none"
          textContentType="newPassword" autoComplete="new-password" />

        {err && <View style={s.errPill}><Text style={s.errText}>{err}</Text></View>}

        <TouchableOpacity style={[s.btn, busy && s.btnBusy]} onPress={submit} disabled={busy} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{busy ? "Creating account…" : "Create free account"}</Text>
        </TouchableOpacity>

        <Text style={s.terms}>By signing up you agree to our Terms and Privacy Policy</Text>

        <View style={s.divider}>
          <View style={s.divLine} /><Text style={s.divTxt}>or</Text><View style={s.divLine} />
        </View>

        <Link href="/auth/login">
          <View style={s.altBtn}><Text style={s.altBtnTxt}>Already have an account? Sign in →</Text></View>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.hero.bg },
  hero: { flex: 1, overflow: "hidden", justifyContent: "flex-end", paddingBottom: 28, minHeight: 220 },
  ring: { position: "absolute", borderRadius: 9999 },
  rA: { width: 340, height: 340, top: -120, right: -100, backgroundColor: "rgba(255,255,255,0.06)" },
  rB: { width: 200, height: 200, top: 60,  left: -60,  backgroundColor: "rgba(255,255,255,0.05)" },
  rC: { width: 110, height: 110, top: 40,  right: 40,  backgroundColor: "rgba(255,255,255,0.08)" },
  rD: { width: 60,  height: 60,  top: 100, right: 100, backgroundColor: "rgba(255,255,255,0.10)" },

  brand:     { alignItems: "center", paddingHorizontal: 24 },
  logoWrap:  { width: 72, height: 72, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logoEmoji: { fontSize: 34 },
  brandName: { fontSize: 28, fontWeight: t.text.weightExtrabold, color: "#fff", letterSpacing: -0.5, marginBottom: 4 },
  brandTag:  { fontSize: t.text.bodyMd, color: "rgba(255,255,255,0.7)", fontWeight: t.text.weightMedium },

  card: {
    backgroundColor: t.colors.cardBg,
    borderTopLeftRadius: t.radius.xxl, borderTopRightRadius: t.radius.xxl,
    padding: 28, paddingBottom: 40, gap: 14,
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

  terms:  { fontSize: t.text.caption, color: t.colors.textDisabled, textAlign: "center" },
  divider:{ flexDirection: "row", alignItems: "center", gap: 12 },
  divLine:{ flex: 1, height: 1, backgroundColor: t.colors.border },
  divTxt: { color: t.colors.textDisabled, fontSize: 13, fontWeight: t.text.weightSemibold },
  altBtn: { backgroundColor: t.colors.accentTint, paddingVertical: 14, borderRadius: t.radius.lg, alignItems: "center", minWidth: 200 },
  altBtnTxt: { color: t.colors.accent, fontSize: t.text.body, fontWeight: t.text.weightBold },
});
