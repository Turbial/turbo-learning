// StreakStep — Streak display, tap Continue, no XP
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ORANGE = "#E84E0F";

interface StreakProps {
  step: { streak?: number; shieldCount?: number; message?: string };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function StreakStep({ step, onNext }: StreakProps) {
  const streak = step.streak ?? 1;
  const shields = step.shieldCount ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔥 Your Streak</Text>
      <View style={styles.streakDisplay}>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>day{streak !== 1 ? "s" : ""}</Text>
      </View>
      <Text style={styles.message}>{step.message ?? "You're building momentum. Keep going!"}</Text>
      {shields > 0 && (
        <View style={styles.shieldRow}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.shieldText}>{shields} Streak Shield{shields !== 1 ? "s" : ""}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  heading: { fontSize: 22, fontWeight: "800", color: "#2D241C", marginBottom: 20 },
  streakDisplay: { alignItems: "center", marginBottom: 16 },
  streakNum: { fontSize: 64, fontWeight: "800", color: ORANGE },
  streakLabel: { fontSize: 16, color: "#A09484", fontWeight: "600", marginTop: 4 },
  message: { fontSize: 16, color: "#6B5E50", textAlign: "center", lineHeight: 24, marginBottom: 24 },
  shieldRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff7ed", borderRadius: 14, padding: 14, paddingHorizontal: 20, marginBottom: 28, borderWidth: 1, borderColor: ORANGE + "40" },
  shieldIcon: { fontSize: 20 },
  shieldText: { fontSize: 15, fontWeight: "600", color: ORANGE },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
