// CommitStep — Choose goal + time, 10 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

const GOALS = [
  { key: "learn", label: "Learn a new skill", icon: "📚" },
  { key: "automate", label: "Automate my work", icon: "⚡" },
  { key: "explore", label: "Explore AI tools", icon: "🔭" },
  { key: "career", label: "Career growth", icon: "📈" },
];

const TIMES = [
  { key: "morning", label: "Morning", icon: "🌅" },
  { key: "afternoon", label: "Afternoon", icon: "☀️" },
  { key: "evening", label: "Evening", icon: "🌆" },
];

interface CommitProps {
  step: { title?: string; body?: string };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function CommitStep({ step, onNext, onXP }: CommitProps) {
  const [goal, setGoal] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const handleCommit = () => {
    if (!goal || !time) return;
    haptic();
    onXP(10);
    onNext();
  };

  const canCommit = goal && time;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step.title ?? "💪 Make Your Commitment"}</Text>
      {step.body && <Text style={styles.sub}>{step.body}</Text>}

      <Text style={styles.sectionLabel}>What's your goal?</Text>
      <View style={styles.options}>
        {GOALS.map((g) => (
          <TouchableOpacity key={g.key}
            style={[styles.option, goal === g.key && styles.optionSelected]}
            onPress={() => { haptic(); setGoal(g.key); }} activeOpacity={0.7}>
            <Text style={styles.optionIcon}>{g.icon}</Text>
            <Text style={[styles.optionText, goal === g.key && { color: ORANGE }]}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>When will you learn?</Text>
      <View style={styles.timeRow}>
        {TIMES.map((t) => (
          <TouchableOpacity key={t.key}
            style={[styles.timeOption, time === t.key && styles.timeOptionSelected]}
            onPress={() => { haptic(); setTime(t.key); }} activeOpacity={0.7}>
            <Text style={styles.timeIcon}>{t.icon}</Text>
            <Text style={[styles.timeText, time === t.key && { color: ORANGE }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, !canCommit && styles.btnDisabled]}
        onPress={handleCommit} disabled={!canCommit} activeOpacity={0.8}>
        <Text style={styles.btnText}>I Commit! 💪</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#2D241C", marginBottom: 8, textAlign: "center" },
  sub: { fontSize: 15, color: "#6B5E50", marginBottom: 24, textAlign: "center", lineHeight: 22 },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: "#2D241C", marginBottom: 12 },
  options: { gap: 8, marginBottom: 24 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: "#e8e2d9", backgroundColor: "#FDFBF8" },
  optionSelected: { borderColor: ORANGE, backgroundColor: "#fff7ed" },
  optionIcon: { fontSize: 24 },
  optionText: { fontSize: 16, fontWeight: "600", color: "#2D241C", flex: 1 },
  timeRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  timeOption: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 2, borderColor: "#e8e2d9", backgroundColor: "#FDFBF8" },
  timeOptionSelected: { borderColor: ORANGE, backgroundColor: "#fff7ed" },
  timeIcon: { fontSize: 24, marginBottom: 6 },
  timeText: { fontSize: 13, fontWeight: "600", color: "#2D241C" },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
