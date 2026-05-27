// ToolGridStep — Select 2 tools, 5 XP
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const ORANGE = "#E84E0F";
const haptic = () => { try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.impactAsync(H.ImpactFeedbackStyle.Light); } } catch {} };

interface ToolGridProps {
  step: { title?: string; body?: string; tools?: { id: string; name: string; icon: string; desc?: string }[] };
  onNext: () => void;
  onXP: (amount: number) => void;
}

const DEFAULT_TOOLS = [
  { id: "gpt", name: "ChatGPT", icon: "🤖", desc: "General purpose AI assistant" },
  { id: "claude", name: "Claude", icon: "🧠", desc: "Deep analysis & reasoning" },
  { id: "gemini", name: "Gemini", icon: "💎", desc: "Google's multimodal AI" },
  { id: "copilot", name: "Copilot", icon: "💻", desc: "Code & productivity" },
  { id: "perplexity", name: "Perplexity", icon: "🔍", desc: "Research & citations" },
  { id: "midjourney", name: "Midjourney", icon: "🎨", desc: "AI image generation" },
];

export default function ToolGridStep({ step, onNext, onXP }: ToolGridProps) {
  const tools = step.tools ?? DEFAULT_TOOLS;
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    haptic();
    setSelected((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= 2) return [...p.slice(1), id];
      return [...p, id];
    });
  };

  const handleSubmit = () => {
    if (selected.length === 2) {
      onXP(5);
      onNext();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{step.title ?? "Choose Your Tools"}</Text>
      {step.body && <Text style={styles.sub}>{step.body}</Text>}
      <View style={styles.grid}>
        {tools.map((tool) => {
          const isSel = selected.includes(tool.id);
          return (
            <TouchableOpacity key={tool.id}
              style={[styles.toolCard, isSel && styles.toolCardSelected]}
              onPress={() => toggle(tool.id)} activeOpacity={0.7}>
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <Text style={[styles.toolName, isSel && { color: ORANGE }]}>{tool.name}</Text>
              {tool.desc && <Text style={styles.toolDesc}>{tool.desc}</Text>}
              {isSel && <View style={styles.checkBadge}><Text style={styles.checkBadgeText}>✓</Text></View>}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>Select 2 tools ({selected.length}/2)</Text>
      <TouchableOpacity style={[styles.btn, selected.length !== 2 && styles.btnDisabled]}
        onPress={handleSubmit} disabled={selected.length !== 2} activeOpacity={0.8}>
        <Text style={styles.btnText}>Confirm Selection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  heading: { fontSize: 22, fontWeight: "800", color: "#2D241C", marginBottom: 8 },
  sub: { fontSize: 15, color: "#6B5E50", marginBottom: 20, lineHeight: 22 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  toolCard: { width: "47%", backgroundColor: "#FDFBF8", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#e8e2d9", alignItems: "center", position: "relative" },
  toolCardSelected: { borderColor: ORANGE, backgroundColor: "#fff7ed" },
  toolIcon: { fontSize: 32, marginBottom: 8 },
  toolName: { fontSize: 14, fontWeight: "700", color: "#2D241C", marginBottom: 4 },
  toolDesc: { fontSize: 11, color: "#A09484", textAlign: "center", lineHeight: 16 },
  checkBadge: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
  checkBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  hint: { fontSize: 13, color: "#A09484", textAlign: "center", marginBottom: 16 },
  btn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
