// ─── Onboarding — ocean/aqua theme ───────────────────────────────────────────

import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { appTheme as t } from "../src/theme/appTheme";
import { useAuth } from "../src/data/useAuth";
import { useProfile, useUpdateProfile, useEnroll } from "../src/data/queries";

const goals = [
  { key: "automate", label: "Automate my work",       emoji: "⚡", desc: "Build AI workflows that save hours" },
  { key: "career",   label: "Advance my career",      emoji: "📈", desc: "Stand out with AI operator skills" },
  { key: "business", label: "Start an AI business",   emoji: "🚀", desc: "Turn AI skills into income" },
  { key: "learn",    label: "Understand AI better",   emoji: "🧠", desc: "Go from user to operator" },
  { key: "systems",  label: "Build AI systems",       emoji: "🏗️", desc: "Create tools that work for you" },
];

const times = [
  { key: "Morning",   emoji: "🌅", label: "Morning" },
  { key: "Afternoon", emoji: "☀️", label: "Afternoon" },
  { key: "Evening",   emoji: "🌆", label: "Evening" },
  { key: "Night",     emoji: "🌙", label: "Night" },
];

const steps = [
  { emoji: "👋", title: "Welcome!",    subtitle: "Let's set up your learning journey" },
  { emoji: "📝", title: "Your Name",   subtitle: "What should we call you?" },
  { emoji: "🎯", title: "Your Goal",   subtitle: "What brings you to AI Operator?" },
  { emoji: "⏱️", title: "Your Rhythm", subtitle: "Set your learning habits" },
];

export default function OnboardScreen() {
  const [step, setStep]           = useState(0);
  const [goal, setGoal]           = useState("");
  const [dailyMins, setDailyMins] = useState(15);
  const [learnTime, setLearnTime] = useState("Morning");
  const [name, setName]           = useState("");
  const [saving, setSaving]       = useState(false);

  const { user }                           = useAuth();
  const { data: profile, isLoading }       = useProfile();
  const updateProfile                      = useUpdateProfile();
  const enroll                             = useEnroll();

  if (profile?.onboarded) { router.replace("/(tabs)/home"); return null; }

  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: t.hero.bg }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌊</Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: t.text.weightSemibold }}>
            Loading your journey...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleComplete = async () => {
    if (user) {
      setSaving(true);
      try {
        await updateProfile.mutateAsync({ name: name.trim() || undefined, goal, dailyMins, learnTime, onboarded: true });
        enroll.mutate({ programSlug: "ai-operator" });
      } catch (e) {
        console.error("Failed to save onboarding:", e);
        setSaving(false);
        return;
      }
    }
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        {/* Progress bar */}
        <View style={s.progressRow}>
          {steps.map((_, i) => (
            <View key={i} style={s.progressStep}>
              <View style={[s.progressDot, i < step && s.progressDotDone, i === step && s.progressDotActive]}>
                {i < step
                  ? <Text style={s.progressCheck}>✓</Text>
                  : <Text style={[s.progressNum, i === step && s.progressNumActive]}>{i + 1}</Text>
                }
              </View>
              {i < steps.length - 1 && (
                <View style={[s.progressLine, i < step && s.progressLineDone]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Step header */}
          <View style={s.stepHeader}>
            <Text style={s.stepEmoji}>{steps[step]!.emoji}</Text>
            <Text style={s.stepTitle}>{steps[step]!.title}</Text>
            <Text style={s.stepSubtitle}>{steps[step]!.subtitle}</Text>
          </View>

          {/* Step 0: Name */}
          {step === 0 && (
            <View style={s.stepBody}>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={t.colors.textDisabled}
                autoFocus
              />
            </View>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <View style={s.stepBody}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[s.goalCard, goal === g.key && s.goalCardSelected]}
                  onPress={() => setGoal(g.key)}
                  activeOpacity={0.7}
                >
                  <Text style={s.goalEmoji}>{g.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.goalLabel, goal === g.key && s.goalLabelSelected]}>{g.label}</Text>
                    <Text style={s.goalDesc}>{g.desc}</Text>
                  </View>
                  {goal === g.key && <Text style={s.goalCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 2: Daily minutes + time */}
          {step === 2 && (
            <View style={s.stepBody}>
              <Text style={s.sectionLabel}>Minutes per day</Text>
              <View style={s.minsRow}>
                {[5, 10, 15, 20, 30].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[s.minChip, dailyMins === m && s.minChipSelected]}
                    onPress={() => setDailyMins(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.minNum, dailyMins === m && s.minNumSelected]}>{m}</Text>
                    <Text style={[s.minUnit, dailyMins === m && s.minUnitSelected]}>min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.sectionLabel, { marginTop: 28 }]}>Best time to learn</Text>
              <View style={s.timesRow}>
                {times.map((tm) => (
                  <TouchableOpacity
                    key={tm.key}
                    style={[s.timeCard, learnTime === tm.key && s.timeCardSelected]}
                    onPress={() => setLearnTime(tm.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.timeEmoji}>{tm.emoji}</Text>
                    <Text style={[s.timeLabel, learnTime === tm.key && s.timeLabelSelected]}>
                      {tm.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <View style={s.stepBody}>
              <View style={s.summaryCard}>
                <View style={s.summaryRow}>
                  <Text style={s.summaryIcon}>👤</Text>
                  <View>
                    <Text style={s.summaryLabel}>Name</Text>
                    <Text style={s.summaryValue}>{name || "Anonymous"}</Text>
                  </View>
                </View>
                <View style={s.summaryDivider} />
                <View style={s.summaryRow}>
                  <Text style={s.summaryIcon}>{goals.find((g) => g.key === goal)?.emoji ?? "🎯"}</Text>
                  <View>
                    <Text style={s.summaryLabel}>Goal</Text>
                    <Text style={s.summaryValue}>{goals.find((g) => g.key === goal)?.label ?? "Not set"}</Text>
                  </View>
                </View>
                <View style={s.summaryDivider} />
                <View style={s.summaryRow}>
                  <Text style={s.summaryIcon}>⏱️</Text>
                  <View>
                    <Text style={s.summaryLabel}>Daily commitment</Text>
                    <Text style={s.summaryValue}>{dailyMins} min · {learnTime}s</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom nav */}
        <View style={s.bottomBar}>
          <View style={s.bottomRow}>
            {step > 0 ? (
              <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)} activeOpacity={0.7}>
                <Text style={s.backBtnText}>← Back</Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            {step < 3 ? (
              <TouchableOpacity
                style={[s.nextBtn, ((step === 0 && !name.trim()) || (step === 1 && !goal)) && s.nextBtnDisabled]}
                onPress={() => setStep(step + 1)}
                disabled={(step === 0 && !name.trim()) || (step === 1 && !goal)}
                activeOpacity={0.8}
              >
                <Text style={s.nextBtnText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.nextBtn, saving && { opacity: 0.7 }]}
                onPress={handleComplete}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={s.nextBtnText}>{saving ? "Starting..." : "Start My Journey 🚀"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: t.colors.screenBg },
  container: { flex: 1 },

  // Progress
  progressRow:  { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, paddingHorizontal: 40, gap: 0 },
  progressStep: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressDot:  { width: 32, height: 32, borderRadius: 16, backgroundColor: t.colors.accentTint, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: t.colors.border },
  progressDotDone:   { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
  progressDotActive: { backgroundColor: t.colors.cardBg, borderColor: t.colors.accent, borderWidth: 3 },
  progressCheck:     { color: "#fff", fontSize: 14, fontWeight: t.text.weightBold },
  progressNum:       { color: t.colors.textDisabled, fontSize: 14, fontWeight: t.text.weightBold },
  progressNumActive: { color: t.colors.accent },
  progressLine:      { flex: 1, height: 3, backgroundColor: t.colors.border, marginHorizontal: 4 },
  progressLineDone:  { backgroundColor: t.colors.accent },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },

  // Step header
  stepHeader:   { alignItems: "center", paddingTop: 20, marginBottom: 32 },
  stepEmoji:    { fontSize: 56, marginBottom: 12 },
  stepTitle:    { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, textAlign: "center" },
  stepSubtitle: { fontSize: t.text.body, color: t.colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 22 },
  stepBody:     { gap: 12 },

  // Name input
  input: {
    backgroundColor: t.colors.inputBg, borderWidth: 2, borderColor: t.colors.border,
    borderRadius: t.radius.lg, padding: 16,
    fontSize: t.text.h2, color: t.colors.textPrimary,
    textAlign: "center", fontWeight: t.text.weightSemibold,
  },

  // Goals
  goalCard: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 16,
    borderRadius: t.radius.lg, borderWidth: 2, borderColor: t.colors.border,
    backgroundColor: t.colors.inputBg,
  },
  goalCardSelected: { borderColor: t.colors.accent, backgroundColor: t.colors.accentTint },
  goalEmoji:        { fontSize: 28 },
  goalLabel:        { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textPrimary },
  goalLabelSelected:{ color: t.colors.accent },
  goalDesc:         { fontSize: 13, color: t.colors.textMuted, marginTop: 2 },
  goalCheck:        { fontSize: 18, color: t.colors.accent, fontWeight: t.text.weightBold },

  // Minutes + times
  sectionLabel: { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: t.colors.textMuted, marginBottom: 12, textTransform: "uppercase" as any, letterSpacing: 1 },
  minsRow:      { flexDirection: "row", gap: 10 },
  minChip: {
    flex: 1, alignItems: "center", paddingVertical: 16,
    borderRadius: t.radius.lg, borderWidth: 2, borderColor: t.colors.border,
    backgroundColor: t.colors.inputBg,
  },
  minChipSelected:  { borderColor: t.colors.accent, backgroundColor: t.colors.accentTint },
  minNum:           { fontSize: 22, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  minNumSelected:   { color: t.colors.accent },
  minUnit:          { fontSize: 11, color: t.colors.textDisabled, marginTop: 2, fontWeight: t.text.weightSemibold },
  minUnitSelected:  { color: t.colors.accent },
  timesRow:         { flexDirection: "row", gap: 10 },
  timeCard: {
    flex: 1, alignItems: "center", gap: 6, paddingVertical: 16,
    borderRadius: t.radius.lg, borderWidth: 2, borderColor: t.colors.border,
    backgroundColor: t.colors.inputBg,
  },
  timeCardSelected:  { borderColor: t.colors.accent, backgroundColor: t.colors.accentTint },
  timeEmoji:         { fontSize: 24 },
  timeLabel:         { fontSize: 13, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  timeLabelSelected: { color: t.colors.accent, fontWeight: t.text.weightBold },

  // Summary
  summaryCard: {
    backgroundColor: t.colors.inputBg, borderRadius: t.radius.lg, padding: 20,
    borderWidth: 2, borderColor: t.colors.border, gap: 16,
  },
  summaryRow:     { flexDirection: "row", alignItems: "center", gap: 14 },
  summaryIcon:    { fontSize: 28 },
  summaryLabel:   { fontSize: 12, fontWeight: t.text.weightSemibold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  summaryValue:   { fontSize: t.text.h2, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: t.colors.border },

  // Bottom bar
  bottomBar: { borderTopWidth: 1, borderTopColor: t.colors.border, padding: 20, paddingBottom: 32 },
  bottomRow: { flexDirection: "row", gap: 12 },
  backBtn:   { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: t.radius.lg, borderWidth: 2, borderColor: t.colors.border },
  backBtnText:    { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textMuted },
  nextBtn:        { flex: 2, alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: t.radius.lg, backgroundColor: t.colors.accent },
  nextBtnDisabled:{ opacity: 0.4 },
  nextBtnText:    { fontSize: t.text.body, fontWeight: t.text.weightBold, color: "#fff" },
});
