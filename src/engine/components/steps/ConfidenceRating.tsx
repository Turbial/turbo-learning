// ─── ConfidenceRating — 3-level self-assessment (Not sure / Somewhat / Confident) ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { ConfidenceRatingStep as CRStep } from "../../types";

const DEFAULT_LEVELS = [
  { key: "not_sure", label: "Not sure", emoji: "🤔" },
  { key: "somewhat", label: "Somewhat", emoji: "👍" },
  { key: "confident", label: "Confident", emoji: "💪" },
];

const LEVEL_COLORS: Record<string, string> = {
  not_sure: "#ef4444",
  somewhat: "#f59e0b",
  confident: "#059669",
};

export default function ConfidenceRating({ step, onAnswer }: StepProps) {
  const s = step as CRStep;
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const levels = s.levels?.length ? s.levels : DEFAULT_LEVELS;

  const handleSelect = (key: string) => {
    if (submitted) return;
    setSelected(key);
    setSubmitted(true);
    onAnswer(key);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{s.question}</Text>

      {submitted && (
        <View style={styles.submittedBadge}>
          <Text style={styles.submittedText}>✓ Recorded</Text>
        </View>
      )}

      <View style={styles.buttons}>
        {levels.map((level) => {
          const isSelected = selected === level.key;
          const color = LEVEL_COLORS[level.key] ?? "#8B7E70";
          return (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.button,
                isSelected && {
                  borderColor: color,
                  backgroundColor: color + "15",
                },
                submitted && !isSelected && { opacity: 0.5 },
              ]}
              onPress={() => handleSelect(level.key)}
              activeOpacity={0.7}
              disabled={submitted}
            >
              <Text style={styles.emoji}>{level.emoji}</Text>
              <Text style={[styles.label, isSelected && { color }]}>
                {level.label}
              </Text>
              {!submitted && (
                <Text style={[styles.arrow, isSelected && { color }]}>
                  {isSelected ? "✓" : "→"}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4, justifyContent: "center" },
  question: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 28,
  },
  submittedBadge: {
    alignSelf: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    marginBottom: 16,
  },
  submittedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#059669",
  },
  buttons: { gap: 12 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e8e2d9",
    backgroundColor: "#FDFBF8",
  },
  emoji: { fontSize: 28 },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D241C",
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    color: "#C4B8A8",
    fontWeight: "600",
  },
});
