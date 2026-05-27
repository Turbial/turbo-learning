// ScenarioStep — Scenario judgment with Tap + Submit, 15 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

interface ScenarioProps {
  step: { title?: string; body: string; question?: string; options?: string[]; correct?: number; feedback?: string[] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function ScenarioStep({ step, onNext, onXP }: ScenarioProps) {
  const hasQuiz = step.options && step.options.length > 0;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (i: number) => {
    if (submitted) return;
    haptic();
    setSelected(i);
    setSubmitted(true);
    onXP(15);
    setTimeout(onNext, 1500);
  };

  const isCorrect = submitted && selected === step.correct;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>SCENARIO</Text>
        {step.title && <Text style={styles.title}>{step.title}</Text>}
        <Text style={styles.body}>{step.body}</Text>
      </View>
      {hasQuiz && (
        <>
          <Text style={styles.question}>{step.question}</Text>
          <View style={styles.options}>
            {step.options!.map((opt, i) => {
              const isSel = selected === i;
              let bg = "#FDFBF8", border = "#e8e2d9";
              if (submitted && i === step.correct) { bg = "#fff7ed"; border = ORANGE; }
              else if (submitted && isSel && i !== step.correct) { bg = "#fef2f2"; border = "#ef4444"; }
              else if (isSel && !submitted) { bg = "#fff7ed"; border = ORANGE; }
              return (
                <TouchableOpacity key={i} style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => handleSelect(i)} activeOpacity={0.7}>
                  <Text style={[styles.optionText, submitted && i === step.correct && { color: ORANGE }]}>{opt}</Text>
                  {submitted && i === step.correct && <Text style={[styles.check, { color: ORANGE }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
          {submitted && step.feedback && (
            <View style={[styles.feedback, isCorrect ? styles.fbCorrect : styles.fbWrong]}>
              <Text style={styles.fbText}>{isCorrect ? step.feedback[0] : step.feedback[1]}</Text>
            </View>
          )}
        </>
      )}
      {!hasQuiz && (
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>Continue →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 28, borderWidth: 1.5, borderColor: ORANGE + "20", shadowColor: ORANGE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 2, color: ORANGE, marginBottom: 12, textTransform: "uppercase" },
  title: { fontSize: 20, fontWeight: "700", color: "#2D241C", marginBottom: 14, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 26, color: "#5A4E40" },
  question: { fontSize: 18, fontWeight: "700", color: "#2D241C", marginBottom: 16, lineHeight: 26 },
  options: { gap: 10 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 14, borderWidth: 2 },
  optionText: { fontSize: 16, fontWeight: "600", color: "#2D241C", flex: 1 },
  check: { fontSize: 18, fontWeight: "700" },
  feedback: { marginTop: 20, padding: 16, borderRadius: 14 },
  fbCorrect: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: ORANGE + "40" },
  fbWrong: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  fbText: { fontSize: 15, color: "#3D3228", lineHeight: 22 },
  nextBtn: { marginTop: 24, backgroundColor: ORANGE, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
