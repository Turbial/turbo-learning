// AudioBar — Audio playback speed control (0.8x/1x/1.25x/1.5x/2x)
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ORANGE = "#E84E0F";
const SPEEDS = [0.8, 1, 1.25, 1.5, 2];

interface AudioBarProps {
  isPlaying: boolean;
  speed: number;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

export function AudioBar({ isPlaying, speed, onTogglePlay, onSpeedChange }: AudioBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playBtn} onPress={onTogglePlay} activeOpacity={0.7}>
        <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
      </TouchableOpacity>
      <View style={styles.speedRow}>
        {SPEEDS.map((s) => (
          <TouchableOpacity key={s}
            style={[styles.speedBtn, speed === s && styles.speedBtnActive]}
            onPress={() => onSpeedChange(s)} activeOpacity={0.7}>
            <Text style={[styles.speedText, speed === s && styles.speedTextActive]}>{s}x</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isPlaying && (
        <View style={styles.listeningBadge}>
          <Text style={styles.listeningText}>🔊 Playing</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "#e8e2d9" },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: ORANGE, justifyContent: "center", alignItems: "center" },
  playIcon: { fontSize: 18, color: "#fff" },
  speedRow: { flexDirection: "row", gap: 4, flex: 1 },
  speedBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  speedBtnActive: { backgroundColor: "#fff7ed" },
  speedText: { fontSize: 13, fontWeight: "600", color: "#A09484" },
  speedTextActive: { color: ORANGE },
  listeningBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#fff7ed", borderWidth: 1, borderColor: ORANGE + "40" },
  listeningText: { fontSize: 11, color: ORANGE, fontWeight: "600" },
});
