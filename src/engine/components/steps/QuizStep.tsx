// ─── QuizStep — multiple mini-questions in sequence ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { QuizStep as QuizStepType } from "../../types";
import { colors } from "../../../theme/tokens";

export default function QuizStep({ step, onAnswer }: StepProps) {
  const s = step as QuizStepType;
  const questions = (s.questions as Array<{ id: string; question: string; options: string[]; correct: number }>) ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: string, optIdx: number) => {
    if (submitted) return;
    setAnswers((p) => ({ ...p, [qId]: optIdx }));
  };

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    // Pass answers as Record<string, number | string> so the registry validator can index by question id
    onAnswer(answers);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick Quiz</Text>

      {questions.map((q, qi) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.correct;
        const isWrong = submitted && selected !== undefined && selected !== q.correct;

        return (
          <View key={q.id} style={styles.qBlock}>
            <Text style={styles.qNum}>
              Q{qi + 1}. {q.question}
            </Text>
            <View style={styles.options}>
              {q.options.map((opt, oi) => {
                let bg = "#FDFBF8";
                let border = "#e8e2d9";
                if (submitted && oi === q.correct) { bg = "#ecfdf5"; border = "#4E8A5C"; }
                else if (submitted && oi === selected && oi !== q.correct) { bg = "#fef2f2"; border = "#ef4444"; }
                else if (selected === oi) { bg = "#ecfdf5"; border = colors.primary; }

                return (
                  <TouchableOpacity
                    key={oi}
                    style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => handleSelect(q.id, oi)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optText, submitted && oi === q.correct && { color: "#065f46" }]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

      {!submitted ? (
        <TouchableOpacity
          style={[styles.btn, !allAnswered && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {allAnswered ? "Submit Quiz" : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>
            {questions.filter((q) => answers[q.id] === q.correct).length === questions.length ? "⭐" : "✓"}
          </Text>
          <Text style={styles.resultText}>
            {questions.filter((q) => answers[q.id] === q.correct).length}/{questions.length} correct
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 16,
  },
  qBlock: { marginBottom: 18 },
  qNum: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D3228",
    marginBottom: 8,
    lineHeight: 22,
  },
  options: { gap: 6 },
  optBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optText: { fontSize: 14, color: "#3D3228", fontWeight: "500" },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  resultCard: {
    marginTop: 16,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
  },
  resultEmoji: { fontSize: 32, marginBottom: 8 },
  resultText: { fontSize: 18, fontWeight: "700", color: "#065f46" },
});
