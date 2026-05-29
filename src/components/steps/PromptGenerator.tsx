// PromptGenerator — Pick topic → generate prompt → copy, 5 XP
// Follows StepProps contract: { step, onNext, onXP }
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

const ORANGE = "#E84E0F";

const haptic = () => {
  try {
    if (Platform.OS !== "web") {
      const H = require("expo-haptics");
      H.impactAsync(H.ImpactFeedbackStyle.Light);
    }
  } catch {}
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PromptGeneratorField {
  id: string;
  label: string;
  placeholder?: string;
}

export interface PromptGeneratorStepData {
  topic?: string;
  template: string;
  fields?: PromptGeneratorField[];
  title?: string;
  subtitle?: string;
}

export interface PromptGeneratorProps {
  step: PromptGeneratorStepData;
  onNext: () => void;
  onXP: (amount: number) => void;
}

// ─── Default prompt templates per category ──────────────────────────────────

const DEFAULT_TEMPLATES: Record<string, { template: string; fields: PromptGeneratorField[] }> = {
  blog: {
    template:
      "Write a blog post about {topic}. Include an engaging headline, a 2-sentence intro, 3 key points with supporting details, and a call-to-action conclusion. Tone: {tone}.",
    fields: [
      { id: "topic", label: "Topic", placeholder: "e.g., AI in commercial lending" },
      { id: "tone", label: "Tone", placeholder: "e.g., professional, conversational, bold" },
    ],
  },
  email: {
    template:
      "Draft a {tone} email about {topic}. Subject line: compelling and under 50 chars. Body: 3 short paragraphs. Include a clear call-to-action. Sign off as {sender}.",
    fields: [
      { id: "topic", label: "Topic", placeholder: "e.g., new product launch update" },
      { id: "tone", label: "Tone", placeholder: "e.g., enthusiastic, formal, warm" },
      { id: "sender", label: "Sender Name", placeholder: "e.g., Alex from Product Team" },
    ],
  },
  social: {
    template:
      "Create a {platform} post about {topic}. Hook in the first line. Keep it under 280 chars (or 3 short lines for LinkedIn). Add 3 relevant hashtags. Tone: {tone}.",
    fields: [
      { id: "platform", label: "Platform", placeholder: "e.g., LinkedIn, Twitter/X, Instagram" },
      { id: "topic", label: "Topic", placeholder: "e.g., our latest case study results" },
      { id: "tone", label: "Tone", placeholder: "e.g., inspiring, casual, data-driven" },
    ],
  },
  code: {
    template:
      "Generate {language} code for {task}. Include comments explaining each step. Handle edge cases. Output clean, production-ready code with no placeholders.",
    fields: [
      { id: "language", label: "Language", placeholder: "e.g., TypeScript, Python, Go" },
      { id: "task", label: "Task", placeholder: "e.g., a function that validates credit scores" },
    ],
  },
  analysis: {
    template:
      "Analyze {subject} from the perspective of {role}. Structure: 1) Summary of facts, 2) Key patterns & trends, 3) Risks & opportunities, 4) Recommended actions. Be specific and data-driven.",
    fields: [
      { id: "subject", label: "Subject", placeholder: "e.g., Q3 borrower financials" },
      { id: "role", label: "Role / Perspective", placeholder: "e.g., credit analyst, investor, CFO" },
    ],
  },
  custom: {
    template:
      "{prompt}",
    fields: [
      { id: "prompt", label: "Your Prompt", placeholder: "Type or paste your prompt template with {placeholders}..." },
    ],
  },
};

const TOPIC_CATEGORIES = [
  { id: "blog", label: "📝 Blog Post", icon: "📝" },
  { id: "email", label: "✉️ Email", icon: "✉️" },
  { id: "social", label: "📱 Social Media", icon: "📱" },
  { id: "code", label: "💻 Code", icon: "💻" },
  { id: "analysis", label: "📊 Analysis", icon: "📊" },
  { id: "custom", label: "✨ Custom", icon: "✨" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function PromptGenerator({ step, onNext, onXP }: PromptGeneratorProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState(false);

  // Use step-provided template/fields, or defaults from selected category
  const templateConfig = step.fields
    ? { template: step.template, fields: step.fields }
    : category
      ? DEFAULT_TEMPLATES[category]
      : null;

  const fields = templateConfig?.fields ?? [];
  const allFilled = fields.every((f) => (values[f.id] ?? "").trim().length > 0);

  const generatePrompt = () => {
    if (!allFilled) return;
    setGenerated(true);
    onXP(5);
    haptic();
  };

  const promptText = templateConfig
    ? fields.reduce((acc, f) => acc.replace(`{${f.id}}`, values[f.id] ?? ""), templateConfig.template)
    : "";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(promptText);
    haptic();
    onNext();
  };

  // ── Step 0: Pick category (if no fields provided by step data) ──
  if (!category && !step.fields) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>{step.title ?? "🔧 Prompt Generator"}</Text>
        <Text style={styles.sub}>
          {step.subtitle ?? "Pick a topic category to generate a prompt template:"}
        </Text>
        <View style={styles.categoryGrid}>
          {TOPIC_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => { haptic(); setCategory(cat.id); }}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { marginTop: 8 }]}
          onPress={onNext}
        >
          <Text style={styles.backBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Step 1: Fill fields ──
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{step.title ?? "🔧 Prompt Generator"}</Text>
      <Text style={styles.sub}>
        {step.subtitle ?? "Fill in the fields to generate your prompt:"}
        {category && !step.fields && (
          <Text style={{ color: ORANGE, fontWeight: "600" }}>
            {" "}({TOPIC_CATEGORIES.find((c) => c.id === category)?.label ?? category})
          </Text>
        )}
      </Text>

      {fields.map((field, i) => (
        <View key={field.id} style={styles.fieldGroup}>
          <Text style={styles.label}>
            {i + 1}. {field.label}
          </Text>
          <TextInput
            style={styles.input}
            value={values[field.id] ?? ""}
            onChangeText={(t) => setValues((p) => ({ ...p, [field.id]: t }))}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            placeholderTextColor="#C4BDB6"
            multiline
            editable={!generated}
          />
        </View>
      ))}

      {!generated ? (
        <TouchableOpacity
          style={[styles.btn, !allFilled && styles.btnDisabled]}
          onPress={generatePrompt}
          disabled={!allFilled}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Generate Prompt</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Your Prompt:</Text>
            <Text style={styles.resultText} selectable>
              {promptText}
            </Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
            <Text style={styles.copyBtnText}>📋 Copy & Continue</Text>
          </TouchableOpacity>
        </>
      )}

      {!generated && category && !step.fields && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { setCategory(null); setValues({}); }}
        >
          <Text style={styles.backBtnText}>← Choose a different category</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  heading: { fontSize: 22, fontWeight: "800", color: "#2D241C", marginBottom: 8 },
  sub: { fontSize: 15, color: "#6B5E50", marginBottom: 20, lineHeight: 22 },

  // Category selection
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  categoryCard: {
    width: "47%",
    backgroundColor: "#FDFBF8",
    borderRadius: 14,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e8e2d9",
    alignItems: "center",
  },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryLabel: { fontSize: 14, fontWeight: "700", color: "#2D241C" },

  // Fields
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", color: "#2D241C", marginBottom: 8 },
  input: {
    backgroundColor: "#FDFBF8",
    borderWidth: 1.5,
    borderColor: "#e0d9cf",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#3D3228",
    minHeight: 56,
  },

  // Buttons
  btn: { backgroundColor: ORANGE, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  // Result
  resultBox: {
    marginTop: 8,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: ORANGE,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#e2e8f0",
    fontFamily: "monospace",
  },
  copyBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  copyBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  // Back
  backBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 14,
    color: "#A09484",
    fontWeight: "600",
  },
});
