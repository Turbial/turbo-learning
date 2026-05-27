// ReflectionStep — Any choice reflection, 5 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";

const ORANGE = "#E84E0F";

interface ReflectionProps {
  step: { title?: string; questions?: { id: string; prompt: string; placeholder?: string; minChars?: number }[] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function ReflectionStep({ step, onNext, onXP }: ReflectionProps) {
  const questions = step.questions ?? [{ id: "q1", prompt: "What did you learn?", placeholder: "Share your thoughts..." }];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => (answers[q.id] ?? "").trim().length >= (q.minChars ?? 1));

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    onXP(5);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>{step.title ?? "Take a moment to reflect:"}</Text>
      {questions.map((q, i) => (
        <View key={q.id} style={styles.qGroup}>
          <Text style={styles.qLabel}>{i + 1}. {q.prompt}</Text>
          <TextInput style={styles.input}
            value={answers[q.id] ?? ""}
            onChangeText={(t) => setAnswers((p) => ({ ...p, [q.id]: t }))}
            placeholder={q.placeholder ?? "Write your thoughts..."}
            placeholderTextColor="#C4BDB6" multiline editable={!submitted} />
        </View>
      ))}
      {!submitted ? (
        <TouchableOpacity style={[styles.btn, !allAnswered && styles.btnDisabled]} onPress={handleSubmit} disabled={!allAnswered} activeOpacity={0.8}>
          <Text style={styles.btnText}>Save Reflection</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>Continue →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 4, paddingBottom: 40 },
  heading: { fontSize: 18, fontWeight: "700", color: "#2D241C", marginBottom: 20 },
  qGroup: { marginBottom: 20 },
  qLabel: { fontSize: 15, fontWeight: "600", color: "#3D3228", marginBottom: 10, lineHeight: 22 },
  input: { backgroundColor: "#FDFBF8", borderWidth: 1.5, borderColor: "#e0d9cf", borderRadius: 12, padding: 14, fontSize: 15, lineHeight: 22, color: "#3D3228", minHeight: 60 },
  btn: { marginTop: 8, backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  nextBtn: { marginTop: 16, backgroundColor: ORANGE, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
