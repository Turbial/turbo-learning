// ─── Shared step styles — all lesson step components ───
// Single source of truth — driven by appTheme.

import { StyleSheet } from "react-native";
import { appTheme as t } from "../../../theme/appTheme";

export const stepStyles = StyleSheet.create({
  // Container
  container: { flex: 1, padding: 4, justifyContent: "center" },

  // Question text
  question: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: t.colors.textPrimary,
    marginBottom: 24,
    lineHeight: 30,
  },

  // Body text
  body: {
    fontSize: 17,
    lineHeight: 28,
    color: t.colors.textBody,
  },

  // Options / buttons
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 16,
    borderRadius: t.radius.lg,
    borderWidth: 2,
  },
  optionDefault:  { backgroundColor: t.colors.cardBg,     borderColor: t.colors.border },
  optionSelected: { backgroundColor: t.colors.accentTint, borderColor: t.colors.accent },
  optionCorrect:  { backgroundColor: t.colors.successBg,  borderColor: "#a7f3d0" },
  optionWrong:    { backgroundColor: t.colors.errorBg,    borderColor: "#fecaca" },

  optionText:        { fontSize: 16, color: t.colors.textBody, flex: 1, fontWeight: "500" as const },
  optionTextCorrect: { color: t.colors.textPrimary, fontWeight: "700" as const },

  // Radio
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: t.colors.textDisabled, justifyContent: "center" as const, alignItems: "center" as const,
  },
  radioSelected: { borderColor: t.colors.accent },
  radioFill:     { width: 12, height: 12, borderRadius: 6, backgroundColor: t.colors.accent },

  // Action button
  actionBtn: {
    marginTop: 24,
    backgroundColor: t.colors.accent,
    paddingVertical: 16,
    borderRadius: t.radius.lg,
    alignItems: "center" as const,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText:     { color: "#fff", fontSize: 17, fontWeight: "700" as const },

  // Feedback
  feedback: {
    marginTop: 20,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    padding: 16,
    borderRadius: t.radius.lg,
  },
  feedbackCorrect: { backgroundColor: t.colors.successBg, borderWidth: 1, borderColor: "#a7f3d0" },
  feedbackWrong:   { backgroundColor: t.colors.errorBg,   borderWidth: 1, borderColor: "#fecaca" },
  feedbackEmoji:   { fontSize: 20, fontWeight: "700" as const, marginTop: 1 },
  feedbackText:    { fontSize: 15, color: t.colors.textBody, flex: 1, lineHeight: 22 },

  // Input
  input: {
    backgroundColor: t.colors.inputBg,
    borderWidth: 2,
    borderColor: t.colors.border,
    borderRadius: t.radius.lg,
    padding: 16,
    fontSize: 18,
    color: t.colors.textPrimary,
    textAlign: "center" as const,
    marginBottom: 16,
  },
  inputCorrect: { borderColor: "#a7f3d0", backgroundColor: t.colors.successBg },
  inputWrong:   { borderColor: "#fecaca", backgroundColor: t.colors.errorBg },

  // Audio bar
  audioBar: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 12, marginTop: 20,
    backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: 10,
    borderWidth: 1, borderColor: t.colors.border,
  },
  playBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: t.colors.accent,
    justifyContent: "center" as const, alignItems: "center" as const,
  },
  playIcon:       { fontSize: 18, color: "#fff" },
  speedGroup:     { flexDirection: "row" as const, gap: 4 },
  speedBtn:       { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  speedBtnActive: { backgroundColor: t.colors.accentTint },
  speedText:      { fontSize: 13, fontWeight: "600" as const, color: t.colors.textMuted },
  speedTextActive:{ color: t.colors.accent },
  listeningBadge: {
    marginTop: 12, alignSelf: "flex-start" as const, backgroundColor: t.colors.successBg,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: "#a7f3d0",
  },
  listeningText: { fontSize: 12, color: t.colors.accent, fontWeight: "600" as const },

  // Highlighted text
  highlighted: {
    backgroundColor: t.colors.warningBg,
    color: t.colors.warningText,
    fontWeight: "600" as const,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
});
