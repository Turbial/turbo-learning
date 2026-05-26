// ─── CopyActionStep — shows text to copy, then triggers paste step ───

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";
import { StepProps } from "../../stepRegistry";

export default function CopyActionStep({ step, onAnswer }: StepProps) {
  const s = step as any;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(s.body);
    onAnswer({ copied: s.body });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Copy this to use in the next step:</Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{s.body}</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleCopy} activeOpacity={0.8}>
        <Text style={styles.btnText}>📋 Copy to Clipboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  instruction: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D241C",
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#e2e8f0",
    fontFamily: "monospace",
  },
  btn: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
