// ─── InfoStep — text/reading step with optional narration ───

import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function InfoStep({ step, narration }: StepProps) {
  const s = step as { title?: string; body: string };

  // Auto-play narration on mount
  useEffect(() => {
    narration.play();
    return () => narration.stop();
  }, []);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {s.title && <Text style={styles.title}>{s.title}</Text>}
      <Text style={styles.body}>{s.body}</Text>
      {narration.isPlaying && (
        <View style={styles.listeningBadge}>
          <Text style={styles.listeningText}>🔊 Listening...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: 4,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 16,
    lineHeight: 30,
  },
  body: {
    fontSize: 17,
    lineHeight: 28,
    color: "#3D3228",
  },
  listeningBadge: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  listeningText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
  },
});
