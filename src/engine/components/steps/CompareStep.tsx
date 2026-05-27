// ─── CompareStep — user compares two approaches/ideas ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { colors } from "../../../theme/tokens";

export default function CompareStep({ step, onAnswer }: StepProps) {
  const s = step as any;
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
    onAnswer({ comparison: text.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{s.question}</Text>

      <TextInput
        style={styles.textArea}
        value={text}
        onChangeText={setText}
        placeholder="Write your comparison here..."
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
        editable={!submitted}
      />

      {!submitted && (
        <TouchableOpacity
          style={[styles.btn, !text.trim() && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  question: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 16,
    lineHeight: 26,
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
    minHeight: 140,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
