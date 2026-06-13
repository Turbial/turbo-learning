// ─── McStep — multiple choice (uses shared stepStyles) ───

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { McStep as McStepType } from "../../types";
import { stepStyles as s } from "./stepStyles";

export default function McStep({ step, onAnswer }: StepProps) {
  const mc = step as McStepType;
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

  const isCorrect = submitted && selected === mc.correct;
  const isWrong = submitted && selected !== mc.correct;

  return (
    <View style={s.container}>
      <Text style={s.question}>{mc.question}</Text>

      <View style={{ gap: 10 }}>
        {mc.options.map((opt: string, i: number) => {
          let style = s.optionDefault;
          if (submitted && i === mc.correct) style = s.optionCorrect;
          else if (submitted && i === selected && i !== mc.correct) style = s.optionWrong;
          else if (selected === i) style = s.optionSelected;

          return (
            <TouchableOpacity
              key={i}
              style={[s.option, style]}
              onPress={() => handleSelect(i)}
              activeOpacity={0.7}
            >
              <View style={[s.radio, selected === i && s.radioSelected]}>
                {selected === i && <View style={s.radioFill} />}
              </View>
              <Text style={[s.optionText, submitted && i === mc.correct && s.optionTextCorrect]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!submitted ? (
        <TouchableOpacity
          style={[s.actionBtn, selected === null && s.actionBtnDisabled]}
          onPress={handleSubmit}
          disabled={selected === null}
          activeOpacity={0.8}
        >
          <Text style={s.actionBtnText}>Check Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={[s.feedback, isCorrect ? s.feedbackCorrect : s.feedbackWrong]}>
          <Text style={s.feedbackEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <Text style={s.feedbackText}>
            {mc.feedback.length === mc.options.length
              ? mc.feedback[selected!] || "Not quite. The correct answer is highlighted above."
              : isCorrect
                ? mc.feedback[0]
                : mc.feedback[1] || "Not quite. The correct answer is highlighted above."}
          </Text>
        </View>
      )}
    </View>
  );
}
