// ─── Shared step styles — consistent across all step components ───
// Use these in step components instead of hardcoded colors.

import { StyleSheet } from "react-native";
import { colors } from "../../../theme/tokens";

export const stepStyles = StyleSheet.create({
  // Container
  container: { flex: 1, padding: 4 },

  // Question text
  question: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: 24,
    lineHeight: 30,
  },

  // Body text
  body: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.textSecondary,
  },

  // Options / buttons
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  optionDefault: { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
  optionSelected: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  optionCorrect: { backgroundColor: colors.successBg, borderColor: colors.successBorder },
  optionWrong: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder },

  optionText: { fontSize: 16, color: colors.textSecondary, flex: 1, fontWeight: "500" as const },
  optionTextCorrect: { color: colors.textPrimary, fontWeight: "700" as const },

  // Radio
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: colors.textDim, justifyContent: "center" as const, alignItems: "center" as const,
  },
  radioSelected: { borderColor: colors.primary },
  radioFill: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },

  // Action button
  actionBtn: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center" as const,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" as const },

  // Feedback
  feedback: {
    marginTop: 20,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  feedbackCorrect: { backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder },
  feedbackWrong: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder },
  feedbackEmoji: { fontSize: 20, fontWeight: "700" as const, marginTop: 1 },
  feedbackText: { fontSize: 15, color: colors.textSecondary, flex: 1, lineHeight: 22 },

  // Input
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center" as const,
    marginBottom: 16,
  },
  inputCorrect: { borderColor: colors.successBorder, backgroundColor: colors.successBg },
  inputWrong: { borderColor: colors.errorBorder, backgroundColor: colors.errorBg },

  // Audio bar (for Info/Highlight steps)
  audioBar: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 12, marginTop: 20,
    backgroundColor: colors.surface, borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  playBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    justifyContent: "center" as const, alignItems: "center" as const,
  },
  playIcon: { fontSize: 18, color: "#fff" },
  speedGroup: { flexDirection: "row" as const, gap: 4 },
  speedBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  speedBtnActive: { backgroundColor: colors.primaryDim },
  speedText: { fontSize: 13, fontWeight: "600" as const, color: colors.textMuted },
  speedTextActive: { color: colors.primary },
  listeningBadge: {
    marginTop: 12, alignSelf: "flex-start" as const, backgroundColor: colors.successBg,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: colors.successBorder,
  },
  listeningText: { fontSize: 12, color: colors.primary, fontWeight: "600" as const },

  // Highlighted text
  highlighted: {
    backgroundColor: colors.warningBg,
    color: "#92400e",
    fontWeight: "600" as const,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
});
