// ─── PasteCaptureStep — captures what the user pasted from the copy step ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { PasteCaptureStep as PasteCaptureStepType } from "../../types";

export default function PasteCaptureStep({ step, onAnswer }: StepProps) {
  const s = step as PasteCaptureStepType;
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const minLength = s.minLength ?? 20;
  const isValid = text.trim().length >= minLength;

  const handleSubmit = () => {
    if (!isValid || submitted) return;
    setSubmitted(true);
    onAnswer({ pasted: text.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{s.body}</Text>

      <TextInput
        style={[styles.textArea, submitted && styles.textAreaSubmitted]}
        value={text}
        onChangeText={setText}
        placeholder="Paste your output here..."
        placeholderTextColor="#C4BDB6"
        multiline
        textAlignVertical="top"
        editable={!submitted}
      />

      {!submitted ? (
        <>
          <Text style={[styles.hint, text.length > 0 && !isValid && styles.hintWarn]}>
            {text.length}/{minLength} characters minimum
          </Text>

          <TouchableOpacity
            style={[styles.btn, !isValid && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Submit</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.submittedCard}>
          <Text style={styles.submittedEmoji}>✓</Text>
          <Text style={styles.submittedLabel}>Submitted!</Text>
          <Text style={styles.submittedHint}>Tap Continue to move on</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  instruction: {
    fontSize: 16,
    color: "#5A4E40",
    marginBottom: 16,
    lineHeight: 24,
  },
  textArea: {
    backgroundColor: "#FDFBF8",
    borderWidth: 1.5,
    borderColor: "#e0d9cf",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#3D3228",
    minHeight: 120,
  },
  textAreaSubmitted: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  hint: {
    fontSize: 12,
    color: "#A09484",
    marginTop: 8,
  },
  hintWarn: { color: "#ef4444" },
  btn: {
    marginTop: 20,
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  submittedCard: {
    marginTop: 20,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
  },
  submittedEmoji: { fontSize: 28, color: "#059669", marginBottom: 8 },
  submittedLabel: { fontSize: 17, fontWeight: "700", color: "#065f46" },
  submittedHint: { fontSize: 13, color: "#6B5E50", marginTop: 4 },
});
