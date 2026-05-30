// ─── HighlightStep — text with highlighted phrases ───

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { colors } from "../../../theme/tokens";

export default function HighlightStep({ step, narration }: StepProps) {
  const s = step as { body: string; highlights: string[] };
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setIsPlaying(narration.isPlaying), 200);
    return () => { clearInterval(interval); narration.stop(); };
  }, []);

  const togglePlay = () => {
    if (narration.isPlaying) narration.pause();
    else narration.play();
    setIsPlaying(narration.isPlaying);
  };

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
      {/* Audio controls */}
      <View style={styles.audioBar}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.7}>
          <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <View style={styles.speedGroup}>
          {[0.8, 1, 1.5, 2].map((sp) => (
            <TouchableOpacity
              key={sp}
              style={[styles.speedBtn, narration.speed === sp && styles.speedBtnActive]}
              onPress={() => narration.setSpeed(sp)}
              activeOpacity={0.7}
            >
              <Text style={[styles.speedText, narration.speed === sp && styles.speedTextActive]}>{sp}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {isPlaying && (
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
  audioBar: {
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20,
    backgroundColor: colors.surface, borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  playBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  playIcon: { fontSize: 18, color: "#fff" },
  speedGroup: { flexDirection: "row", gap: 4 },
  speedBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  speedBtnActive: { backgroundColor: colors.primaryDim },
  speedText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  speedTextActive: { color: colors.primary },
  listeningBadge: {
    marginTop: 12, alignSelf: "flex-start", backgroundColor: "#ecfdf5",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: "#a7f3d0",
  },
  listeningText: { fontSize: 12, color: "#059669", fontWeight: "600" },
});
