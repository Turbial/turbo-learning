// ─── HighlightStep — text with highlighted phrases (uses shared stepStyles) ───
// Supports pre-generated audio via audio_url with TTS fallback.

import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import { StepProps } from "../../stepRegistry";
import { stepStyles as s } from "./stepStyles";

export default function HighlightStep({ step, narration }: StepProps) {
  const st = step as { body: string; highlights: string[]; audio_url?: string | null };
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState<"pregen" | "tts" | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const hasPregen = !!(st.audio_url);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      narration.stop();
    };
  }, []);

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
        (status: any) => { if (status.isLoaded && status.didJustFinish) setIsPlaying(false); },
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

  const parts = splitByHighlights(st.body, st.highlights);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4, paddingBottom: 40 }}>
      <Text style={s.body}>
        {parts.map((part, i) =>
          part.highlight ? (
            <Text key={i} style={s.highlighted}>{part.text}</Text>
          ) : (
            <Text key={i}>{part.text}</Text>
          ),
        )}
      </Text>

      <View style={s.audioBar}>
        <TouchableOpacity style={s.playBtn} onPress={togglePlay} activeOpacity={0.7}>
          <Text style={s.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <View style={s.speedGroup}>
          {[0.8, 1, 1.5, 2].map((sp) => (
            <TouchableOpacity
              key={sp}
              style={[s.speedBtn, narration.speed === sp && s.speedBtnActive]}
              onPress={() => narration.setSpeed(sp)}
              activeOpacity={0.7}
            >
              <Text style={[s.speedText, narration.speed === sp && s.speedTextActive]}>{sp}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isPlaying && (
        <View style={s.listeningBadge}>
          <Text style={s.listeningText}>
            {audioMode === "pregen" ? "🎧 HD Audio" : "🔊 Listening..."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function splitByHighlights(body: string, highlights: string[]): { text: string; highlight: boolean }[] {
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
