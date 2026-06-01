// ─── QuizStep — mini-quiz (uses shared stepStyles) ───

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { QuizStep as QuizStepType } from "../../types";
import { stepStyles as s } from "./stepStyles";

export default function QuizStep({ step, onAnswer }: StepProps) {
  const qz = step as QuizStepType;
  const questions = (qz.questions as Array<{ id: string; question: string; options: string[]; correct: number }>) ?? [];
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
    onAnswer(answers);
  };

  return (
    <View style={s.container}>
      <Text style={[s.question, { fontSize: 20 }]}>Quick Quiz</Text>

      {questions.map((q, qi) => {
        const selected = answers[q.id];

        return (
          <View key={q.id} style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#3D3228", marginBottom: 8, lineHeight: 22 }}>
              Q{qi + 1}. {q.question}
            </Text>
            <View style={{ gap: 6 }}>
              {q.options.map((opt, oi) => {
                let style = s.optionDefault;
                if (submitted && oi === q.correct) style = s.optionCorrect;
                else if (submitted && oi === selected && oi !== q.correct) style = s.optionWrong;
                else if (selected === oi) style = s.optionSelected;

                return (
                  <TouchableOpacity
                    key={oi}
                    style={[s.option, style, { paddingVertical: 12 }]}
                    onPress={() => handleSelect(q.id, oi)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.optionText, submitted && oi === q.correct && s.optionTextCorrect]}>
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
          style={[s.actionBtn, !allAnswered && s.actionBtnDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered}
          activeOpacity={0.8}
        >
          <Text style={s.actionBtnText}>
            {allAnswered ? "Submit Quiz" : `Answer all (${Object.keys(answers).length}/${questions.length})`}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[s.feedback, s.feedbackCorrect, { alignItems: "center" as const }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>
            {questions.filter((q) => answers[q.id] === q.correct).length === questions.length ? "⭐" : "✓"}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#065f46" }}>
            {questions.filter((q) => answers[q.id] === q.correct).length}/{questions.length} correct
          </Text>
        </View>
      )}
    </View>
  );
}
