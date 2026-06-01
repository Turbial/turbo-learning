// ─── PromptGeneratorStep — pick a category, generate an AI prompt template, copy to clipboard ───

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import { StepProps } from "../../stepRegistry";
import type { PromptGeneratorStep as PromptGeneratorStepType } from "../../types";

export default function PromptGeneratorStep({ step, onAnswer }: StepProps) {
  const s = step as PromptGeneratorStepType;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatedPrompt = useMemo(() => {
    if (!selectedCategory) return null;
    return s.promptTemplate.replace(/\{category\}/g, selectedCategory);
  }, [selectedCategory, s.promptTemplate]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    await Clipboard.setStringAsync(generatedPrompt);
    setCopied(true);
  };

  const handleContinue = () => {
    onAnswer({
      category: selectedCategory,
      prompt: generatedPrompt,
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Pick a Topic</Text>
      <Text style={styles.subtitle}>
        Choose the category that best fits what you want the AI to do.
      </Text>

      <View style={styles.categoryGrid}>
        {(s.categories ?? []).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillActive,
            ]}
            onPress={() => handleSelectCategory(cat)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === cat && styles.categoryPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {generatedPrompt && (
        <View style={styles.resultSection}>
          <Text style={styles.resultLabel}>Your AI Prompt</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{generatedPrompt}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnDone]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Text style={styles.copyBtnText}>
                {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>
                {s.primaryButton ?? "Continue →"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 4, paddingBottom: 40 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B5E50",
    marginBottom: 24,
    lineHeight: 22,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  categoryPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: "#F3EFEB",
    borderWidth: 1.5,
    borderColor: "#e0d9cf",
  },
  categoryPillActive: {
    backgroundColor: "#059669",
    borderColor: "#047857",
  },
  categoryPillText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4D4038",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
  },
  resultSection: {
    marginTop: 4,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#e2e8f0",
    fontFamily: "monospace",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  copyBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  copyBtnDone: {
    backgroundColor: "#059669",
  },
  copyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  continueBtn: {
    flex: 1,
    backgroundColor: "#2D241C",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
