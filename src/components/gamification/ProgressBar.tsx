// ProgressBar — XP progress bar with level markers
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ORANGE = "#E84E0F";

const LEVEL_THRESHOLDS = [0, 200, 600, 1200, 2500, 4000, 6000];

function xpToLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function xpProgressInLevel(totalXp: number): { current: number; next: number; pct: number } {
  const level = xpToLevel(totalXp);
  const idx = level - 1;
  const current = LEVEL_THRESHOLDS[idx] ?? 0;
  const next = LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
  const pct = Math.min(1, (totalXp - current) / (next - current));
  return { current, next, pct };
}

interface ProgressBarProps {
  totalXp: number;
  showMarkers?: boolean;
}

export function ProgressBar({ totalXp, showMarkers = true }: ProgressBarProps) {
  const level = xpToLevel(totalXp);
  const { current, next, pct } = xpProgressInLevel(totalXp);
  const xpInLevel = totalXp - current;
  const xpNeeded = next - current;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.levelLabel}>Lv {level}</Text>
        <Text style={styles.xpLabel}>{xpInLevel} / {xpNeeded} XP</Text>
        <Text style={styles.levelLabel}>Lv {level + 1}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(pct * 100, 2)}%` }]} />
        {showMarkers && LEVEL_THRESHOLDS.map((t, i) => {
          if (i === 0) return null;
          const markerPct = (t / (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 1.5)) * 100;
          return (
            <View key={i} style={[styles.marker, { left: `${markerPct}%` }]}>
              <Text style={styles.markerText}>L{i + 1}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  levelLabel: { fontSize: 12, fontWeight: "700", color: "#A09484" },
  xpLabel: { fontSize: 12, fontWeight: "600", color: ORANGE },
  track: { height: 10, backgroundColor: "#e0d9cf", borderRadius: 5, overflow: "visible", position: "relative" },
  fill: { height: "100%", backgroundColor: ORANGE, borderRadius: 5 },
  marker: { position: "absolute", top: -4, transform: [{ translateX: -12 }] },
  markerText: { fontSize: 9, color: "#C4BDB6", fontWeight: "600" },
});
