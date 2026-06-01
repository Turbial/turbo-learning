// ─── InfoStep — reading step with narration (uses shared stepStyles) ───

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StepProps } from "../../stepRegistry";
import { stepStyles as s, stepStyles } from "./stepStyles";

export default function InfoStep({ step, narration }: StepProps) {
  const st = step as { title?: string; body: string };
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
          <Text style={stepStyles.listeningText}>🔊 Listening...</Text>
        </View>
      )}
    </ScrollView>
  );
}
