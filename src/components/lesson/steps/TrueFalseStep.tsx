// TrueFalseStep — Tap True/False, 5 XP, haptic feedback
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";

const hapticLight = () => {
  try {
    if (Platform.OS !== "web") {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {}
};

const hapticHeavy = () => {
  try {
    if (Platform.OS !== "web") {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch {}
};

interface TrueFalseStepProps {
  step: { question: string; correct: boolean; feedback: [string, string] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function TrueFalseStep({ step, onNext, onXP }: TrueFalseStepProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (val: boolean) => {
    if (submitted) return;
    hapticLight();
    setSelected(val);
    setSubmitted(true);
    const isCorrect = val === step.correct;
    onXP(isCorrect ? 5 : 5);
    if (isCorrect) hapticHeavy();
  };

  const isCorrect = submitted && selected === step.correct;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{step.question}</Text>
      <View style={styles.buttons}>
        {[true, false].map((val) => {
          const isSel = selected === val;
          let bg = "#FDFBF8", border = "#e8e2d9";
          if (submitted && val === step.correct) { bg = "#fff7ed"; border = ORANGE; }
          else if (submitted && isSel && val !== step.correct) { bg = "#fef2f2"; border = "#ef4444"; }
          else if (isSel && !submitted) { bg = "#fff7ed"; border = ORANGE; }
          return (
            <TouchableOpacity
              key={String(val)}
              style={[styles.button, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(val)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, submitted && val === step.correct && { color: ORANGE }]}>
                {val ? "True" : "False"}
              </Text>
              {submitted && val === step.correct && <Text style={[styles.check, { color: ORANGE }]}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      {submitted && (
        <View style={[styles.feedback, isCorrect ? styles.fbCorrect : styles.fbWrong]}>
          <Text style={styles.fbEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <Text style={styles.fbText}>{isCorrect ? step.feedback[0] : step.feedback[1]}</Text>
        </View>
      )}
      {submitted && (
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>Continue →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  question: { fontSize: 19, fontWeight: "700", color: "#2D241C", marginBottom: 24, lineHeight: 28 },
  buttons: { flexDirection: "row", gap: 12 },
  button: { flex: 1, paddingVertical: 20, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 20, fontWeight: "700", color: "#2D241C" },
  check: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  feedback: { marginTop: 24, flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 16, borderRadius: 14 },
  fbCorrect: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: ORANGE + "40" },
  fbWrong: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  fbEmoji: { fontSize: 20, fontWeight: "700", marginTop: 1 },
  fbText: { fontSize: 15, color: "#3D3228", flex: 1, lineHeight: 22 },
  nextBtn: { marginTop: 24, backgroundColor: ORANGE, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
