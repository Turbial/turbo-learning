// ─── Onboarding ───────────────────────────────────────────────────────────────

import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { appTheme as t } from "../src/theme/appTheme";
import { useAuth } from "../src/data/useAuth";
import { useProfile, useUpdateProfile, useEnroll } from "../src/data/queries";

const goals = [
  { key: "automate", label: "Automate my work",     emoji: "⚡", desc: "Build AI workflows that save hours",    color: t.weekColors[0] },
  { key: "career",   label: "Advance my career",    emoji: "📈", desc: "Stand out with AI operator skills",    color: t.weekColors[1] },
  { key: "business", label: "Start an AI business", emoji: "🚀", desc: "Turn AI skills into income",           color: t.weekColors[2] },
  { key: "learn",    label: "Understand AI better", emoji: "🧠", desc: "Go from user to operator",             color: t.weekColors[3] },
  { key: "systems",  label: "Build AI systems",     emoji: "🏗️", desc: "Create tools that work for you",      color: t.weekColors[0] },
];

const times = [
  { key: "Morning",   emoji: "🌅" },
  { key: "Afternoon", emoji: "☀️" },
  { key: "Evening",   emoji: "🌆" },
  { key: "Night",     emoji: "🌙" },
];

const STEP_META = [
  { emoji: "👋", title: "Welcome!",    subtitle: "Let's set up your learning journey" },
  { emoji: "📝", title: "Your Name",   subtitle: "What should we call you?" },
  { emoji: "🎯", title: "Your Goal",   subtitle: "What brings you to AI Operator?" },
  { emoji: "⏱️", title: "Your Rhythm", subtitle: "Set your learning habits" },
];

export default function OnboardScreen() {
  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("");
  const [goal, setGoal]           = useState("");
  const [dailyMins, setDailyMins] = useState(15);
  const [learnTime, setLearnTime] = useState("Morning");
  const [saving, setSaving]       = useState(false);

  const { user }               = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile          = useUpdateProfile();
  const enroll                 = useEnroll();

  if (profile?.onboarded) { router.replace("/(tabs)/home"); return null; }

  if (isLoading) return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: t.hero.bg }}>
        <View style={[s.loadRing, s.rA]} /><View style={[s.loadRing, s.rB]} />
        <Text style={{ fontSize: 52, marginBottom: 16 }}>🌊</Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: t.text.weightSemibold }}>Loading…</Text>
      </View>
    </SafeAreaView>
  );

  const handleComplete = async () => {
    if (user) {
      setSaving(true);
      try {
        await updateProfile.mutateAsync({ name: name.trim() || undefined, goal, dailyMins, learnTime, onboarded: true });
        enroll.mutate({ programSlug: "ai-operator" });
      } catch (e) { console.error("onboarding error:", e); setSaving(false); return; }
    }
    router.replace("/(tabs)/home");
  };

  const canNext = step === 0 ? name.trim().length > 0
                : step === 1 ? goal !== ""
                : true;

  return (
    <SafeAreaView style={s.safe}>
      {/* Progress bar */}
      <View style={s.progressBar}>
        {STEP_META.map((_, i) => (
          <View key={i} style={s.progressStep}>
            <View style={[s.dot, i < step && s.dotDone, i === step && s.dotActive]}>
              {i < step
                ? <Text style={s.dotCheck}>✓</Text>
                : <Text style={[s.dotNum, i === step && s.dotNumActive]}>{i + 1}</Text>
              }
            </View>
            {i < STEP_META.length - 1 && <View style={[s.line, i < step && s.lineDone]} />}
          </View>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Step header */}
        <View style={s.stepHead}>
          <Text style={s.stepEmoji}>{STEP_META[step]!.emoji}</Text>
          <Text style={s.stepTitle}>{STEP_META[step]!.title}</Text>
          <Text style={s.stepSub}>{STEP_META[step]!.subtitle}</Text>
        </View>

        {/* Step 0 — Name */}
        {step === 0 && (
          <View style={s.stepBody}>
            <TextInput
              style={s.nameInput} value={name} onChangeText={setName}
              placeholder="Your name" placeholderTextColor={t.colors.textDisabled}
              autoFocus autoCapitalize="words"
            />
            <Text style={s.nameHint}>This is how we'll greet you each day</Text>
          </View>
        )}

        {/* Step 1 — Goals */}
        {step === 1 && (
          <View style={s.stepBody}>
            {goals.map((g) => {
              const sel = goal === g.key;
              return (
                <TouchableOpacity
                  key={g.key}
                  style={[s.goalCard, sel && s.goalCardSel]}
                  onPress={() => setGoal(g.key)}
                  activeOpacity={0.75}
                >
                  {/* Accent stripe — like week cards */}
                  <View style={[s.goalStripe, { backgroundColor: sel ? g.color : t.colors.border }]} />
                  <Text style={s.goalEmoji}>{g.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.goalLabel, sel && { color: g.color }]}>{g.label}</Text>
                    <Text style={s.goalDesc}>{g.desc}</Text>
                  </View>
                  {sel && <Text style={[s.goalCheck, { color: g.color }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 2 — Habits */}
        {step === 2 && (
          <View style={s.stepBody}>
            <Text style={s.secLabel}>Minutes per day</Text>
            <View style={s.chipRow}>
              {[5, 10, 15, 20, 30].map((m) => {
                const sel = dailyMins === m;
                return (
                  <TouchableOpacity key={m} style={[s.chip, sel && s.chipSel]} onPress={() => setDailyMins(m)} activeOpacity={0.75}>
                    <Text style={[s.chipNum, sel && s.chipNumSel]}>{m}</Text>
                    <Text style={[s.chipUnit, sel && s.chipUnitSel]}>min</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[s.secLabel, { marginTop: 28 }]}>Best time to learn</Text>
            <View style={s.timesRow}>
              {times.map((tm) => {
                const sel = learnTime === tm.key;
                return (
                  <TouchableOpacity key={tm.key} style={[s.timeCard, sel && s.timeCardSel]} onPress={() => setLearnTime(tm.key)} activeOpacity={0.75}>
                    <Text style={s.timeEmoji}>{tm.emoji}</Text>
                    <Text style={[s.timeLabel, sel && s.timeLabelSel]}>{tm.key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <View style={s.stepBody}>
            <View style={s.summary}>
              {[
                { icon: "👤", label: "Name",             value: name || "Anonymous" },
                { icon: goals.find(g => g.key === goal)?.emoji ?? "🎯", label: "Goal", value: goals.find(g => g.key === goal)?.label ?? "Not set" },
                { icon: "⏱️", label: "Daily commitment", value: `${dailyMins} min · ${learnTime}` },
              ].map((row, i, arr) => (
                <View key={row.label}>
                  <View style={s.sumRow}>
                    <Text style={s.sumIcon}>{row.icon}</Text>
                    <View>
                      <Text style={s.sumLabel}>{row.label}</Text>
                      <Text style={s.sumValue}>{row.value}</Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && <View style={s.sumDiv} />}
                </View>
              ))}
            </View>
            <Text style={s.readyText}>You're all set! Let's start your journey. 🚀</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={s.bottom}>
        <View style={s.bottomRow}>
          {step > 0 ? (
            <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)} activeOpacity={0.75}>
              <Text style={s.backBtnTxt}>← Back</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {step < 3 ? (
            <TouchableOpacity
              style={[s.nextBtn, !canNext && s.nextBtnOff]}
              onPress={() => setStep(step + 1)}
              disabled={!canNext} activeOpacity={0.85}
            >
              <Text style={s.nextBtnTxt}>Continue →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.nextBtn, saving && { opacity: 0.7 }]}
              onPress={handleComplete} disabled={saving} activeOpacity={0.85}
            >
              <Text style={s.nextBtnTxt}>{saving ? "Starting..." : "Start My Journey 🚀"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: t.colors.screenBg },

  loadRing: { position: "absolute", borderRadius: 9999 },
  rA: { width: 300, height: 300, top: -100, right: -80, backgroundColor: "rgba(255,255,255,0.06)" },
  rB: { width: 160, height: 160, top: 80, left: -40, backgroundColor: "rgba(255,255,255,0.05)" },

  // Progress bar
  progressBar:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 32, paddingVertical: 20 },
  progressStep: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot:          { width: 34, height: 34, borderRadius: 17, backgroundColor: t.colors.accentTint, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: t.colors.border },
  dotDone:      { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
  dotActive:    { backgroundColor: t.colors.cardBg, borderColor: t.colors.accent, borderWidth: 2.5 },
  dotCheck:     { color: "#fff", fontSize: 14, fontWeight: t.text.weightBold },
  dotNum:       { color: t.colors.textDisabled, fontSize: 14, fontWeight: t.text.weightBold },
  dotNumActive: { color: t.colors.accent },
  line:         { flex: 1, height: 3, backgroundColor: t.colors.border, marginHorizontal: 4 },
  lineDone:     { backgroundColor: t.colors.accent },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.lg },

  // Step header
  stepHead:  { alignItems: "center", paddingTop: 8, marginBottom: 28 },
  stepEmoji: { fontSize: 60, marginBottom: 14 },
  stepTitle: { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, textAlign: "center" },
  stepSub:   { fontSize: t.text.body, color: t.colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 24 },
  stepBody:  { gap: 12 },

  // Name
  nameInput: {
    height: 56, borderRadius: t.radius.lg, borderWidth: 2, borderColor: t.colors.border,
    backgroundColor: t.colors.inputBg, color: t.colors.textPrimary,
    paddingHorizontal: t.spacing.md, fontSize: t.text.h2, textAlign: "center",
    fontWeight: t.text.weightSemibold,
  },
  nameHint: { textAlign: "center", fontSize: t.text.bodyMd, color: t.colors.textDisabled },

  // Goal cards — week card pattern (left accent stripe)
  goalCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl,
    overflow: "hidden", ...t.cardShadow,
    borderWidth: 1, borderColor: t.colors.border,
  },
  goalCardSel: { borderColor: "transparent" },
  goalStripe:  { width: 5, alignSelf: "stretch" },
  goalEmoji:   { fontSize: 28, paddingHorizontal: 14 },
  goalLabel:   { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textPrimary, paddingTop: 14 },
  goalDesc:    { fontSize: 13, color: t.colors.textMuted, marginTop: 2, paddingBottom: 14 },
  goalCheck:   { fontSize: 20, fontWeight: t.text.weightBold, paddingRight: 14 },

  // Minutes chips (same as filter pills from home)
  secLabel: { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: t.colors.textMuted, textTransform: "uppercase" as any, letterSpacing: 1 },
  chipRow:  { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1, alignItems: "center", paddingVertical: 14,
    borderRadius: t.radius.pill, borderWidth: 1.5, borderColor: t.colors.border,
    backgroundColor: t.colors.cardBg,
  },
  chipSel:     { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
  chipNum:     { fontSize: 20, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  chipNumSel:  { color: "#fff" },
  chipUnit:    { fontSize: 11, color: t.colors.textDisabled, fontWeight: t.text.weightSemibold },
  chipUnitSel: { color: "rgba(255,255,255,0.8)" },

  // Time cards
  timesRow:    { flexDirection: "row", gap: 10 },
  timeCard:    { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.cardBg },
  timeCardSel: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
  timeEmoji:   { fontSize: 24 },
  timeLabel:   { fontSize: 12, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  timeLabelSel:{ color: "#fff", fontWeight: t.text.weightBold },

  // Summary
  summary:    { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, borderWidth: 1, borderColor: t.colors.border, overflow: "hidden", ...t.cardShadow },
  sumRow:     { flexDirection: "row", alignItems: "center", gap: 16, padding: t.spacing.md },
  sumIcon:    { fontSize: 28 },
  sumLabel:   { fontSize: 11, fontWeight: t.text.weightBold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  sumValue:   { fontSize: t.text.h3, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginTop: 2 },
  sumDiv:     { height: 1, backgroundColor: t.colors.borderLight, marginHorizontal: t.spacing.md },
  readyText:  { textAlign: "center", fontSize: t.text.body, color: t.colors.textMuted, marginTop: t.spacing.md, lineHeight: 24 },

  // Bottom nav
  bottom:    { borderTopWidth: 1, borderTopColor: t.colors.border, padding: t.spacing.md, paddingBottom: t.spacing.lg, backgroundColor: t.colors.cardBg },
  bottomRow: { flexDirection: "row", gap: 12 },
  backBtn:   { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: t.colors.border },
  backBtnTxt:{ fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textMuted },
  nextBtn:   { flex: 2, alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: t.radius.lg, backgroundColor: t.colors.accent },
  nextBtnOff:{ opacity: 0.4 },
  nextBtnTxt:{ fontSize: t.text.body, fontWeight: t.text.weightExtrabold, color: "#fff" },
});
