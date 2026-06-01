// ─── Onboarding — single-scroll intro, goal setting, program entry ───

import { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../src/theme/tokens";
import { useAuth } from "../src/data/useAuth";
import { useProfile, useUpdateProfile, useEnroll } from "../src/data/queries";

const goals = [
  { key: "automate", label: "Automate my work", emoji: "⚡" },
  { key: "career", label: "Advance my career", emoji: "📈" },
  { key: "business", label: "Start an AI business", emoji: "🚀" },
  { key: "learn", label: "Understand AI better", emoji: "🧠" },
  { key: "systems", label: "Build AI systems", emoji: "🏗️" },
];

const times = ["Morning", "Afternoon", "Evening", "Night"];

export default function OnboardScreen() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [dailyMins, setDailyMins] = useState(15);
  const [learnTime, setLearnTime] = useState("Morning");
  const [name, setName] = useState("");

  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const enroll = useEnroll();

  // already onboarded → skip straight to home
  if (profile?.onboarded) {
    router.replace("/(tabs)/home");
    return null;
  }

  // Show spinner while profile loads (prevents flash of onboarding for returning users)
  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: spacing.md }}>⏳</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    if (user) {
      setSaving(true);
      try {
        // Wait for profile save to complete before redirecting
        await updateProfile.mutateAsync({
          name: name.trim() || undefined,
          goal,
          dailyMins,
          learnTime,
          onboarded: true,
        });
        // Auto-enroll in AI Operator (fire-and-forget)
        enroll.mutate({ programSlug: "ai-operator" });
      } catch (e) {
        console.error('Failed to save onboarding:', e);
        setSaving(false);
        return;
      }
    }
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🏗️</Text>
            <Text style={styles.title}>Welcome to Turbo Academy</Text>
            <Text style={styles.subtitle}>
              28 days to go from AI user → AI operator.{'\n'}
              Build automations, workflows, and your own AI workforce.
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setStep(1)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textDim}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.btn, !name.trim() && styles.btnDisabled]}
              onPress={() => setStep(2)}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>What's your main goal?</Text>
            <View style={styles.goalsGrid}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.goalChip, goal === g.key && styles.goalChipSelected]}
                  onPress={() => setGoal(g.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.goalEmoji}>{g.emoji}</Text>
                  <Text
                    style={[styles.goalLabel, goal === g.key && styles.goalLabelSelected]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.btn, !goal && styles.btnDisabled]}
              onPress={() => setStep(3)}
              disabled={!goal}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Daily commitment */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>⏱️</Text>
            <Text style={styles.title}>Daily commitment</Text>
            <Text style={styles.subtitle}>How many minutes can you commit per day?</Text>

            <View style={styles.minsRow}>
              {[5, 10, 15, 20, 30].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.minChip, dailyMins === m && styles.minChipSelected]}
                  onPress={() => setDailyMins(m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.minLabel, dailyMins === m && styles.minLabelSelected]}
                  >
                    {m}
                  </Text>
                  <Text
                    style={[styles.minUnit, dailyMins === m && styles.minUnitSelected]}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.subtitle, { marginTop: 24 }]}>
              When do you usually learn?
            </Text>
            <View style={styles.timesRow}>
              {times.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, learnTime === t && styles.timeChipSelected]}
                  onPress={() => setLearnTime(t)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.timeLabel, learnTime === t && styles.timeLabelSelected]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btn, saving && { opacity: 0.6 }]}
              onPress={handleComplete}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text style={styles.btnText}>{saving ? 'Saving...' : 'Start Learning'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress dots */}
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.dot, i <= step ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    paddingBottom: 60,
  },
  stepContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  input: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: spacing.lg,
    maxWidth: 340,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  goalChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  goalEmoji: { fontSize: 18 },
  goalLabel: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textSecondary },
  goalLabelSelected: { color: colors.primary },
  minsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.sm,
  },
  minChip: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  minChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  minLabel: { fontSize: fontSize.xl, fontWeight: "800", color: colors.textPrimary },
  minLabelSelected: { color: colors.primary },
  minUnit: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  minUnitSelected: { color: colors.primary },
  timesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: spacing.xl,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  timeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  timeLabel: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textSecondary },
  timeLabelSelected: { color: colors.primary },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: fontSize.lg, fontWeight: "700" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.surfaceBorder },
});
