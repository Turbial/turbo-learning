// SafetyStep — "I understand" tap, 5 XP
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

interface SafetyProps {
  step: { title?: string; body: string };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function SafetyStep({ step, onNext, onXP }: SafetyProps) {
  const handleTap = () => {
    haptic();
    onXP(5);
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.shieldCard}>
        <Text style={styles.shieldIcon}>🛡️</Text>
        <Text style={styles.title}>{step.title ?? "Safety First"}</Text>
        <Text style={styles.body}>{step.body}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleTap} activeOpacity={0.8}>
        <Text style={styles.btnText}>I Understand</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  shieldCard: { backgroundColor: "#fff", borderRadius: 20, padding: 32, borderWidth: 2, borderColor: ORANGE + "30", alignItems: "center", marginBottom: 28, shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, maxWidth: 400 },
  shieldIcon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#2D241C", marginBottom: 12, textAlign: "center" },
  body: { fontSize: 16, lineHeight: 26, color: "#5A4E40", textAlign: "center" },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
