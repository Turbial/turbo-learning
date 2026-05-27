// ─── StreakCommitStep — user picks a streak goal ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { colors } from "../../../theme/tokens";

export default function StreakCommitStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const options = s.commitOptions as number[];
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (days: number) => {
    setSelected(days);
    onAnswer(days);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Set Your Streak Goal</Text>
      <Text style={styles.subtitle}>How many days do you commit to?</Text>

      <View style={styles.options}>
        {options.map((days) => (
          <TouchableOpacity
            key={days}
            style={[
              styles.option,
              selected === days && styles.optionSelected,
            ]}
            onPress={() => handleSelect(days)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionNum, selected === days && styles.optionNumSelected]}>
              {days}
            </Text>
            <Text style={[styles.optionLabel, selected === days && styles.optionLabelSelected]}>
              days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selected && (
        <View style={styles.committed}>
          <Text style={styles.committedEmoji}>💪</Text>
          <Text style={styles.committedText}>
            {selected}-day streak committed! We'll help you stay on track.
          </Text>
        </View>
      )}
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D241C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B5E50",
    marginBottom: 28,
  },
  options: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  option: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e8e2d9",
    backgroundColor: "#FDFBF8",
  },
  optionSelected: {
    borderColor: "#f59e0b",
    backgroundColor: "#fef3c7",
  },
  optionNum: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D241C",
  },
  optionNumSelected: { color: "#92400e" },
  optionLabel: {
    fontSize: 12,
    color: "#A09484",
    marginTop: 2,
    fontWeight: "600",
  },
  optionLabelSelected: { color: "#a16207" },
  committed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  committedEmoji: { fontSize: 24 },
  committedText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400e",
    flex: 1,
    lineHeight: 22,
  },
});
