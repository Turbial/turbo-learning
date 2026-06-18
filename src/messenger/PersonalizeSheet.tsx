// ─── PersonalizeSheet — set industry / skill level / goal for the tutor ───
// Self-contained bottom sheet (RN Modal). Writes to the persisted learner profile;
// the Ask answer then frames itself to this context with no extra LLM calls.

import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight, sizing } from "../theme/tokens";
import { useLearnerProfile, INDUSTRIES, SKILL_LEVELS, type SkillLevel } from "./profile";

export default function PersonalizeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const profile = useLearnerProfile((s) => s.profile);
  const setProfile = useLearnerProfile((s) => s.set);
  const [goal, setGoal] = useState(profile.goal ?? "");

  const close = () => {
    setProfile({ goal });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTap} activeOpacity={1} onPress={close} />
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Personalize your tutor</Text>
            <Text style={styles.sub}>The AI frames its answers to your work — the lessons themselves don't change.</Text>

            <Text style={styles.label}>Your field</Text>
            <View style={styles.chips}>
              {INDUSTRIES.map((ind) => {
                const on = profile.industry === ind;
                return (
                  <TouchableOpacity
                    key={ind}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setProfile({ industry: on ? undefined : ind })}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{ind}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Skill level</Text>
            <View style={styles.chips}>
              {SKILL_LEVELS.map((lvl) => {
                const on = profile.skillLevel === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setProfile({ skillLevel: on ? undefined : (lvl as SkillLevel) })}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{lvl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Your goal (optional)</Text>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g. automate my client follow-ups"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={styles.done} onPress={close}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "82%",
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primaryDim, borderColor: colors.primaryBorder },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  chipTextOn: { color: colors.primaryDark, fontWeight: fontWeight.bold },
  input: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  done: {
    marginTop: spacing.lg,
    height: sizing.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { color: colors.surface, fontWeight: fontWeight.bold, fontSize: fontSize.md },
});
