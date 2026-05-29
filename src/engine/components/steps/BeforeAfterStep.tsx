// ─── BeforeAfterStep — side-by-side comparison of weak vs better prompt ───
// Non-interactive display step with lesson takeaway at bottom.

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { BeforeAfterStep as BeforeAfterStepType } from "../../types";
import { colors, radius, spacing, fontSize } from "../../../theme/tokens";

export default function BeforeAfterStep({ step }: StepProps) {
  const s = step as BeforeAfterStepType;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {s.title && <Text style={styles.title}>{s.title}</Text>}

      <View style={styles.sideBySide}>
        {/* Before — Weak prompt */}
        <View style={[styles.card, styles.beforeCard]}>
          <View style={[styles.labelContainer, styles.beforeLabel]}>
            <Text style={styles.beforeLabelText}>❌ Before</Text>
          </View>
          <Text style={styles.promptText}>{s.beforePrompt}</Text>
        </View>

        {/* After — Better prompt */}
        <View style={[styles.card, styles.afterCard]}>
          <View style={[styles.labelContainer, styles.afterLabel]}>
            <Text style={styles.afterLabelText}>✅ After</Text>
          </View>
          <Text style={styles.promptText}>{s.afterPrompt}</Text>
        </View>
      </View>

      {/* Takeaway */}
      <View style={styles.lessonContainer}>
        <Text style={styles.lessonLabel}>💡 Lesson</Text>
        <Text style={styles.lessonText}>{s.lesson}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 4, paddingBottom: spacing.xl },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: "center",
    lineHeight: 30,
  },
  sideBySide: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  beforeCard: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  afterCard: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  labelContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  beforeLabel: {
    backgroundColor: "#fee2e2",
  },
  afterLabel: {
    backgroundColor: "#bbf7d0",
  },
  beforeLabelText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: "#dc2626",
  },
  afterLabelText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: "#059669",
  },
  promptText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  lessonContainer: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  lessonLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: "#a16207",
    marginBottom: spacing.xs,
  },
  lessonText: {
    fontSize: fontSize.body,
    color: "#713f12",
    lineHeight: 22,
  },
});
