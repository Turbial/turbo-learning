// ─── HighlightStep — text with highlighted phrases (uses shared stepStyles) ───

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { stepStyles as s } from "./stepStyles";

export default function HighlightStep({ step, narration }: StepProps) {
  const st = step as { body: string; highlights: string[] };
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
          <Text style={s.listeningText}>🔊 Listening...</Text>
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
