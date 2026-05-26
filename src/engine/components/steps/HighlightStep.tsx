// ─── HighlightStep — text with highlighted phrases ───

import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { StepProps } from "../../stepRegistry";

export default function HighlightStep({ step, narration }: StepProps) {
  const s = step as { body: string; highlights: string[] };

  useEffect(() => {
    narration.play();
    return () => narration.stop();
  }, []);

  // Split body by highlight phrases and render them highlighted
  const parts = splitByHighlights(s.body, s.highlights);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.body}>
        {parts.map((part, i) =>
          part.highlight ? (
            <Text key={i} style={styles.highlighted}>{part.text}</Text>
          ) : (
            <Text key={i}>{part.text}</Text>
          ),
        )}
      </Text>
      {narration.isPlaying && (
        <View style={styles.listeningBadge}>
          <Text style={styles.listeningText}>🔊 Listening...</Text>
        </View>
      )}
    </ScrollView>
  );
}

function splitByHighlights(
  body: string,
  highlights: string[],
): { text: string; highlight: boolean }[] {
  if (highlights.length === 0) return [{ text: body, highlight: false }];

  const parts: { text: string; highlight: boolean }[] = [];
  let remaining = body;

  for (const hl of highlights) {
    const idx = remaining.indexOf(hl);
    if (idx === -1) continue;
    if (idx > 0) parts.push({ text: remaining.slice(0, idx), highlight: false });
    parts.push({ text: hl, highlight: true });
    remaining = remaining.slice(idx + hl.length);
  }
  if (remaining) parts.push({ text: remaining, highlight: false });

  return parts;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 4, paddingBottom: 40 },
  body: {
    fontSize: 17,
    lineHeight: 30,
    color: "#3D3228",
  },
  highlighted: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontWeight: "600",
    borderRadius: 4,
    paddingHorizontal: 2,
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
