// ─── InfoStep — reading step with narration (uses shared stepStyles) ───
// If step has audio_url (pre-generated MP3), plays that via Audio.Sound.
// Falls back to expo-speech TTS if no pre-generated audio.

import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import { StepProps } from "../../stepRegistry";
import { stepStyles as s, stepStyles } from "./stepStyles";

export default function InfoStep({ step, narration }: StepProps) {
  const st = step as { title?: string; body: string; audio_url?: string | null };
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState<"pregen" | "tts" | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const hasPregen = !!(st.audio_url);

  // Cleanup
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      narration.stop();
    };
  }, []);

  // Play pre-generated audio
  const playPregen = useCallback(async () => {
    if (!st.audio_url) return;
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
            return;
          }
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: st.audio_url },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
        },
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.warn("Pregen audio failed, falling back to TTS:", err);
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      narration.play();
      setIsPlaying(true);
    }
  }, [st.audio_url, narration]);

  // Monitor TTS state when in TTS mode
  useEffect(() => {
    if (audioMode === "pregen") return;
    const interval = setInterval(() => {
      const p = narration.isPlaying;
      setIsPlaying(p);
      if (audioMode === "tts" && !p) setAudioMode(null);
    }, 200);
    return () => clearInterval(interval);
  }, [audioMode, narration]);

  const togglePlay = () => {
    if (hasPregen && audioMode !== "tts") {
      setAudioMode("pregen");
      playPregen();
    } else {
      setAudioMode("tts");
      if (narration.isPlaying) { narration.pause(); setIsPlaying(false); }
      else { narration.play(); setIsPlaying(true); }
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4, paddingBottom: 40 }}>
      {st.title && <Text style={{ fontSize: 22, fontWeight: "700", color: "#1a1a2e", marginBottom: 16, lineHeight: 30 }}>{st.title}</Text>}
      <Text style={stepStyles.body}>{st.body}</Text>

      <View style={stepStyles.audioBar}>
        <TouchableOpacity style={stepStyles.playBtn} onPress={togglePlay} activeOpacity={0.7}>
          <Text style={stepStyles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <View style={stepStyles.speedGroup}>
          {[0.8, 1, 1.5, 2].map((sp) => (
            <TouchableOpacity
              key={sp}
              style={[stepStyles.speedBtn, narration.speed === sp && stepStyles.speedBtnActive]}
              onPress={() => narration.setSpeed(sp)}
              activeOpacity={0.7}
            >
              <Text style={[stepStyles.speedText, narration.speed === sp && stepStyles.speedTextActive]}>{sp}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isPlaying && (
        <View style={stepStyles.listeningBadge}>
          <Text style={stepStyles.listeningText}>
            {audioMode === "pregen" ? "🎧 HD Audio" : "🔊 Listening..."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
