// ─── Daily Challenge — Wordle-style 5-question daily quiz ───

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from "react-native";
import { colors, spacing, radius, fontSize, fontWeight, shadow } from "../../src/theme/tokens";
import { QUESTION_BANK } from "../../src/engine/questionBank";
import { seededShuffle } from "../../src/utils/seedRandom";
import { useDailyChallengeStore } from "../../src/store/dailyChallengeStore";
import { trackEvent } from "../../src/integrations/analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "intro" | "playing" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayQuestions() {
  const todayKey = new Date().toDateString();
  return seededShuffle(QUESTION_BANK, todayKey).slice(0, 5);
}

function formatTime(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}m ${sec}s`;
}

function motivationalMessage(score: number): string {
  if (score === 5) return "Perfect score! You're an AI Operator.";
  if (score === 4) return "So close! One more and you're flawless.";
  if (score === 3) return "Solid — keep building that knowledge.";
  if (score === 2) return "Not bad. Come back tomorrow for another shot.";
  return "Tough one. Review the lessons and try again tomorrow!";
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChallengeScreen() {
  const store = useDailyChallengeStore();
  const todayKey = getTodayKey();

  // If already completed today, jump straight to 'done'
  const alreadyDone = store.isCompletedToday();

  const [phase, setPhase] = useState<Phase>(alreadyDone ? "done" : "intro");
  const [questions] = useState(() => getTodayQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Timer
  const startTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "playing") {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - (startTimeRef.current ?? Date.now()));
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  function handleAnswer(optionIndex: number) {
    if (showFeedback) return;

    const q = questions[currentIdx];
    let correct: boolean;

    if (q.type === "mc") {
      correct = optionIndex === (q.correct as number);
    } else {
      // TF: option 0 = True, option 1 = False
      const answerBool = optionIndex === 0; // true if user picked True
      correct = answerBool === (q.correct as boolean);
    }

    setSelectedOption(optionIndex);
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      const newAnswers = [...answers, correct];
      setAnswers(newAnswers);
      setShowFeedback(false);
      setSelectedOption(null);

      if (currentIdx + 1 >= questions.length) {
        // Done
        if (timerRef.current) clearInterval(timerRef.current);
        const timeTakenMs = Date.now() - (startTimeRef.current ?? Date.now());
        const score = newAnswers.filter(Boolean).length;
        store.setResult(todayKey, score, timeTakenMs, newAnswers);
        setElapsedMs(timeTakenMs);
        trackEvent({
          name: 'challenge_completed',
          score,
          totalQuestions: 5,
          timeTakenMs,
          dayKey: todayKey,
        });
        setPhase("done");
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 1200);
  }

  function handleShare() {
    const dayNum = Math.floor((Date.now() - new Date("2026-01-01").getTime()) / 86400000);
    const resultAnswers = alreadyDone ? store.answers : answers;
    const resultScore = alreadyDone ? (store.score ?? 0) : answers.filter(Boolean).length;
    const resultTimeMs = alreadyDone ? (store.timeTakenMs ?? 0) : elapsedMs;
    const grid = resultAnswers.map((a) => (a ? "🟩" : "🟥")).join("");
    const timeSec = resultTimeMs / 1000;
    const msg = `⚡ Turbo AI Challenge — Day ${dayNum}\n${resultScore}/5 correct · ${Math.round(timeSec)}s\n\n${grid}\n\nCan you beat me? turbolearning.app`;
    Share.share({ message: msg });
    trackEvent({ name: 'challenge_shared', score: resultScore, dayKey: todayKey });
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Text style={styles.introEmoji}>⚡</Text>
          <Text style={styles.introTitle}>Today's Challenge</Text>
          <Text style={styles.introSubtitle}>
            5 questions · Same for everyone today · Compete with all learners
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>5 Questions</Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>Timed</Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>Daily Reset</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setPhase("playing")}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const resultAnswers = alreadyDone ? store.answers : answers;
    const resultScore = alreadyDone ? (store.score ?? 0) : answers.filter(Boolean).length;
    const resultTimeMs = alreadyDone ? (store.timeTakenMs ?? 0) : elapsedMs;
    const grid = resultAnswers.map((a) => (a ? "🟩" : "🟥")).join("");

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Text style={styles.doneEmoji}>
            {resultScore === 5 ? "🏆" : resultScore >= 3 ? "⚡" : "💪"}
          </Text>

          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>{resultScore} / 5</Text>
          </View>

          <Text style={styles.doneTitle}>Challenge Complete!</Text>
          <Text style={styles.doneMotivation}>{motivationalMessage(resultScore)}</Text>

          <Text style={styles.gridText}>{grid}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{resultScore}/5</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{formatTime(resultTimeMs)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.primary }]}>
                {Math.round((resultScore / 5) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.shareButtonText}>Share Result</Text>
          </TouchableOpacity>

          {alreadyDone && (
            <Text style={styles.completedNote}>
              You already completed today's challenge. Come back tomorrow!
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  const tfOptions = ["True", "False"];
  const options = q.type === "mc" ? (q.options ?? []) : tfOptions;

  function getOptionStyle(idx: number) {
    if (!showFeedback || selectedOption === null) return styles.optionButton;
    if (idx === selectedOption) {
      return isCorrect ? styles.optionCorrect : styles.optionWrong;
    }
    // Highlight the correct answer when wrong
    if (!isCorrect) {
      if (q.type === "mc" && idx === (q.correct as number)) return styles.optionCorrect;
      if (q.type === "tf") {
        const correctIdx = (q.correct as boolean) ? 0 : 1;
        if (idx === correctIdx) return styles.optionCorrect;
      }
    }
    return styles.optionButton;
  }

  function getOptionTextStyle(idx: number) {
    if (!showFeedback || selectedOption === null) return styles.optionText;
    if (idx === selectedOption) {
      return isCorrect ? styles.optionTextSelected : styles.optionTextWrong;
    }
    if (!isCorrect) {
      if (q.type === "mc" && idx === (q.correct as number)) return styles.optionTextSelected;
      if (q.type === "tf") {
        const correctIdx = (q.correct as boolean) ? 0 : 1;
        if (idx === correctIdx) return styles.optionTextSelected;
      }
    }
    return styles.optionText;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Challenge</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{Math.round(elapsedMs / 1000)}s</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentIdx
                ? answers[i]
                  ? styles.dotCorrect
                  : styles.dotWrong
                : i === currentIdx
                ? styles.dotActive
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.playContent}>
        {/* Question counter */}
        <Text style={styles.questionCounter}>
          Question {currentIdx + 1} of {questions.length}
        </Text>

        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.type === "tf" && (
            <View style={styles.tfBadge}>
              <Text style={styles.tfBadgeText}>True / False</Text>
            </View>
          )}
        </View>

        {/* Answer options */}
        <View style={styles.optionsContainer}>
          {options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={getOptionStyle(idx)}
              onPress={() => handleAnswer(idx)}
              activeOpacity={showFeedback ? 1 : 0.8}
              disabled={showFeedback}
            >
              <View style={styles.optionInner}>
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {q.type === "mc"
                      ? ["A", "B", "C", "D"][idx]
                      : idx === 0
                      ? "T"
                      : "F"}
                  </Text>
                </View>
                <Text style={getOptionTextStyle(idx)}>{opt}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback banner */}
        {showFeedback && (
          <View style={[styles.feedbackBanner, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackIcon}>{isCorrect ? "✓" : "✗"}</Text>
            <Text style={styles.feedbackText}>
              {isCorrect ? q.feedback[0] : q.feedback[1]}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // ── Intro / Done layouts ──
  centerContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // ── Intro ──
  introEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  introSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoPill: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  infoPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    ...shadow.md,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: "#ffffff",
    textAlign: "center",
  },

  // ── Done ──
  doneEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  scorePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  scorePillText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: "#ffffff",
  },
  doneTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  doneMotivation: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  gridText: {
    fontSize: 32,
    letterSpacing: 4,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadow.sm,
  },
  statNum: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  shareButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
    width: "100%",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  completedNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: spacing.sm,
  },

  // ── Playing ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  timerBadge: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minWidth: 52,
    alignItems: "center",
  },
  timerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"] as any,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: colors.surfaceBorder,
  },
  dotCorrect: {
    backgroundColor: colors.primary,
  },
  dotWrong: {
    backgroundColor: colors.error,
  },

  playContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  questionCounter: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadow.md,
  },
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  tfBadge: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tfBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    ...shadow.sm,
  },
  optionCorrect: {
    backgroundColor: colors.successBg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadow.sm,
  },
  optionWrong: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.error,
    ...shadow.sm,
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  optionLetterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  optionTextSelected: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    lineHeight: 22,
  },
  optionTextWrong: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    lineHeight: 22,
  },

  feedbackBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  feedbackWrong: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  feedbackIcon: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  feedbackText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
