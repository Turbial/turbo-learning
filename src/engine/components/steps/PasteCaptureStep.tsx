// ─── PasteCaptureStep — captures what the user pasted from the copy step ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function PasteCaptureStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const [text, setText] = useState("");
  const minLength = s.minLength ?? 20;
  const isValid = text.trim().length >= minLength;

  const handleSubmit = () => {
    if (!isValid) return;
    onAnswer({ pasted: text.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{s.body}</Text>

      <TextInput
        style={styles.textArea}
        value={text}
        onChangeText={setText}
        placeholder="Paste your output here..."
        placeholderTextColor="#C4BDB6"
        multiline
        textAlignVertical="top"
      />

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
});
