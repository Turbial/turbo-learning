// KnowledgeMeter — Knowledge score display
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ORANGE = "#E84E0F";

interface KnowledgeMeterProps {
  score: number;      // 0–100
  label?: string;
  showPct?: boolean;
}

function getColor(score: number): string {
  if (score >= 80) return ORANGE;
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getLabel(score: number): string {
  if (score >= 90) return "Expert";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Growing";
  if (score >= 40) return "Learning";
  return "Beginner";
}

export function KnowledgeMeter({ score, label, showPct = true }: KnowledgeMeterProps) {
  const color = getColor(score);
  const level = getLabel(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label ?? "Knowledge"}</Text>
        {showPct && <Text style={[styles.pct, { color }]}>{clamped}%</Text>}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.levelRow}>
        <Text style={[styles.levelText, { color }]}>{level}</Text>
        <View style={styles.dots}>
          {[25, 50, 75, 100].map((d) => (
            <View key={d} style={[styles.dot, clamped >= d && { backgroundColor: color }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#5A4E40" },
  pct: { fontSize: 14, fontWeight: "800" },
  track: { height: 8, backgroundColor: "#e0d9cf", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  fill: { height: "100%", borderRadius: 4 },
  levelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelText: { fontSize: 12, fontWeight: "700" },
  dots: { flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#d4cec4" },
});
