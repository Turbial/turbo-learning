// ─── McStep — multiple choice ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function McStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (i: number) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onAnswer(selected);
  };

  const isCorrect = submitted && selected === s.correct;
  const isWrong = submitted && selected !== s.correct;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{s.question}</Text>

      <View style={styles.options}>
        {s.options.map((opt: string, i: number) => {
          let bg = "#FDFBF8";
          let border = "#e8e2d9";
          if (submitted && i === s.correct) { bg = "#ecfdf5"; border = "#4E8A5C"; }
          else if (submitted && i === selected && i !== s.correct) { bg = "#fef2f2"; border = "#ef4444"; }
          else if (selected === i) { bg = "#ecfdf5"; border = "#059669"; }

          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(i)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, { borderColor: selected === i ? "#059669" : "#d4cec4" }]}> 
                {selected === i && <View style={styles.radioFill} />}
              </View>
              <Text style={[styles.optionText, submitted && i === s.correct && { color: "#065f46" }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!submitted ? (
        <TouchableOpacity
          style={[styles.btn, selected === null && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={selected === null}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Check Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <Text style={styles.feedbackText}>
            {isCorrect ? s.feedback[0] : s.feedback[1] || "Not quite. The correct answer is highlighted above."}
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
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#059669",
  },
  optionText: { fontSize: 16, color: "#3D3228", flex: 1, fontWeight: "500" },
  btn: {
    marginTop: 24,
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  feedback: {
    marginTop: 20,
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
