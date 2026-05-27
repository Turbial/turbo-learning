// CompletionStep — Lesson completion, 20 XP
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ORANGE = "#E84E0F";

interface CompletionProps {
  step: { title?: string; body: string; xpEarned?: number; scorePct?: number };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function CompletionStep({ step }: CompletionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>{step.title ?? "Day Complete!"}</Text>
      <Text style={styles.body}>{step.body}</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>+{step.xpEarned ?? 20}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{step.scorePct ?? 100}%</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", color: "#2D241C", marginBottom: 12, textAlign: "center" },
  body: { fontSize: 16, lineHeight: 24, color: "#6B5E50", textAlign: "center", marginBottom: 32 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 24, backgroundColor: "#fff", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "#e8e2d9" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800", color: ORANGE },
  statLabel: { fontSize: 13, color: "#A09484", marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: "#e8e2d9" },
});
