// ─── Onboarding — hero-first flow with animated step transitions ───

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Animated,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/data/useAuth";
import { useProfile, useUpdateProfile, useEnroll } from "../src/data/queries";
import { trackEvent } from "../src/integrations/analytics";

const goals = [
  { key: "automate", label: "Automate my work", emoji: "⚡", desc: "Build AI workflows that save hours" },
  { key: "career",   label: "Advance my career", emoji: "📈", desc: "Stand out with AI operator skills" },
  { key: "business", label: "Start an AI business", emoji: "🚀", desc: "Turn AI skills into income" },
  { key: "learn",    label: "Understand AI better", emoji: "🧠", desc: "Go from user to operator" },
  { key: "systems",  label: "Build AI systems", emoji: "🏗️", desc: "Create tools that work for you" },
];

const times = [
  { key: "Morning",   emoji: "🌅", label: "Morning" },
  { key: "Afternoon", emoji: "☀️", label: "Afternoon" },
  { key: "Evening",   emoji: "🌆", label: "Evening" },
  { key: "Night",     emoji: "🌙", label: "Night" },
];

// 0=welcome  1=name  2=goal  3=schedule  4=summary
const TOTAL_STEPS = 5;

export default function OnboardScreen() {
  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("");
  const [goal, setGoal]           = useState("");
  const [dailyMins, setDailyMins] = useState(15);
  const [learnTime, setLearnTime] = useState("Morning");
  const [saving, setSaving]       = useState(false);

  const slideX        = useRef(new Animated.Value(0)).current;
  const slideOpacity  = useRef(new Animated.Value(1)).current;

  const { user }                         = useAuth();
  const { data: profile, isLoading }     = useProfile();
  const updateProfile                    = useUpdateProfile();
  const enroll                           = useEnroll();

  useEffect(() => { trackEvent({ name: 'onboarding_started' }); }, []);

  if (profile?.onboarded) { router.replace("/(tabs)/home"); return null; }

  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loadingWrap}>
          <Text style={{ fontSize: 52, marginBottom: 14 }}>🤖</Text>
          <Text style={s.loadingText}>Preparing your journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Slide-and-fade transition between steps
  const navigateTo = (next: number) => {
    const dir = next > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(slideX,       { toValue: -dir * 40, duration: 160, useNativeDriver: true }),
      Animated.timing(slideOpacity, { toValue: 0,         duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideX.setValue(dir * 40);
      Animated.parallel([
        Animated.spring(slideX,       { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(slideOpacity, { toValue: 1, duration: 200,              useNativeDriver: true }),
      ]).start();
    });
  };

  const handleComplete = async () => {
    if (user) {
      setSaving(true);
      try {
        trackEvent({ name: 'onboarding_completed', goal, dailyMins, learnTime });
        await updateProfile.mutateAsync({ name: name.trim() || undefined, goal, dailyMins, learnTime, onboarded: true });
        await enroll.mutateAsync({ programSlug: "ai-operator" });
      } catch (e) {
        console.error('Onboarding save failed:', e);
        setSaving(false);
        return;
      }
    }
    router.replace("/(tabs)/home");
  };

  const canAdvance =
    step === 0 ||
    step === 3 ||
    step === 4 ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && !!goal);

  // Progress uses TOTAL_STEPS-1 dots (skip welcome step)
  const showProgress = step > 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* ── Progress indicator (hidden on welcome) ── */}
        {showProgress && (
          <View style={s.progressRow}>
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
              <View key={i} style={s.progressStep}>
                <View style={[
                  s.dot,
                  i < step - 1 && s.dotDone,
                  i === step - 1 && s.dotActive,
                ]}>
                  {i < step - 1
                    ? <Text style={s.dotCheck}>✓</Text>
                    : <Text style={[s.dotNum, i === step - 1 && s.dotNumActive]}>{i + 1}</Text>
                  }
                </View>
                {i < TOTAL_STEPS - 2 && (
                  <View style={[s.progressLine, i < step - 1 && s.progressLineDone]} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Animated content area ── */}
        <Animated.View style={[s.animWrap, { transform: [{ translateX: slideX }], opacity: slideOpacity }]}>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── Step 0: Welcome hero ── */}
            {step === 0 && (
              <View style={s.welcomeWrap}>
                <View style={s.ariaBubble}>
                  <Text style={s.ariaEmoji}>🤖</Text>
                </View>

                <Text style={s.tagline}>
                  AI isn't the future.{'\n'}
                  <Text style={s.taglineAccent}>Operators are.</Text>
                </Text>

                <Text style={s.welcomeBody}>
                  In 28 days, you'll go from AI user to AI operator — building systems that work for you around the clock.
                </Text>

                <View style={s.featureList}>
                  {[
                    { icon: "⚡", text: "Automate hours of repetitive work" },
                    { icon: "🎯", text: "Build AI systems that run themselves" },
                    { icon: "📈", text: "Skills that compound every single day" },
                  ].map(f => (
                    <View key={f.icon} style={s.featureRow}>
                      <Text style={s.featureIcon}>{f.icon}</Text>
                      <Text style={s.featureText}>{f.text}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.socialProof}>
                  <Text style={s.socialProofText}>✦ Join 12,847 operators already building with AI</Text>
                </View>
              </View>
            )}

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <View style={s.stepWrap}>
                <View style={s.stepHeader}>
                  <Text style={s.stepEmoji}>👋</Text>
                  <Text style={s.stepTitle}>What's your name?</Text>
                  <Text style={s.stepSub}>How should Aria address you?</Text>
                </View>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your first name"
                  placeholderTextColor="#9ca3af"
                  autoFocus
                />
              </View>
            )}

            {/* ── Step 2: Goal ── */}
            {step === 2 && (
              <View style={s.stepWrap}>
                <View style={s.stepHeader}>
                  <Text style={s.stepEmoji}>🎯</Text>
                  <Text style={s.stepTitle}>Your goal</Text>
                  <Text style={s.stepSub}>What brings you to AI Operator?</Text>
                </View>
                <View style={s.optionsList}>
                  {goals.map((g) => (
                    <TouchableOpacity
                      key={g.key}
                      style={[s.optionCard, goal === g.key && s.optionCardSelected]}
                      onPress={() => setGoal(g.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.optionEmoji}>{g.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.optionLabel, goal === g.key && s.optionLabelSelected]}>{g.label}</Text>
                        <Text style={s.optionDesc}>{g.desc}</Text>
                      </View>
                      {goal === g.key && <Text style={s.checkMark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ── Step 3: Schedule ── */}
            {step === 3 && (
              <View style={s.stepWrap}>
                <View style={s.stepHeader}>
                  <Text style={s.stepEmoji}>⏱️</Text>
                  <Text style={s.stepTitle}>Your rhythm</Text>
                  <Text style={s.stepSub}>Set your learning habits</Text>
                </View>

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
                  {times.map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      style={[s.timeCard, learnTime === t.key && s.timeCardSelected]}
                      onPress={() => setLearnTime(t.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.timeEmoji}>{t.emoji}</Text>
                      <Text style={[s.timeLabel, learnTime === t.key && s.timeLabelSelected]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ── Step 4: Summary ── */}
            {step === 4 && (
              <View style={s.stepWrap}>
                <View style={s.stepHeader}>
                  <Text style={s.stepEmoji}>🚀</Text>
                  <Text style={s.stepTitle}>You're all set!</Text>
                  <Text style={s.stepSub}>Your personalized journey awaits</Text>
                </View>

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
                    <Text style={s.summaryIcon}>{goals.find(g => g.key === goal)?.emoji ?? "🎯"}</Text>
                    <View>
                      <Text style={s.summaryLabel}>Goal</Text>
                      <Text style={s.summaryValue}>{goals.find(g => g.key === goal)?.label ?? "Not set"}</Text>
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

                <View style={s.programCard}>
                  <View style={s.programBadge}>
                    <Text style={s.programBadgeText}>YOUR PROGRAM</Text>
                  </View>
                  <Text style={s.programName}>AI Operator</Text>
                  <Text style={s.programDesc}>28 days · 15 min/day · Build real systems</Text>
                </View>
              </View>
            )}

          </ScrollView>
        </Animated.View>

        {/* ── Bottom navigation ── */}
        <View style={s.bottomBar}>
          <View style={s.bottomRow}>
            {step > 0 ? (
              <TouchableOpacity style={s.backBtn} onPress={() => navigateTo(step - 1)} activeOpacity={0.7}>
                <Text style={s.backBtnText}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity
                style={[s.nextBtn, !canAdvance && s.nextBtnDisabled]}
                onPress={() => navigateTo(step + 1)}
                disabled={!canAdvance}
                activeOpacity={0.8}
              >
                <Text style={s.nextBtnText}>{step === 0 ? "Get Started →" : "Continue"}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.nextBtn, saving && { opacity: 0.7 }]}
                onPress={handleComplete}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={s.nextBtnText}>{saving ? 'Starting...' : 'Start My Journey 🚀'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GREEN   = '#059669';
const GREEN_L = '#ecfdf5';
const BORDER  = '#e5e7eb';
const MUTED   = '#6b7280';
const DARK    = '#1a1a2e';

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#fff' },
  container:   { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
  loadingText: { fontSize: 16, fontWeight: '600', color: GREEN },
  animWrap:    { flex: 1 },

  // Progress
  progressRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 40 },
  progressStep:    { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot:             { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BORDER },
  dotDone:         { backgroundColor: GREEN, borderColor: GREEN },
  dotActive:       { backgroundColor: '#fff', borderColor: GREEN, borderWidth: 3 },
  dotCheck:        { color: '#fff', fontSize: 14, fontWeight: '700' },
  dotNum:          { color: '#9ca3af', fontSize: 14, fontWeight: '700' },
  dotNumActive:    { color: GREEN },
  progressLine:    { flex: 1, height: 3, backgroundColor: BORDER, marginHorizontal: 4 },
  progressLineDone:{ backgroundColor: GREEN },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

  // Welcome
  welcomeWrap:     { paddingTop: 28, gap: 26, alignItems: 'center' },
  ariaBubble:      { width: 96, height: 96, borderRadius: 48, backgroundColor: GREEN_L, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#6ee7b7' },
  ariaEmoji:       { fontSize: 50 },
  tagline:         { fontSize: 30, fontWeight: '900', color: DARK, textAlign: 'center', lineHeight: 38 },
  taglineAccent:   { color: GREEN },
  welcomeBody:     { fontSize: 16, color: MUTED, textAlign: 'center', lineHeight: 24, paddingHorizontal: 8 },
  featureList:     { gap: 14, width: '100%' },
  featureRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon:     { fontSize: 22, width: 32, textAlign: 'center' },
  featureText:     { fontSize: 15, color: '#374151', fontWeight: '600', flex: 1 },
  socialProof:     { backgroundColor: '#f0fdf4', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  socialProofText: { fontSize: 13, fontWeight: '700', color: GREEN },

  // Steps
  stepWrap:   { paddingTop: 16, gap: 20 },
  stepHeader: { alignItems: 'center', paddingTop: 16, marginBottom: 8 },
  stepEmoji:  { fontSize: 52, marginBottom: 12 },
  stepTitle:  { fontSize: 26, fontWeight: '800', color: DARK, textAlign: 'center' },
  stepSub:    { fontSize: 16, color: MUTED, textAlign: 'center', marginTop: 6, lineHeight: 22 },

  // Input
  input: { backgroundColor: '#f9fafb', borderWidth: 2, borderColor: BORDER, borderRadius: 16, padding: 16, fontSize: 18, color: DARK, textAlign: 'center', fontWeight: '600' },

  // Goal options
  optionsList:         { gap: 10 },
  optionCard:          { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', backgroundColor: '#fafafa' },
  optionCardSelected:  { borderColor: GREEN, backgroundColor: GREEN_L },
  optionEmoji:         { fontSize: 28 },
  optionLabel:         { fontSize: 16, fontWeight: '700', color: DARK },
  optionLabelSelected: { color: GREEN },
  optionDesc:          { fontSize: 13, color: MUTED, marginTop: 2 },
  checkMark:           { fontSize: 18, color: GREEN, fontWeight: '700' },

  // Schedule
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  minsRow:         { flexDirection: 'row', gap: 10 },
  minChip:         { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', backgroundColor: '#fafafa' },
  minChipSelected: { borderColor: GREEN, backgroundColor: GREEN_L },
  minNum:          { fontSize: 22, fontWeight: '800', color: DARK },
  minNumSelected:  { color: GREEN },
  minUnit:         { fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: '600' },
  minUnitSelected: { color: GREEN },
  timesRow:         { flexDirection: 'row', gap: 10 },
  timeCard:         { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', backgroundColor: '#fafafa' },
  timeCardSelected: { borderColor: GREEN, backgroundColor: GREEN_L },
  timeEmoji:        { fontSize: 24 },
  timeLabel:        { fontSize: 12, fontWeight: '600', color: MUTED },
  timeLabelSelected:{ color: GREEN, fontWeight: '700' },

  // Summary
  summaryCard:    { backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: BORDER, gap: 16 },
  summaryRow:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryIcon:    { fontSize: 28 },
  summaryLabel:   { fontSize: 12, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue:   { fontSize: 17, fontWeight: '700', color: DARK, marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: BORDER },
  programCard:    { backgroundColor: '#0d0621', borderRadius: 16, padding: 20, gap: 6 },
  programBadge:   { backgroundColor: 'rgba(147,51,234,0.3)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  programBadgeText:{ fontSize: 10, fontWeight: '800', color: '#c084fc', letterSpacing: 1 },
  programName:    { fontSize: 20, fontWeight: '900', color: '#fff' },
  programDesc:    { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  // Bottom bar
  bottomBar:      { borderTopWidth: 1, borderTopColor: '#f3f4f6', padding: 20, paddingBottom: 32 },
  bottomRow:      { flexDirection: 'row', gap: 12 },
  backBtn:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: BORDER },
  backBtnText:    { fontSize: 16, fontWeight: '700', color: MUTED },
  nextBtn:        { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, backgroundColor: GREEN },
  nextBtnDisabled:{ opacity: 0.4 },
  nextBtnText:    { fontSize: 16, fontWeight: '700', color: '#fff' },
});
