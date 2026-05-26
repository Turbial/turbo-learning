// ─── CompletionStep — lesson complete screen ───

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function CompletionStep({ step, state }: StepProps) {
  const s = step as { title?: string; body: string };
  const scorePct = state.totalGraded > 0
    ? Math.round((state.correctCount / state.totalGraded) * 100)
    : 100;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>{s.title || "Day Complete!"}</Text>
      <Text style={styles.body}>{s.body}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>+{state.sessionXp}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{scorePct}%</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2D241C",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B5E50",
    textAlign: "center",
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e8e2d9",
  },
  stat: { alignItems: "center" },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#059669",
  },
  statLabel: {
    fontSize: 13,
    color: "#A09484",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e8e2d9",
  },
});
