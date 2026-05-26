// ─── TrueFalseStep — true/false choice ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function TrueFalseStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (val: boolean) => {
    if (submitted) return;
    setSelected(val);
    setSubmitted(true);
    onAnswer(val);
  };

  const isCorrect = submitted && selected === s.correct;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{s.question}</Text>

      <View style={styles.buttons}>
        {[true, false].map((val) => {
          const isSelected = selected === val;
          let bg = "#FDFBF8";
          let border = "#e8e2d9";
          if (submitted && val === s.correct) { bg = "#ecfdf5"; border = "#4E8A5C"; }
          else if (submitted && isSelected && val !== s.correct) { bg = "#fef2f2"; border = "#ef4444"; }
          else if (isSelected && !submitted) { bg = "#ecfdf5"; border = "#059669"; }

          return (
            <TouchableOpacity
              key={String(val)}
              style={[styles.button, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(val)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, submitted && val === s.correct && { color: "#065f46" }]}>
                {val ? "True" : "False"}
              </Text>
              {submitted && val === s.correct && <Text style={styles.check}>✓</Text>}
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
  buttons: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 20, fontWeight: "700", color: "#2D241C" },
  check: { fontSize: 18, fontWeight: "700", color: "#065f46", marginTop: 4 },
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
