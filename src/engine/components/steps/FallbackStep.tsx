// ─── FallbackStep — safe render for unknown/not-yet-built step types ───

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function FallbackStep({ step, onContinue }: StepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.warn}>⚠️ Unknown step type</Text>
      <Text style={styles.detail}>
        Type: "{step.type}" is not yet implemented. The engine will skip it safely.
      </Text>
      <Text style={styles.continue} onPress={onContinue}>
        Skip →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  warn: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: "#A09484",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  continue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
});
