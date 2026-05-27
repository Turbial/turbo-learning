// BeforeAfterStep — Before/after display, no XP (info step)
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const ORANGE = "#E84E0F";

interface BeforeAfterProps {
  step: { title?: string; body: string; beforeLabel?: string; afterLabel?: string };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function BeforeAfterStep({ step }: BeforeAfterProps) {
  const parts = step.body.split("---AFTER---");
  const beforeText = parts[0]?.trim() ?? step.body;
  const afterText = parts[1]?.trim() ?? "";

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {step.title && <Text style={styles.title}>{step.title}</Text>}
      <View style={[styles.section, styles.beforeSection]}>
        <Text style={styles.sectionLabel}>{step.beforeLabel ?? "Before"}</Text>
        <Text style={styles.sectionText}>{beforeText}</Text>
      </View>
      {afterText ? (
        <View style={[styles.section, styles.afterSection]}>
          <Text style={[styles.sectionLabel, { color: ORANGE }]}>{step.afterLabel ?? "After"}</Text>
          <Text style={styles.sectionText}>{afterText}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 4, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", color: "#2D241C", marginBottom: 20, lineHeight: 30 },
  section: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1.5 },
  beforeSection: { backgroundColor: "#FDFBF8", borderColor: "#e8e2d9" },
  afterSection: { backgroundColor: "#fff7ed", borderColor: ORANGE + "40" },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 2, color: "#A09484", textTransform: "uppercase", marginBottom: 10 },
  sectionText: { fontSize: 16, lineHeight: 26, color: "#3D3228" },
});
