// PromptGeneratorStep — Pick topic → generate prompt → copy, 5 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

interface PromptGeneratorProps {
  step: { topic?: string; template: string; fields?: { id: string; label: string; placeholder?: string }[] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function PromptGeneratorStep({ step, onNext, onXP }: PromptGeneratorProps) {
  const fields = step.fields ?? [{ id: "topic", label: "Topic", placeholder: "What do you want to generate?" }];
  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState(false);

  const allFilled = fields.every((f) => (values[f.id] ?? "").trim().length > 0);

  const generatePrompt = () => {
    if (!allFilled) return;
    setGenerated(true);
    onXP(5);
    haptic();
  };

  const promptText = fields.reduce((acc, f) => acc.replace(`{${f.id}}`, values[f.id] ?? ""), step.template);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(promptText);
    haptic();
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔧 Prompt Generator</Text>
      <Text style={styles.sub}>Fill in the fields to generate your prompt:</Text>
      {fields.map((field, i) => (
        <View key={field.id} style={styles.fieldGroup}>
          <Text style={styles.label}>{i + 1}. {field.label}</Text>
          <TextInput style={styles.input} value={values[field.id] ?? ""}
            onChangeText={(t) => setValues((p) => ({ ...p, [field.id]: t }))}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            placeholderTextColor="#C4BDB6" multiline editable={!generated} />
        </View>
      ))}
      {!generated ? (
        <TouchableOpacity style={[styles.btn, !allFilled && styles.btnDisabled]} onPress={generatePrompt} disabled={!allFilled} activeOpacity={0.8}>
          <Text style={styles.btnText}>Generate Prompt</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Your Prompt:</Text>
            <Text style={styles.resultText}>{promptText}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
            <Text style={styles.copyBtnText}>📋 Copy & Continue</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  heading: { fontSize: 22, fontWeight: "800", color: "#2D241C", marginBottom: 8 },
  sub: { fontSize: 15, color: "#6B5E50", marginBottom: 20, lineHeight: 22 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", color: "#2D241C", marginBottom: 8 },
  input: { backgroundColor: "#FDFBF8", borderWidth: 1.5, borderColor: "#e0d9cf", borderRadius: 12, padding: 14, fontSize: 15, lineHeight: 22, color: "#3D3228", minHeight: 56 },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  resultBox: { marginTop: 8, backgroundColor: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 16 },
  resultLabel: { fontSize: 12, fontWeight: "700", color: ORANGE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  resultText: { fontSize: 14, lineHeight: 22, color: "#e2e8f0", fontFamily: "monospace" },
  copyBtn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  copyBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
