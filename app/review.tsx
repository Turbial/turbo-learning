// app/review.tsx — Full-screen spaced-repetition flashcard review session
import { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/data/useAuth';
import { useReviewQueue, useMarkReviewed } from '../src/data/useReviewQueue';
import { colors, spacing, radius, fontSize } from '../src/theme/tokens';
import { trackEvent } from '../src/integrations/analytics';

const DANGER = '#DC2626';
const WARNING = '#D97706';
const SUCCESS = '#059669';

export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: items = [], isLoading } = useReviewQueue(user?.id);
  const markReviewed = useMarkReviewed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [difficultyLog, setDifficultyLog] = useState<Array<'easy' | 'hard' | 'again'>>([]);

  const totalCards = items.length;
  const currentItem = items[currentIndex];

  const handleAnswer = (difficulty: 'easy' | 'hard' | 'again') => {
    if (!currentItem) return;
    markReviewed.mutate(
      { itemId: currentItem.id, difficulty },
      {
        onSuccess: () => {
          const nextIndex = currentIndex + 1;
          const newCount = answeredCount + 1;
          const newLog = [...difficultyLog, difficulty];
          setDifficultyLog(newLog);
          setAnsweredCount(newCount);
          if (nextIndex >= totalCards) {
            // Compute average difficulty: easy=2, hard=1, again=0
            const scores: Record<string, number> = { easy: 2, hard: 1, again: 0 };
            const avg = newLog.reduce((sum, d) => sum + scores[d], 0) / newLog.length;
            const avgDifficulty = avg >= 1.5 ? 'easy' : avg >= 0.75 ? 'hard' : 'again';
            trackEvent({
              name: 'review_completed',
              cardsReviewed: newCount,
              avgDifficulty,
            });
            setAllDone(true);
          } else {
            setCurrentIndex(nextIndex);
          }
        },
      },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.centered}>
          <Text style={s.emptyTitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state — nothing due
  if (totalCards === 0) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Review Session</Text>
          <View style={s.headerSpacer} />
        </View>
        <View style={s.centered}>
          <Text style={s.celebrationEmoji}>✅</Text>
          <Text style={s.emptyTitle}>Nothing to review right now</Text>
          <Text style={s.emptySubtitle}>Check back later — cards will appear here when they're due.</Text>
          <TouchableOpacity onPress={() => router.back()} style={s.goBackButton}>
            <Text style={s.goBackText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // All-done celebration screen
  if (allDone) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Review Session</Text>
          <View style={s.headerSpacer} />
        </View>
        <View style={s.centered}>
          <Text style={s.celebrationEmoji}>🎉</Text>
          <Text style={s.celebrationTitle}>All caught up!</Text>
          <Text style={s.celebrationSubtitle}>
            You reviewed {answeredCount} {answeredCount === 1 ? 'card' : 'cards'}. Great work!
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={s.goBackButton}>
            <Text style={s.goBackText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Active card review
  const cardNumber = currentIndex + 1;
  // Format lesson_id as friendly pill, e.g. "lesson-8" → "Day 8"
  const lessonLabel = currentItem.lesson_id
    .replace(/[-_]/g, ' ')
    .replace(/\b(\w)/g, (c) => c.toUpperCase());

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Review Session</Text>
        <Text style={s.headerCount}>{cardNumber} of {totalCards}</Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${(currentIndex / totalCards) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} bounces={false}>
        {/* Card */}
        <View style={s.card}>
          {/* Lesson pill badge */}
          <View style={s.lessonBadge}>
            <Text style={s.lessonBadgeText}>{lessonLabel}</Text>
          </View>

          {/* Step identifier */}
          <Text style={s.stepId}>{currentItem.step_id}</Text>

          <View style={s.divider} />

          <Text style={s.recallPrompt}>How well did you recall this concept?</Text>
        </View>

        {/* Difficulty buttons */}
        <View style={s.buttonsContainer}>
          <TouchableOpacity
            style={[s.difficultyButton, s.againButton]}
            onPress={() => handleAnswer('again')}
            disabled={markReviewed.isPending}
          >
            <Text style={s.difficultyButtonLabel}>Again</Text>
            <Text style={s.difficultyButtonHint}>in 10 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.difficultyButton, s.hardButton]}
            onPress={() => handleAnswer('hard')}
            disabled={markReviewed.isPending}
          >
            <Text style={s.difficultyButtonLabel}>Hard</Text>
            <Text style={s.difficultyButtonHint}>tomorrow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.difficultyButton, s.easyButton]}
            onPress={() => handleAnswer('easy')}
            disabled={markReviewed.isPending}
          >
            <Text style={s.difficultyButtonLabel}>Easy</Text>
            <Text style={s.difficultyButtonHint}>in 7 days</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    minWidth: 64,
  },
  backText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    minWidth: 64,
    textAlign: 'right',
  },
  headerSpacer: {
    minWidth: 64,
  },
  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceBorder,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
  },
  // Scroll content
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  lessonBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  stepId: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.sm,
  },
  recallPrompt: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  // Difficulty buttons
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  againButton: {
    backgroundColor: DANGER,
  },
  hardButton: {
    backgroundColor: WARNING,
  },
  easyButton: {
    backgroundColor: SUCCESS,
  },
  difficultyButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  difficultyButtonHint: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  // Empty / Celebration states
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  celebrationEmoji: {
    fontSize: 64,
  },
  celebrationTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  goBackButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  goBackText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
