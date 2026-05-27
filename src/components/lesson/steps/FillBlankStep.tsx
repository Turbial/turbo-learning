// FillBlankStep — Type + Check, 5 XP, alias matching
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";

const hapticLight = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };
const hapticHeavy = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Heavy); } } catch {} };

interface FillBlankProps {
  step: { question: string; answer: string; aliases?: string[]; feedback: [string, string] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function FillBlankStep({ step, onNext, onXP }: FillBlankProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const checkCorrect = (val: string) => {
    const n = val.trim().toLowerCase();
    const aliases = step.aliases?.map((a) => a.toLowerCase()) ?? [];
    return n === step.answer.toLowerCase() || aliases.includes(n);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    hapticLight();
    const isCorrect = checkCorrect(text);
    setSubmitted(true);
    onXP(isCorrect ? 5 : 5);
    if (isCorrect) hapticHeavy();
  };

  const isCorrect = submitted && checkCorrect(text);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{step.question}</Text>
      <TextInput
        style={[styles.input, submitted && (isCorrect ? styles.inputCorrect : styles.inputWrong)]}
        value={text}
        onChangeText={setText}
        placeholder="Type your answer..."
        placeholderTextColor="#C4BDB6"
        editable={!submitted}
        autoCapitalize="none"
      />
      {!submitted ? (
        <TouchableOpacity style={[styles.btn, !text.trim() && styles.btnDisabled]} onPress={handleSubmit} disabled={!text.trim()} activeOpacity={0.8}>
          <Text style={styles.btnText}>Check</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={[styles.feedback, isCorrect ? styles.fbCorrect : styles.fbWrong]}>
            <Text style={styles.fbEmoji}>{isCorrect ? "✓" : "✗"}</Text>
            <Text style={styles.fbText}>{isCorrect ? step.feedback[0] : step.feedback[1]}</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  question: { fontSize: 19, fontWeight: "700", color: "#2D241C", marginBottom: 24, lineHeight: 28 },
  input: { backgroundColor: "#FDFBF8", borderWidth: 1.5, borderColor: "#e0d9cf", borderRadius: 14, padding: 16, fontSize: 18, color: "#3D3228", marginBottom: 16 },
  inputCorrect: { borderColor: ORANGE, backgroundColor: "#fff7ed" },
  inputWrong: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  feedback: { marginTop: 16, flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 16, borderRadius: 14 },
  fbCorrect: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: ORANGE + "40" },
  fbWrong: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  fbEmoji: { fontSize: 20, fontWeight: "700", marginTop: 1 },
  fbText: { fontSize: 15, color: "#3D3228", flex: 1, lineHeight: 22 },
  nextBtn: { marginTop: 16, backgroundColor: ORANGE, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
