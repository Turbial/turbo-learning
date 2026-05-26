// ─── GoodFitStep — "Good fit" vs "Not ideal" judgment ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function GoodFitStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const [selected, setSelected] = useState<"good" | "notideal" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (val: "good" | "notideal") => {
    if (submitted) return;
    setSelected(val);
    setSubmitted(true);
    onAnswer(val);
  };

  const isCorrect = submitted && selected === s.correct;

  const options: { key: "good" | "notideal"; label: string; emoji: string }[] = [
    { key: "good", label: "Good Fit", emoji: "👍" },
    { key: "notideal", label: "Not Ideal", emoji: "🤔" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{s.question}</Text>

      <View style={styles.buttons}>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          let bg = "#FDFBF8";
          let border = "#e8e2d9";

          if (submitted && opt.key === s.correct) { bg = "#ecfdf5"; border = "#4E8A5C"; }
          else if (submitted && isSelected && opt.key !== s.correct) { bg = "#fef2f2"; border = "#ef4444"; }
          else if (isSelected && !submitted) { bg = "#ecfdf5"; border = "#059669"; }

          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.button, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.label, submitted && opt.key === s.correct && { color: "#065f46" }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <Text style={styles.feedbackText}>
            {isCorrect ? s.feedback[0] : s.feedback[1]}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  question: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 24,
    lineHeight: 28,
  },
  buttons: { gap: 12 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  emoji: { fontSize: 28 },
  label: { fontSize: 18, fontWeight: "700", color: "#2D241C" },
  feedback: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  feedbackCorrect: { backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0" },
  feedbackWrong: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  feedbackEmoji: { fontSize: 20, fontWeight: "700", marginTop: 1 },
  feedbackText: { fontSize: 15, color: "#3D3228", flex: 1, lineHeight: 22 },
});
