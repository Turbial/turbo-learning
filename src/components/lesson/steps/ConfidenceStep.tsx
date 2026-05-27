// ConfidenceStep — Tap confidence level (Not sure/Somewhat/Confident), 5 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

const LEVELS = [
  { key: "not_sure", label: "Not sure", emoji: "🤔", color: "#ef4444" },
  { key: "somewhat", label: "Somewhat", emoji: "👍", color: "#f59e0b" },
  { key: "confident", label: "Confident", emoji: "💪", color: ORANGE },
];

interface ConfidenceProps {
  step: { question: string };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function ConfidenceStep({ step, onNext, onXP }: ConfidenceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    if (selected) return;
    haptic();
    setSelected(key);
    onXP(5);
    setTimeout(onNext, 800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{step.question}</Text>
      <View style={styles.buttons}>
        {LEVELS.map((level) => {
          const isSel = selected === level.key;
          return (
            <TouchableOpacity key={level.key}
              style={[styles.button, isSel && { borderColor: level.color, backgroundColor: level.color + "15" }]}
              onPress={() => handleSelect(level.key)} activeOpacity={0.7}>
              <Text style={styles.emoji}>{level.emoji}</Text>
              <Text style={[styles.label, isSel && { color: level.color }]}>{level.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4, justifyContent: "center" },
  question: { fontSize: 19, fontWeight: "700", color: "#2D241C", marginBottom: 28, textAlign: "center", lineHeight: 28 },
  buttons: { gap: 12 },
  button: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20, borderRadius: 16, borderWidth: 2, borderColor: "#e8e2d9", backgroundColor: "#FDFBF8" },
  emoji: { fontSize: 28 },
  label: { fontSize: 18, fontWeight: "700", color: "#2D241C" },
});
