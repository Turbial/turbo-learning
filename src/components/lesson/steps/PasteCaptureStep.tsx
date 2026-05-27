// PasteCaptureStep — Paste AI answer, 10 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

interface PasteCaptureProps {
  step: { body: string; minLength?: number };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function PasteCaptureStep({ step, onNext, onXP }: PasteCaptureProps) {
  const [text, setText] = useState("");
  const minLen = step.minLength ?? 20;
  const isValid = text.trim().length >= minLen;

  const handleSubmit = () => {
    if (!isValid) return;
    haptic();
    onXP(10);
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{step.body}</Text>
      <TextInput style={styles.textArea} value={text} onChangeText={setText}
        placeholder="Paste your output here..." placeholderTextColor="#C4BDB6"
        multiline textAlignVertical="top" />
      <Text style={[styles.hint, text.length > 0 && !isValid && styles.hintWarn]}>
        {text.length}/{minLen} characters minimum
      </Text>
      <TouchableOpacity style={[styles.btn, !isValid && styles.btnDisabled]} onPress={handleSubmit} disabled={!isValid} activeOpacity={0.8}>
        <Text style={styles.btnText}>Submit & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  instruction: { fontSize: 16, color: "#5A4E40", marginBottom: 16, lineHeight: 24 },
  textArea: { backgroundColor: "#FDFBF8", borderWidth: 1.5, borderColor: "#e0d9cf", borderRadius: 14, padding: 16, fontSize: 15, lineHeight: 22, color: "#3D3228", minHeight: 120 },
  hint: { fontSize: 12, color: "#A09484", marginTop: 8 },
  hintWarn: { color: "#ef4444" },
  btn: { marginTop: 20, backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
