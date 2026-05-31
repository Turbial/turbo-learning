// ─── InfoStep — text/reading step with narration controls ───

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { colors } from "../../../theme/tokens";

export default function InfoStep({ step, narration }: StepProps) {
  const s = step as { title?: string; body: string };
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync isPlaying with narration state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(narration.isPlaying);
    }, 200);
    return () => {
      clearInterval(interval);
      narration.stop();
    };
  }, []);

  const togglePlay = () => {
    if (narration.isPlaying) {
      narration.pause();
    } else {
      narration.play();
    }
    setIsPlaying(narration.isPlaying);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {s.title && <Text style={styles.title}>{s.title}</Text>}
      <Text style={styles.body}>{s.body}</Text>

      {/* Audio controls */}
      <View style={styles.audioBar}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.7}>
          <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <View style={styles.speedGroup}>
          {[0.8, 1, 1.5, 2].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.speedBtn, narration.speed === s && styles.speedBtnActive]}
              onPress={() => narration.setSpeed(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.speedText, narration.speed === s && styles.speedTextActive]}>
                {s}x
              </Text>
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
  audioBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: { fontSize: 18, color: "#fff" },
  speedGroup: {
    flexDirection: "row",
    gap: 4,
  },
  speedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  speedBtnActive: {
    backgroundColor: colors.primaryDim,
  },
  speedText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  speedTextActive: {
    color: colors.primary,
  },
  listeningBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  listeningText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
});
