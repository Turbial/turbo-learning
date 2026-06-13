// ─── ReflectionStep — open-ended reflection questions ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { ReflectionStep as ReflectionStepType } from "../../types";

export default function ReflectionStep({ step, onAnswer }: StepProps) {
  const s = step as ReflectionStepType;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onAnswer(answers);
  };

  // Handle both legacy (prompt directly on step) and current (questions array) formats
  const questions = s.questions && s.questions.length > 0
    ? s.questions
    : [{ id: "r1", prompt: (s as any).question || (s as any).prompt || "What are your thoughts?", placeholder: "Reflect here..." }];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Take a moment to reflect:</Text>

      {questions.map((q: any, i: number) => (
        <View key={q.id} style={styles.qGroup}>
          <Text style={styles.qLabel}>
            {i + 1}. {q.label ?? q.prompt}
          </Text>
          <TextInput
            style={styles.input}
            value={answers[q.id] ?? ""}
            onChangeText={(t) => setAnswers((p) => ({ ...p, [q.id]: t }))}
            placeholder={q.placeholder || "Write your thoughts..."}
            placeholderTextColor="#C4BDB6"
            multiline
            editable={!submitted}
          />
        </View>
      ))}

      {!submitted && (
        <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.btnText}>Save Reflection</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 4, paddingBottom: 40 },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 20,
  },
  qGroup: { marginBottom: 20 },
  qLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D3228",
    marginBottom: 10,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#FDFBF8",
    borderWidth: 1.5,
    borderColor: "#e0d9cf",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#3D3228",
    minHeight: 60,
  },
  btn: {
    marginTop: 8,
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
