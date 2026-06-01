// ─── TrueFalseStep — true/false choice (uses shared stepStyles) ───

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { TrueFalseStep as TrueFalseStepType } from "../../types";
import { stepStyles as s } from "./stepStyles";

export default function TrueFalseStep({ step, onAnswer }: StepProps) {
  const tf = step as TrueFalseStepType;
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (val: boolean) => {
    if (submitted) return;
    setSelected(val);
    setSubmitted(true);
    onAnswer(val);
  };

  const isCorrect = submitted && selected === tf.correct;

  return (
    <View style={s.container}>
      <Text style={s.question}>{tf.question}</Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        {[true, false].map((val) => {
          const isSelected = selected === val;
          let style = s.optionDefault;
          if (submitted && val === tf.correct) style = s.optionCorrect;
          else if (submitted && isSelected && val !== tf.correct) style = s.optionWrong;
          else if (isSelected && !submitted) style = s.optionSelected;

          return (
            <TouchableOpacity
              key={String(val)}
              style={[s.option, style, { justifyContent: "center", flex: 1, paddingVertical: 20 }]}
              onPress={() => handleSelect(val)}
              activeOpacity={0.7}
            >
              <Text style={[s.optionText, submitted && val === tf.correct && s.optionTextCorrect, { fontSize: 20 }]}>
                {val ? "True" : "False"}
              </Text>
              {submitted && val === tf.correct && (
                <Text style={[s.feedbackEmoji, { color: "#059669" }]}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View style={[s.feedback, isCorrect ? s.feedbackCorrect : s.feedbackWrong]}>
          <Text style={s.feedbackEmoji}>{isCorrect ? "✓" : "✗"}</Text>
          <Text style={s.feedbackText}>
            {isCorrect ? tf.feedback[0] : tf.feedback[1]}
          </Text>
        </View>
      )}
    </View>
  );
}
