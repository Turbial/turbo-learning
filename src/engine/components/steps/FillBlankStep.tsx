// ─── FillBlankStep — type the missing word (uses shared stepStyles) ───

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { FillBlankStep as FillBlankStepType } from "../../types";
import { stepStyles as s } from "./stepStyles";

export default function FillBlankStep({ step, onAnswer }: StepProps) {
  const fb = step as FillBlankStepType;
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    onAnswer(answer.trim());
  };

  const isCorrect = submitted && (() => {
    const n = answer.trim().toLowerCase();
    const correct = fb.answer.toLowerCase();
    const aliases = fb.aliases?.map((a: string) => a.toLowerCase()) ?? [];
    return n === correct || aliases.includes(n);
  })();

  return (
    <View style={s.container}>
      <Text style={s.question}>{fb.question}</Text>

      <TextInput
        style={[s.input, submitted && (isCorrect ? s.inputCorrect : s.inputWrong)]}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Type your answer..."
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitted}
      />

      {!submitted ? (
        <TouchableOpacity
          style={[s.actionBtn, !answer.trim() && s.actionBtnDisabled]}
          onPress={handleSubmit}
          disabled={!answer.trim()}
          activeOpacity={0.8}
        >
          <Text style={s.actionBtnText}>Check Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={[s.feedback, isCorrect ? s.feedbackCorrect : s.feedbackWrong]}>
          <Text style={s.feedbackEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.feedbackText}>
              {isCorrect ? fb.feedback[0] : fb.feedback[1] || `The correct answer is: ${fb.answer}`}
            </Text>
            {!isCorrect && <Text style={{ fontSize: 14, color: "#059669", fontWeight: "600", marginTop: 4 }}>Correct: {fb.answer}</Text>}
          </View>
        </View>
      )}
    </View>
  );
}
