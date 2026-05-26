// ─── ScenarioCardStep — framed contextual info step ───

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function ScenarioCardStep({ step }: StepProps) {
  const s = step as { title?: string; body: string };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>SCENARIO</Text>
      {s.title && <Text style={styles.title}>{s.title}</Text>}
      <Text style={styles.body}>{s.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    borderWidth: 1.5,
    borderColor: "#05966920",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#059669",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 14,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#5A4E40",
  },
});
