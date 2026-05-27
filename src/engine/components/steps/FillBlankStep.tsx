// ─── FillBlankStep — type the missing word/phrase ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { colors } from "../../../theme/tokens";

export default function FillBlankStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    onAnswer(answer.trim());
  };

  const isCorrect = submitted && (() => {
    const normalized = answer.trim().toLowerCase();
    const correct = s.answer.toLowerCase();
    const aliases = s.aliases?.map((a: string) => a.toLowerCase()) ?? [];
    return normalized === correct || aliases.includes(normalized);
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{s.question}</Text>

      <TextInput
        style={[
          styles.input,
          submitted && (isCorrect ? styles.inputCorrect : styles.inputWrong),
        ]}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Type your answer..."
        placeholderTextColor={colors.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitted}
      />

      {!submitted ? (
        <TouchableOpacity
          style={[styles.btn, !answer.trim() && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!answer.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Check Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <View>
            <Text style={styles.feedbackText}>
              {isCorrect ? s.feedback[0] : s.feedback[1] || `The correct answer is: ${s.answer}`}
            </Text>
            {!isCorrect && <Text style={styles.correctAnswer}>Correct: {s.answer}</Text>}
          </View>
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
  input: {
    backgroundColor: "#FDFBF8",
    borderWidth: 2,
    borderColor: "#e0d9cf",
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: "#3D3228",
    textAlign: "center",
    marginBottom: 16,
  },
  inputCorrect: { borderColor: "#4E8A5C", backgroundColor: "#ecfdf5" },
  inputWrong: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  feedback: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  feedbackCorrect: { backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0" },
  feedbackWrong: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  feedbackEmoji: { fontSize: 20, fontWeight: "700", marginTop: 1 },
  feedbackText: { fontSize: 15, color: "#3D3228", lineHeight: 22, flex: 1 },
  correctAnswer: { fontSize: 14, color: "#059669", fontWeight: "600", marginTop: 4 },
});
