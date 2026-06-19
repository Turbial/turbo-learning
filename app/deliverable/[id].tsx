// ─── Deliverable Viewer — shows builder/prompt outputs for a completed lesson ───

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../src/data/supabase";
import { useLessonByUnit } from "../../src/data/queries";
import { useAuth } from "../../src/data/useAuth";
import { colors, spacing, radius, fontSize, fontWeight, shadow } from "../../src/theme/tokens";
import type {
  BuilderStep,
  CopyActionStep,
  PasteCaptureStep,
  PromptGeneratorStep,
} from "../../src/engine/types";

type DeliverableStep = BuilderStep | CopyActionStep | PasteCaptureStep | PromptGeneratorStep;

function isDeliverableStep(step: any): step is DeliverableStep {
  return ["builder", "copy_action", "paste_capture", "prompt_generator"].includes(step.type);
}

function getStepTitle(step: DeliverableStep): string {
  if (step.type === "builder") {
    return (step as BuilderStep).fields?.[0]?.label ?? "Builder Output";
  }
  if (step.type === "prompt_generator") {
    return (step as PromptGeneratorStep).title ?? "Generated Prompt";
  }
  if (step.type === "copy_action") return "Copied Content";
  if (step.type === "paste_capture") return "Captured Response";
  return "Output";
}

type FormattedResponse =
  | { isString: true; text: string }
  | { isString: false; text: ""; fields: { label: string; value: string }[] };

function formatResponse(step: DeliverableStep, rawResponse: unknown): FormattedResponse {
  if (step.type === "builder") {
    const builderStep = step as BuilderStep;
    if (typeof rawResponse === "string") {
      return { isString: true, text: rawResponse };
    }
    if (rawResponse && typeof rawResponse === "object") {
      const fields = builderStep.fields
        .map((f) => ({
          label: f.label,
          value: String((rawResponse as Record<string, unknown>)[f.id] ?? ""),
        }))
        .filter((f) => f.value);
      return { isString: false, text: "", fields };
    }
    return { isString: true, text: String(rawResponse ?? "") };
  }

  if (step.type === "prompt_generator") {
    if (typeof rawResponse === "string") return { isString: true, text: rawResponse };
    if (rawResponse && typeof rawResponse === "object") {
      const r = rawResponse as Record<string, unknown>;
      const text = String(r.generatedPrompt ?? r.result ?? r.output ?? JSON.stringify(rawResponse));
      return { isString: true, text };
    }
    return { isString: true, text: String(rawResponse ?? "") };
  }

  // copy_action, paste_capture
  if (typeof rawResponse === "string") return { isString: true, text: rawResponse };
  if (rawResponse && typeof rawResponse === "object") {
    const r = rawResponse as Record<string, unknown>;
    const text = String(r.text ?? r.content ?? r.value ?? JSON.stringify(rawResponse));
    return { isString: true, text };
  }
  return { isString: true, text: String(rawResponse ?? "") };
}

type DeliverableItem = {
  step: DeliverableStep;
  title: string;
  formatted: FormattedResponse;
};

export default function DeliverableScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const userId = user?.id;

  const { data: lesson, isLoading: lessonLoading } = useLessonByUnit(id);

  const { data: stepResponses, isLoading: responsesLoading } = useQuery({
    queryKey: ["stepResponses", userId, lesson?.id],
    queryFn: async () => {
      if (!userId || !lesson?.id) return [];
      const { data, error } = await supabase
        .from("step_responses")
        .select("step_id, response")
        .eq("user_id", userId)
        .eq("lesson_id", lesson.id);
      if (error) throw error;
      return data as { step_id: string; response: unknown }[];
    },
    enabled: !!userId && !!lesson?.id,
  });

  const [copying, setCopying] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, key: string) => {
    setCopying(key);
    await Clipboard.setStringAsync(text);
    setTimeout(() => setCopying(null), 1500);
  }, []);

  const isLoading = lessonLoading || responsesLoading;

  const deliverables: DeliverableItem[] = (() => {
    if (!lesson?.steps || !stepResponses) return [];
    const responseMap = new Map(stepResponses.map((r) => [r.step_id, r.response]));
    const items: DeliverableItem[] = [];
    for (const step of lesson.steps) {
      if (!isDeliverableStep(step)) continue;
      const rawResponse = responseMap.get(step.id);
      if (rawResponse === undefined || rawResponse === null) continue;
      items.push({
        step,
        title: getStepTitle(step),
        formatted: formatResponse(step, rawResponse),
      });
    }
    return items;
  })();

  const handleCopyAll = useCallback(async () => {
    if (deliverables.length === 0) return;
    const parts = deliverables.map(({ title, formatted }) => {
      if (formatted.isString) {
        return `${title}\n${formatted.text}`;
      }
      const fieldText = formatted.fields.map((f) => `${f.label}: ${f.value}`).join("\n");
      return `${title}\n${fieldText}`;
    });
    await Clipboard.setStringAsync(parts.join("\n\n---\n\n"));
    Alert.alert("Copied!", "All deliverables copied to clipboard.");
  }, [deliverables]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasDeliverables = deliverables.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Deliverables</Text>
        {hasDeliverables ? (
          <TouchableOpacity onPress={handleCopyAll} style={styles.copyAllBtn} activeOpacity={0.7}>
            <Text style={styles.copyAllText}>Copy all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.copyAllBtn} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lesson && <Text style={styles.lessonTitle}>{lesson.title}</Text>}

        {!hasDeliverables ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No deliverables yet</Text>
            <Text style={styles.emptyBody}>
              Complete the lesson to generate your deliverables.
            </Text>
            <TouchableOpacity
              style={styles.backToLessonBtn}
              onPress={() => router.replace("/(tabs)/home")}
              activeOpacity={0.8}
            >
              <Text style={styles.backToLessonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          deliverables.map(({ step, title, formatted }) => (
            <View key={step.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {step.type === "builder"
                      ? "Builder"
                      : step.type === "prompt_generator"
                      ? "Prompt"
                      : step.type === "paste_capture"
                      ? "Captured"
                      : "Output"}
                  </Text>
                </View>
              </View>

              {formatted.isString ? (
                <View style={styles.outputBox}>
                  <Text style={styles.outputText}>{formatted.text}</Text>
                  <TouchableOpacity
                    style={[styles.copyBtn, copying === step.id && styles.copyBtnActive]}
                    onPress={() => handleCopy(formatted.text, step.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.copyBtnText,
                        copying === step.id && styles.copyBtnTextActive,
                      ]}
                    >
                      {copying === step.id ? "Copied!" : "Copy"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {formatted.fields.map((field, fi) => (
                    <View key={fi} style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <Text style={styles.fieldValue}>{field.value}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.copyBtn, copying === step.id && styles.copyBtnActive]}
                    onPress={() => {
                      const text = formatted.fields
                        .map((f) => `${f.label}: ${f.value}`)
                        .join("\n");
                      handleCopy(text, step.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.copyBtnText,
                        copying === step.id && styles.copyBtnTextActive,
                      ]}
                    >
                      {copying === step.id ? "Copied!" : "Copy"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 80,
  },
  backText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  copyAllBtn: {
    width: 80,
    alignItems: "flex-end",
  },
  copyAllText: {
    fontSize: fontSize.sm,
    color: "#059669",
    fontWeight: fontWeight.semibold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  lessonTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  backToLessonBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  backToLessonText: {
    color: "#fff",
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  typeBadge: {
    backgroundColor: "#ecfdf5",
    borderRadius: radius.full,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: "#059669",
  },
  outputBox: {
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  outputText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  copyBtn: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  copyBtnActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  copyBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: "#059669",
  },
  copyBtnTextActive: {
    color: "#fff",
  },
  fieldRow: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
