// ─── MatchStep — drag-to-match pairs (tap to select on mobile) ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { MatchStep as MatchStepType } from "../../types";
import { colors } from "../../../theme/tokens";

export default function MatchStep({ step, onAnswer }: StepProps) {
  const s = step as MatchStepType;
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const pairs = s.pairs as Array<{ left: string; right: string }>;

  const handleLeftTap = (i: number) => {
    if (submitted || matches[i] !== undefined) return;
    setSelectedLeft(i);
  };

  const handleRightTap = (j: number) => {
    if (submitted || selectedLeft === null) return;
    // Check if this right is already matched
    const alreadyMatched = Object.values(matches).includes(j);
    if (alreadyMatched) return;
    setMatches((p) => ({ ...p, [selectedLeft]: j }));
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = Object.entries(matches).filter(
      ([left, right]) => Number(left) === right
    ).length;
    onAnswer(correct);
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Tap a term on the left, then its match on the right:</Text>

      <View style={styles.grid}>
        {/* Left column */}
        <View style={styles.column}>
          {pairs.map((pair, i) => {
            const isSelected = selectedLeft === i;
            const isMatched = matches[i] !== undefined;
            const isCorrect = submitted && matches[i] === i;

            return (
              <TouchableOpacity
                key={`l-${i}`}
                style={[
                  styles.item,
                  isSelected && styles.itemSelected,
                  isMatched && !submitted && styles.itemMatched,
                  submitted && isCorrect && styles.itemCorrect,
                  submitted && !isCorrect && styles.itemWrong,
                ]}
                onPress={() => handleLeftTap(i)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.itemText,
                  (isMatched || isSelected) && styles.itemTextSelected,
                ]}>
                  {pair.left}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Connector dots */}
        <View style={styles.connectors}>
          {pairs.map((_, i) => (
            <View key={i} style={styles.connectorDot} />
          ))}
        </View>

        {/* Right column */}
        <View style={styles.column}>
          {pairs.map((pair, j) => {
            const isTarget = selectedLeft !== null && !Object.values(matches).includes(j);
            const isMatched = Object.values(matches).includes(j);

            return (
              <TouchableOpacity
                key={`r-${j}`}
                style={[
                  styles.item,
                  isTarget && styles.itemTarget,
                  isMatched && !submitted && styles.itemMatched,
                ]}
                onPress={() => handleRightTap(j)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.itemText,
                  isMatched && styles.itemTextSelected,
                ]}>
                  {pair.right}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!submitted ? (
        <TouchableOpacity
          style={[styles.btn, !allMatched && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!allMatched}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {allMatched ? "Check Answers" : `Match all pairs (${Object.keys(matches).length}/${pairs.length})`}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.feedback}>
          <Text style={styles.score}>
            {Object.entries(matches).filter(([l, r]) => Number(l) === r).length}/{pairs.length} correct
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  instruction: {
    fontSize: 15,
    color: "#6B5E50",
    marginBottom: 20,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  connectors: {
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  connectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d4cec4",
  },
  item: {
    backgroundColor: "#FDFBF8",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#e8e2d9",
    minHeight: 52,
    justifyContent: "center",
  },
  itemSelected: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  itemTarget: { borderColor: "#8b5cf6", backgroundColor: "#f5f3ff" },
  itemMatched: { borderColor: colors.primary, backgroundColor: colors.primaryDim, opacity: 0.7 },
  itemCorrect: { borderColor: "#4E8A5C", backgroundColor: "#ecfdf5" },
  itemWrong: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  itemText: { fontSize: 14, color: "#3D3228", fontWeight: "500" },
  itemTextSelected: { color: colors.primary },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  feedback: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
  },
  score: { fontSize: 18, fontWeight: "700", color: "#065f46" },
});
