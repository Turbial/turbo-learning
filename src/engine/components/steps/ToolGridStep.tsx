// ─── ToolGridStep — user selects AI tools to compare ───
// Displays 4 AI tool cards, user selects minSelect..maxSelect, then Continue.

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StepProps } from "../../stepRegistry";
import type { ToolGridStep as ToolGridStepType } from "../../types";
import { colors, radius, spacing, fontSize } from "../../../theme/tokens";

const DEFAULT_TOOLS = [
  { id: "chatgpt", name: "ChatGPT", icon: "🤖", description: "OpenAI's versatile assistant", color: "#10a37f" },
  { id: "claude", name: "Claude", icon: "🧠", description: "Anthropic's thoughtful AI", color: "#d97706" },
  { id: "gemini", name: "Gemini", icon: "🌟", description: "Google's multimodal model", color: "#4285f4" },
  { id: "grok", name: "Grok", icon: "⚡", description: "xAI's real-time assistant", color: "#1a1a2e" },
];

export default function ToolGridStep({ step, onAnswer, onContinue }: StepProps) {
  const s = step as ToolGridStepType;
  const tools = s.tools ?? DEFAULT_TOOLS;
  const minSelect = s.minSelect ?? 2;
  const maxSelect = s.maxSelect ?? 2;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const canContinue = selected.size >= minSelect && selected.size <= maxSelect;
  const needsMore = selected.size < minSelect;
  const tooMany = selected.size > maxSelect;

  const toggleTool = useCallback(
    (id: string) => {
      if (submitted) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (next.size >= maxSelect) return prev; // can't exceed max
          next.add(id);
        }
        return next;
      });
    },
    [submitted, maxSelect]
  );

  const handleContinue = () => {
    if (!canContinue) return;
    setSubmitted(true);
    onAnswer(Array.from(selected));
    onContinue();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.question}>{s.question}</Text>

      {/* Selection status */}
      <Text style={styles.hint}>
        {needsMore
          ? `Select ${minSelect - selected.size} more tool${minSelect - selected.size !== 1 ? "s" : ""}`
          : tooMany
            ? `Deselect ${selected.size - maxSelect} tool${selected.size - maxSelect !== 1 ? "s" : ""}`
            : `${selected.size} of ${maxSelect} selected`}
      </Text>

      {/* Tool cards */}
      <View style={styles.grid}>
        {tools.map((tool) => {
          const isSelected = selected.has(tool.id);
          return (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.card,
                isSelected && {
                  borderColor: tool.color,
                  backgroundColor: tool.color + "12",
                },
                submitted && !isSelected && { opacity: 0.4 },
              ]}
              onPress={() => toggleTool(tool.id)}
              activeOpacity={0.7}
              disabled={submitted}
            >
              <Text style={styles.icon}>{tool.icon}</Text>
              <Text style={[styles.name, isSelected && { color: tool.color }]}>
                {tool.name}
              </Text>
              <Text style={styles.description}>{tool.description}</Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: tool.color }]}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue */}
      {!submitted && (
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>
            Continue ({selected.size} selected)
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 4, paddingBottom: spacing.xl },
  question: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    width: "48%",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    position: "relative",
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
