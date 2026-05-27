// MatchStep — Tap-to-match pairs, 5 XP each pair
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";

const hapticLight = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };
const hapticHeavy = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Heavy); } } catch {} };

interface MatchStepProps {
  step: { pairs: { left: string; right: string }[] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function MatchStep({ step, onNext, onXP }: MatchStepProps) {
  const { pairs } = step;
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleLeftTap = (i: number) => {
    if (submitted || matches[i] !== undefined) return;
    hapticLight();
    setSelectedLeft(i);
  };

  const handleRightTap = (j: number) => {
    if (submitted || selectedLeft === null) return;
    if (Object.values(matches).includes(j)) return;
    hapticLight();
    setMatches((p) => ({ ...p, [selectedLeft]: j }));
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = Object.entries(matches).filter(([l, r]) => Number(l) === r).length;
    onXP(correct * 5);
    if (correct === pairs.length) hapticHeavy();
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Tap a term on the left, then its match on the right:</Text>
      <View style={styles.grid}>
        <View style={styles.column}>
          {pairs.map((pair, i) => {
            const isSelected = selectedLeft === i;
            const isMatched = matches[i] !== undefined;
            const isCorrect = submitted && matches[i] === i;
            return (
              <TouchableOpacity key={`l-${i}`} style={[styles.item, isSelected && styles.itemSelected,
                isMatched && !submitted && styles.itemMatched, submitted && isCorrect && styles.itemCorrect,
                submitted && !isCorrect && styles.itemWrong]}
                onPress={() => handleLeftTap(i)} activeOpacity={0.7}>
                <Text style={[styles.itemText, (isMatched || isSelected) && { color: ORANGE }]}>{pair.left}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.connectors}>
          {pairs.map((_, i) => (<View key={i} style={styles.dot} />))}
        </View>
        <View style={styles.column}>
          {pairs.map((pair, j) => {
            const isTarget = selectedLeft !== null && !Object.values(matches).includes(j);
            const isMatched = Object.values(matches).includes(j);
            return (
              <TouchableOpacity key={`r-${j}`} style={[styles.item, isTarget && styles.itemTarget,
                isMatched && !submitted && styles.itemMatched]}
                onPress={() => handleRightTap(j)} activeOpacity={0.7}>
                <Text style={[styles.itemText, isMatched && { color: ORANGE }]}>{pair.right}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {!submitted ? (
        <TouchableOpacity style={[styles.btn, !allMatched && styles.btnDisabled]} onPress={handleSubmit} disabled={!allMatched} activeOpacity={0.8}>
          <Text style={styles.btnText}>{allMatched ? "Check Answers" : `Match all pairs (${Object.keys(matches).length}/${pairs.length})`}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.feedback}>
            <Text style={styles.score}>{Object.entries(matches).filter(([l, r]) => Number(l) === r).length}/{pairs.length} correct</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  instruction: { fontSize: 15, color: "#6B5E50", marginBottom: 20, lineHeight: 22 },
  grid: { flexDirection: "row", gap: 8, marginBottom: 20 },
  column: { flex: 1, gap: 8 },
  connectors: { justifyContent: "space-around", paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#d4cec4" },
  item: { backgroundColor: "#FDFBF8", borderRadius: 12, padding: 14, borderWidth: 2, borderColor: "#e8e2d9", minHeight: 52, justifyContent: "center" },
  itemSelected: { borderColor: ORANGE, backgroundColor: "#fff7ed" },
  itemTarget: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  itemMatched: { borderColor: ORANGE, backgroundColor: "#fff7ed", opacity: 0.7 },
  itemCorrect: { borderColor: ORANGE, backgroundColor: "#fff7ed" },
  itemWrong: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  itemText: { fontSize: 14, color: "#3D3228", fontWeight: "500" },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  feedback: { backgroundColor: "#fff7ed", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: ORANGE + "40", alignItems: "center", marginBottom: 16 },
  score: { fontSize: 18, fontWeight: "700", color: ORANGE },
  nextBtn: { backgroundColor: ORANGE, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
