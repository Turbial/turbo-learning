// ─── ExampleStep — shows an example/prompt ───

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function ExampleStep({ step }: StepProps) {
  const s = step as { title?: string; prompt: string };

  return (
    <View style={styles.container}>
      {s.title && <Text style={styles.title}>{s.title}</Text>}
      <View style={styles.promptBox}>
        <Text style={styles.promptLabel}>EXAMPLE</Text>
        <Text style={styles.prompt}>{s.prompt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 20,
    lineHeight: 28,
  },
  promptBox: {
    backgroundColor: "#FDFBF8",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e8e2d9",
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#A09484",
    marginBottom: 12,
  },
  prompt: {
    fontSize: 15,
    lineHeight: 24,
    color: "#5A4E40",
    fontFamily: "Georgia",
  },
});
