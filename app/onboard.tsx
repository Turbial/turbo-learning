// ─── Onboarding — redesigned with illustrations, bolder progress indicator ───

import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../src/theme/tokens";
import { useAuth } from "../src/data/useAuth";
import { useProfile, useUpdateProfile, useEnroll } from "../src/data/queries";

const goals = [
  { key: "automate", label: "Automate my work", emoji: "⚡", desc: "Build AI workflows that save hours" },
  { key: "career", label: "Advance my career", emoji: "📈", desc: "Stand out with AI operator skills" },
  { key: "business", label: "Start an AI business", emoji: "🚀", desc: "Turn AI skills into income" },
  { key: "learn", label: "Understand AI better", emoji: "🧠", desc: "Go from user to operator" },
  { key: "systems", label: "Build AI systems", emoji: "🏗️", desc: "Create tools that work for you" },
];

const times = [
  { key: "Morning", emoji: "🌅", label: "Morning" },
  { key: "Afternoon", emoji: "☀️", label: "Afternoon" },
  { key: "Evening", emoji: "🌆", label: "Evening" },
  { key: "Night", emoji: "🌙", label: "Night" },
];

const steps = [
  { emoji: "👋", title: "Welcome!", subtitle: "Let's set up your learning journey" },
  { emoji: "📝", title: "Your Name", subtitle: "What should we call you?" },
  { emoji: "🎯", title: "Your Goal", subtitle: "What brings you to AI Operator?" },
  { emoji: "⏱️", title: "Your Rhythm", subtitle: "Set your learning habits" },
];

export default function OnboardScreen() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [dailyMins, setDailyMins] = useState(15);
  const [learnTime, setLearnTime] = useState("Morning");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const enroll = useEnroll();

  if (profile?.onboarded) {
    router.replace("/(tabs)/home");
    return null;
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#059669' }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🚀</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' }}>Loading your journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = 4;

  const handleComplete = async () => {
    if (user) {
      setSaving(true);
      try {
        await updateProfile.mutateAsync({
          name: name.trim() || undefined,
          goal,
          dailyMins,
          learnTime,
          onboarded: true,
        });
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
      <View style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                i < step && styles.progressDotDone,
                i === step && styles.progressDotActive,
              ]}>
                {i < step ? (
                  <Text style={styles.progressCheck}>✓</Text>
                ) : (
                  <Text style={[
                    styles.progressNum,
                    i === step && styles.progressNumActive,
                  ]}>{i + 1}</Text>
                )}
              </View>
              {i < totalSteps - 1 && (
                <View style={[
                  styles.progressLine,
                  i < step && styles.progressLineDone,
                ]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step header */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepEmoji}>{steps[step].emoji}</Text>
            <Text style={styles.stepTitle}>{steps[step].title}</Text>
            <Text style={styles.stepSubtitle}>{steps[step].subtitle}</Text>
          </View>

          {/* Step 0: Name */}
          {step === 0 && (
            <View style={styles.stepBody}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <View style={styles.stepBody}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.goalCard, goal === g.key && styles.goalCardSelected]}
                  onPress={() => setGoal(g.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.goalEmoji}>{g.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalLabel, goal === g.key && styles.goalLabelSelected]}>
                      {g.label}
                    </Text>
                    <Text style={styles.goalDesc}>{g.desc}</Text>
                  </View>
                  {goal === g.key && <Text style={styles.goalCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 2: Daily minutes */}
          {step === 2 && (
            <View style={styles.stepBody}>
              <Text style={styles.sectionLabel}>Minutes per day</Text>
              <View style={styles.minsRow}>
                {[5, 10, 15, 20, 30].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.minChip, dailyMins === m && styles.minChipSelected]}
                    onPress={() => setDailyMins(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.minNum, dailyMins === m && styles.minNumSelected]}>{m}</Text>
                    <Text style={[styles.minUnit, dailyMins === m && styles.minUnitSelected]}>min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Best time to learn</Text>
              <View style={styles.timesRow}>
                {times.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.timeCard, learnTime === t.key && styles.timeCardSelected]}
                    onPress={() => setLearnTime(t.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeEmoji}>{t.emoji}</Text>
                    <Text style={[styles.timeLabel, learnTime === t.key && styles.timeLabelSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Review & Start */}
          {step === 3 && (
            <View style={styles.stepBody}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>👤</Text>
                  <View>
                    <Text style={styles.summaryLabel}>Name</Text>
                    <Text style={styles.summaryValue}>{name || "Anonymous"}</Text>
                  </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>{goals.find(g => g.key === goal)?.emoji ?? "🎯"}</Text>
                  <View>
                    <Text style={styles.summaryLabel}>Goal</Text>
                    <Text style={styles.summaryValue}>{goals.find(g => g.key === goal)?.label ?? "Not set"}</Text>
                  </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>⏱️</Text>
                  <View>
                    <Text style={styles.summaryLabel}>Daily commitment</Text>
                    <Text style={styles.summaryValue}>{dailyMins} min · {learnTime}s</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom nav */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomRow}>
            {step > 0 ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(step - 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            {step < 3 ? (
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  (step === 0 && !name.trim()) && styles.nextBtnDisabled,
                  (step === 1 && !goal) && styles.nextBtnDisabled,
                ]}
                onPress={() => setStep(step + 1)}
                disabled={(step === 0 && !name.trim()) || (step === 1 && !goal)}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, saving && { opacity: 0.7 }]}
                onPress={handleComplete}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>
                  {saving ? 'Starting...' : 'Start My Journey 🚀'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    gap: 0,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  progressDotDone: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  progressDotActive: {
    backgroundColor: '#fff',
    borderColor: '#059669',
    borderWidth: 3,
  },
  progressCheck: { color: '#fff', fontSize: 14, fontWeight: '700' },
  progressNum: { color: '#9ca3af', fontSize: 14, fontWeight: '700' },
  progressNumActive: { color: '#059669' },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  progressLineDone: { backgroundColor: '#059669' },

  // Scroll content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },

  // Step header
  stepHeader: { alignItems: 'center', paddingTop: 20, marginBottom: 32 },
  stepEmoji: { fontSize: 56, marginBottom: 12 },
  stepTitle: { fontSize: 26, fontWeight: '800' as const, color: '#1a1a2e', textAlign: 'center' },
  stepSubtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 6, lineHeight: 22 },
  stepBody: { gap: 12 },

  // Name input
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: '#1a1a2e',
    textAlign: 'center',
    fontWeight: '600' as const,
  },

  // Goals
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  goalCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  goalEmoji: { fontSize: 28 },
  goalLabel: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a2e' },
  goalLabelSelected: { color: '#059669' },
  goalDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  goalCheck: { fontSize: 18, color: '#059669', fontWeight: '700' },

  // Minutes + time
  sectionLabel: { fontSize: 15, fontWeight: '700' as const, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: 1 },
  minsRow: { flexDirection: 'row', gap: 10 },
  minChip: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  minChipSelected: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  minNum: { fontSize: 22, fontWeight: '800' as const, color: '#1a1a2e' },
  minNumSelected: { color: '#059669' },
  minUnit: { fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: '600' as const },
  minUnitSelected: { color: '#059669' },

  timesRow: { flexDirection: 'row', gap: 10 },
  timeCard: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 16,
    borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  timeCardSelected: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  timeEmoji: { fontSize: 24 },
  timeLabel: { fontSize: 13, fontWeight: '600' as const, color: '#6b7280' },
  timeLabelSelected: { color: '#059669', fontWeight: '700' as const },

  // Summary
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryIcon: { fontSize: 28 },
  summaryLabel: { fontSize: 12, fontWeight: '600' as const, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  summaryValue: { fontSize: 17, fontWeight: '700' as const, color: '#1a1a2e', marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: '#e5e7eb' },

  // Bottom bar
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 20,
    paddingBottom: 32,
  },
  bottomRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16,
    borderWidth: 2, borderColor: '#e5e7eb',
  },
  backBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#6b7280' },
  nextBtn: {
    flex: 2, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16,
    backgroundColor: '#059669',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#fff' },
});
