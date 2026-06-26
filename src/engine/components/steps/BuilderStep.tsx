// ─── BuilderStep — multi-field form builder (e.g. "build your prompt") ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { BuilderStep as BuilderStepType } from "../../types";

function parseFields(s: BuilderStepType): Array<{ id: string; label: string; placeholder?: string }> {
  if (s.fields && s.fields.length > 0) return s.fields;

  // Legacy format: the step has a "prompt" text but no structured fields.
  // Extract field placeholders from the prompt or template text.
  const text = (s as any).prompt || (s as any).body || s.template || "";
  if (!text.trim()) return [];

  // Try to parse numbered lines like "1. The role..." or bullet-like prompts
  const lines = text.split("\n").filter((l: string) => l.trim());
  const fields: Array<{ id: string; label: string; placeholder?: string }> = [];
  for (const line of lines) {
    const match = line.match(/^\d+\.?\s+(.+)/);
    if (match) {
      const label = match[1].trim();
      fields.push({ id: `f${fields.length + 1}`, label, placeholder: `Enter ${label.toLowerCase()}...` });
    }
  }

  // Fallback: single textarea for freeform prompt
  if (fields.length === 0) {
    const prompt = (s as any).prompt || (s as any).body || "";
    fields.push({
      id: "f1",
      label: prompt.length > 120 ? prompt.slice(0, 120) + "..." : prompt || "Your response",
      placeholder: "Write your response here...",
    });
  }

  return fields;
}

function interpolate(template: string, values: Record<string, string>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
    .replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export default function BuilderStep({ step, onAnswer }: StepProps) {
  const s = step as BuilderStepType;
  const fields = parseFields(s);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allFilled = fields.every((f: any) => (values[f.id] ?? "").trim().length > 0);

  const handleSubmit = () => {
    if (!allFilled) return;
    setSubmitted(true);
    onAnswer(s.template ? interpolate(s.template, values) : values);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.instruction}>Fill in each field to build your output:</Text>

      {fields.map((field: any, i: number) => (
        <View key={field.id} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            {i + 1}. {field.label}
          </Text>
          <TextInput
            style={styles.input}
            value={values[field.id] ?? ""}
            onChangeText={(t) => setValues((p) => ({ ...p, [field.id]: t }))}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            placeholderTextColor="#C4BDB6"
            multiline
            editable={!submitted}
          />
        </View>
      ))}

      {!submitted ? (
        <TouchableOpacity
          style={[styles.btn, !allFilled && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!allFilled}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Build It</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Your Output:</Text>
          <Text style={styles.resultText}>
            {s.template
              ? interpolate(s.template, values)
              : Object.entries(values).map(([k, v]) => `**\${k}**: \${v}`).join("\n\n")}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 4, paddingBottom: 40 },
  instruction: {
    fontSize: 15,
    color: "#6B5E50",
    marginBottom: 20,
    lineHeight: 22,
  },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D241C",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FDFBF8",
    borderWidth: 1.5,
    borderColor: "#e0d9cf",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#3D3228",
    minHeight: 60,
  },
  btn: {
    marginTop: 8,
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  resultBox: {
    marginTop: 16,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#3D3228",
  },
});
