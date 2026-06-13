// ─── ChatPlayer — the LLM messenger runtime ───
//
// Renders a compiled lesson graph as a chat thread: the bot sends a message, the
// student taps a button, the next message arrives. This is the "pivot toward LLM
// messenger" surface — Duolingo's loop in a ChatGPT-shaped UI. Every tap is
// resolved LLM-FREE against the local graph (resolveTap); the only live call is
// the free-text "Ask my own question" escape hatch (askQuestion).
//
// State (XP, concept mastery, progress events) is tracked here in the same shape
// the Supabase tables use, so Phase 2 swaps local resolve/ask for Edge Functions
// without changing this component.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { colors, spacing, radius, fontSize, fontWeight, sizing, lineHeight } from "../theme/tokens";
import type { CompiledLesson, CompiledItem, ItemButton, ChatBubble, ConceptMastery, ProgressEvent } from "./types";
import { getEntry, resolveTap, toneForAnswer } from "./resolve";
import { askQuestion } from "./ask";
import MasteryBar from "./MasteryBar";

export interface ChatPlayerProps {
  lesson: CompiledLesson;
  courseTitle?: string;
  onExit?: () => void;
  onNext?: () => void;
  onComplete?: (summary: { xp: number; events: ProgressEvent[]; mastery: ConceptMastery[] }) => void;
}

let bubbleSeq = 0;
const nextKey = () => `b${++bubbleSeq}`;

export default function ChatPlayer({ lesson, courseTitle, onExit, onNext, onComplete }: ChatPlayerProps) {
  const entry = useMemo(() => getEntry(lesson), [lesson]);

  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [current, setCurrent] = useState<CompiledItem>(entry);
  const [xp, setXp] = useState(0);
  const [mastery, setMastery] = useState<ConceptMastery[]>(() =>
    lesson.key_concepts.map((c) => ({ tag: c.tag, label: c.label, correct: 0, attempts: 0 })),
  );
  const eventsRef = useRef<ProgressEvent[]>([]);

  // Ask escape-hatch state
  const [askOpen, setAskOpen] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const preEscapeRef = useRef<CompiledItem>(entry);

  const scrollRef = useRef<ScrollView>(null);
  const completedRef = useRef(false);

  const pushBubble = useCallback((b: Omit<ChatBubble, "key">) => {
    setBubbles((prev) => [...prev, { ...b, key: nextKey() }]);
  }, []);

  // Seed the thread with the entry (menu) message.
  useEffect(() => {
    setBubbles([{ key: nextKey(), role: "bot", text: entry.bot_text, itemType: entry.item_type }]);
    setCurrent(entry);
  }, [entry]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [bubbles, askOpen]);

  const bumpMastery = useCallback((tag: string, correct: boolean) => {
    setMastery((prev) =>
      prev.map((m) =>
        m.tag === tag ? { ...m, attempts: m.attempts + 1, correct: m.correct + (correct ? 1 : 0) } : m,
      ),
    );
  }, []);

  const handleButton = useCallback(
    (button: ItemButton) => {
      // Echo the student's choice as a user bubble (except the silent escape open).
      if (button.action !== "escape") {
        pushBubble({ role: "user", text: button.label });
      }

      const result = resolveTap(lesson, current, button);
      eventsRef.current.push(result.event);

      if (result.mastery) bumpMastery(result.mastery.tag, result.mastery.correct);
      if (result.xpAwarded) setXp((x) => x + result.xpAwarded);

      if (result.escape) {
        preEscapeRef.current = current;
        setAskOpen(true);
        pushBubble({ role: "bot", text: "Ask me anything about this lesson — I'll answer from what we covered.", tone: "neutral" });
        return;
      }

      const next = result.next;
      if (!next) return;

      const tone = next.item_type === "feedback" ? toneForAnswer(button) : "neutral";
      pushBubble({ role: "bot", text: next.bot_text, itemType: next.item_type, tone });
      setCurrent(next);

      if (next.item_type === "done" && !completedRef.current) {
        completedRef.current = true;
        onComplete?.({ xp, events: eventsRef.current, mastery });
      }
    },
    [lesson, current, pushBubble, bumpMastery, xp, mastery, onComplete],
  );

  const submitAsk = useCallback(async () => {
    const q = askInput.trim();
    if (!q || askLoading) return;
    pushBubble({ role: "user", text: q });
    setAskInput("");
    setAskLoading(true);
    eventsRef.current.push({ itemId: preEscapeRef.current.id, conceptTag: null, wasCorrect: null, at: Date.now() });
    try {
      const res = await askQuestion({ lesson, question: q });
      pushBubble({ role: "bot", text: res.answer, tone: res.grounded ? "neutral" : "wrong" });
    } finally {
      setAskLoading(false);
      setAskOpen(false);
      // Hand back to the step the student left (the menu) so the deck reappears.
      const back = preEscapeRef.current;
      setCurrent(back);
      pushBubble({ role: "bot", text: "Want to keep going?", itemType: back.item_type, tone: "neutral" });
    }
  }, [askInput, askLoading, lesson, pushBubble]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} hitSlop={10} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
          {!!courseTitle && <Text style={styles.headerSub} numberOfLines={1}>{courseTitle} · AI Tutor</Text>}
        </View>
        <View style={styles.xpPill}>
          <Text style={styles.xpText}>{xp} XP</Text>
        </View>
      </View>

      <MasteryBar mastery={mastery} />

      {/* Thread */}
      <ScrollView
        ref={scrollRef}
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
      >
        {bubbles.map((b) => (
          <View
            key={b.key}
            style={[styles.bubbleRow, b.role === "user" ? styles.rowRight : styles.rowLeft]}
          >
            <View
              style={[
                styles.bubble,
                b.role === "user" ? styles.bubbleUser : styles.bubbleBot,
                b.tone === "correct" && styles.bubbleCorrect,
                b.tone === "wrong" && styles.bubbleWrong,
              ]}
            >
              <Text style={[styles.bubbleText, b.role === "user" && styles.bubbleTextUser]}>
                {b.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Button deck OR Ask input */}
      {askOpen ? (
        <View style={styles.deck}>
          <View style={styles.askRow}>
            <TextInput
              style={styles.askInput}
              value={askInput}
              onChangeText={setAskInput}
              placeholder="Ask your own question…"
              placeholderTextColor={colors.textMuted}
              multiline
              editable={!askLoading}
              onSubmitEditing={submitAsk}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.askSend, (!askInput.trim() || askLoading) && styles.askSendDisabled]}
              onPress={submitAsk}
              disabled={!askInput.trim() || askLoading}
            >
              {askLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.askSendText}>Ask</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => { setAskOpen(false); setCurrent(preEscapeRef.current); }}>
            <Text style={styles.askCancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.deck}>
          {current.item_type === "done" && onNext && (
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} activeOpacity={0.85} onPress={onNext}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>Next lesson →</Text>
            </TouchableOpacity>
          )}
          {current.buttons.map((b, i) => (
            <TouchableOpacity
              key={`${current.id}-${i}`}
              style={[styles.btn, b.action === "escape" && styles.btnGhost]}
              activeOpacity={0.85}
              onPress={() => handleButton(b)}
            >
              <Text style={[styles.btnText, b.action === "escape" && styles.btnTextGhost]}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerBtnText: { fontSize: 28, color: colors.textSecondary, marginTop: -4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  xpPill: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  xpText: { color: colors.primaryDark, fontWeight: fontWeight.bold, fontSize: fontSize.xs },

  thread: { flex: 1 },
  threadContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  bubbleRow: { flexDirection: "row" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderTopLeftRadius: radius.sm,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderTopRightRadius: radius.sm,
  },
  bubbleCorrect: { backgroundColor: colors.successBg, borderColor: colors.successBorder },
  bubbleWrong: { backgroundColor: colors.warningBg, borderColor: colors.warningBorder },
  bubbleText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: fontSize.md * lineHeight.relaxed,
  },
  bubbleTextUser: { color: colors.surface, fontWeight: fontWeight.medium },

  deck: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.bg,
  },
  btn: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  btnGhost: { backgroundColor: "transparent", borderStyle: "dashed", borderColor: colors.primaryBorder },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: fontWeight.semibold, textAlign: "center" },
  btnTextGhost: { color: colors.primaryDark },
  btnTextPrimary: { color: colors.surface },

  askRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  askInput: {
    flex: 1,
    minHeight: sizing.buttonHeight,
    maxHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  askSend: {
    height: sizing.buttonHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  askSendDisabled: { opacity: 0.5 },
  askSendText: { color: colors.surface, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  askCancel: { textAlign: "center", color: colors.textMuted, fontSize: fontSize.sm, paddingTop: spacing.xs },
});
