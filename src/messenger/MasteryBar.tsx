// ─── MasteryBar — per-concept mastery meter (client mirror of lp_concept_mastery) ───
// Shows the student which concepts they're locking in as they answer. Updates live
// from `answer` taps; no network. Hidden until at least one concept has an attempt.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/tokens";
import type { ConceptMastery } from "./types";

export default function MasteryBar({ mastery }: { mastery: ConceptMastery[] }) {
  const active = mastery.filter((m) => m.attempts > 0);
  if (active.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {active.map((m) => {
        const pct = m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0;
        return (
          <View key={m.tag} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>
              {m.label}
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.pct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { flex: 1, fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  track: {
    width: 88,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHover,
    overflow: "hidden",
  },
  fill: { height: 6, borderRadius: radius.full, backgroundColor: colors.primary },
  pct: { width: 36, textAlign: "right", fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ["tabular-nums"] },
});
