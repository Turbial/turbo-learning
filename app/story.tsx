// ─── Story Mode — browse all 28 episodes of AI Operator as a narrative arc ───

import { useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { useLocalProgressStore } from "../src/store/localProgressStore";
import { colors, spacing, radius, fontSize, fontWeight, shadow } from "../src/theme/tokens";

// ─── Episode data — wraps the AI Operator program in a story arc ─────────────

const EPISODES = [
  { day: 1, title: "The Prediction Engine",   teaser: "Aria reveals what AI actually is — and it'll surprise you.", hasStory: true },
  { day: 2, title: "The Tool Landscape",      teaser: "Navigate the AI ecosystem. Find your weapon of choice.", hasStory: false },
  { day: 3, title: "The Art of the Prompt",   teaser: "Your words are code. Learn to write them like a pro.", hasStory: false },
  { day: 4, title: "Systems Thinking",        teaser: "Stop thinking in tasks. Start thinking in systems.", hasStory: false },
  { day: 5, title: "Automation First",        teaser: "If you're doing it twice, Aria can do it forever.", hasStory: false },
  { day: 6, title: "The Context Window",      teaser: "Memory, context, and why AI forgets everything.", hasStory: false },
  { day: 7, title: "Chain of Thought",        teaser: "Make AI think step-by-step. Watch the quality soar.", hasStory: false },
  { day: 8, title: "Data as Fuel",            teaser: "Feed the machine well. Get back pure gold.", hasStory: false },
  { day: 9, title: "The Feedback Loop",       teaser: "Operators iterate. Users accept. Know the difference.", hasStory: false },
  { day: 10, title: "Evals & Quality Gates",  teaser: "How do you know if your AI is doing it right?", hasStory: false },
  { day: 11, title: "Multi-Step Pipelines",   teaser: "One AI call isn't enough. Chain them.", hasStory: false },
  { day: 12, title: "The Human in the Loop",  teaser: "When to trust AI. When to not. The operator's call.", hasStory: false },
  { day: 13, title: "Cost & Latency",         teaser: "Fast, cheap, good — you can have two. Plan accordingly.", hasStory: false },
  { day: 14, title: "The Midpoint Challenge", teaser: "Prometheus makes his move. Can you outthink him?", hasStory: false },
  { day: 15, title: "RAG & Knowledge Bases",  teaser: "Give AI a memory that doesn't expire.", hasStory: false },
  { day: 16, title: "Fine-Tuning vs Prompting", teaser: "When to teach, when to tell.", hasStory: false },
  { day: 17, title: "AI Safety Basics",       teaser: "The guardrails. Why they exist. How to work with them.", hasStory: false },
  { day: 18, title: "Agents & Autonomy",      teaser: "AI that acts. Not just AI that responds.", hasStory: false },
  { day: 19, title: "Tool Use & APIs",        teaser: "Your AI just made a phone call. You didn't stop it.", hasStory: false },
  { day: 20, title: "The Orchestration Layer", teaser: "Conductor, not instrument. Who runs the show?", hasStory: false },
  { day: 21, title: "Production Mindset",     teaser: "Prototype is done. Now ship it.", hasStory: false },
  { day: 22, title: "Monitoring & Alerts",    teaser: "Your AI is in production. Is it behaving?", hasStory: false },
  { day: 23, title: "Versioning AI Systems",  teaser: "Models change. Your system shouldn't break.", hasStory: false },
  { day: 24, title: "The Business Case",      teaser: "ROI, time saved, risk reduced. Make the case.", hasStory: false },
  { day: 25, title: "Ethical Operations",     teaser: "Power requires responsibility. Aria reminds you.", hasStory: false },
  { day: 26, title: "Building Your Stack",    teaser: "Your personal AI operating system. Designed by you.", hasStory: false },
  { day: 27, title: "The Final Test",         teaser: "28 days of learning. Prometheus returns for one last battle.", hasStory: false },
  { day: 28, title: "Graduation Day",         teaser: "You are the operator. The story doesn't end here — it begins.", hasStory: false },
];

// ─── ARC ACTS ────────────────────────────────────────────────────────────────

function getAct(day: number): { label: string; color: string } {
  if (day <= 7)  return { label: "Act I · The Foundation",  color: "#10b981" };
  if (day <= 14) return { label: "Act II · The Build",       color: "#3b82f6" };
  if (day <= 21) return { label: "Act III · The Deploy",     color: "#8b5cf6" };
  return              { label: "Act IV · The Operator",     color: "#f59e0b" };
}

// ─── Episode card ─────────────────────────────────────────────────────────────

function EpisodeCard({
  episode,
  isCompleted,
  isLocked,
}: {
  episode: typeof EPISODES[0];
  isCompleted: boolean;
  isLocked: boolean;
}) {
  const act = getAct(episode.day);

  const handlePress = useCallback(() => {
    if (isLocked) return;
    router.push({
      pathname: "/lesson/[id]",
      params: { id: String(episode.day), program: "ai-operator", day: String(episode.day) },
    });
  }, [episode.day, isLocked]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompleted && styles.cardCompleted,
        isLocked && styles.cardLocked,
      ]}
      onPress={handlePress}
      activeOpacity={isLocked ? 1 : 0.7}
    >
      {/* Episode number */}
      <View style={[styles.episodeNum, { backgroundColor: isCompleted ? act.color : isLocked ? '#ccc' : act.color + '20', borderColor: act.color + '40' }]}>
        {isCompleted ? (
          <Text style={styles.episodeNumTextDone}>✓</Text>
        ) : (
          <Text style={[styles.episodeNumText, { color: isLocked ? '#999' : act.color }]}>
            {episode.day}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Text style={[styles.episodeTitle, isLocked && styles.lockedText]} numberOfLines={1}>
            {episode.title}
          </Text>
          {episode.hasStory && !isLocked && (
            <View style={styles.storyPill}>
              <Text style={styles.storyPillText}>🎬 Story</Text>
            </View>
          )}
          {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
        </View>
        <Text style={[styles.episodeTeaser, isLocked && styles.lockedText]} numberOfLines={2}>
          {episode.teaser}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const FREE_DAYS = 3;

export default function StoryScreen() {
  const completedUnitIds = useLocalProgressStore((s) => s.completedUnitIds);

  // Group episodes by act
  const acts: { label: string; color: string; episodes: typeof EPISODES }[] = [];
  for (const ep of EPISODES) {
    const act = getAct(ep.day);
    const existing = acts.find((a) => a.label === act.label);
    if (existing) existing.episodes.push(ep);
    else acts.push({ ...act, episodes: [ep] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story Mode</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconRow}>
            <Text style={styles.heroIcon}>🤖</Text>
            <Text style={styles.heroIconSecondary}>👨‍🏫</Text>
            <Text style={styles.heroIconVillain}>🦹</Text>
          </View>
          <Text style={styles.heroTitle}>AI Operator</Text>
          <Text style={styles.heroSub}>A 28-Day Interactive Story</Text>
          <Text style={styles.heroDesc}>
            Follow Aria, your AI mentor, as she guides you through the world of AI operations —
            with challenges, twists, and a villain who wants you to stay stuck.
          </Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🎬 Episodes with Story Mode are fully interactive</Text>
          </View>
        </View>

        {/* Acts & Episodes */}
        {acts.map((act) => (
          <View key={act.label} style={styles.actSection}>
            <View style={styles.actHeader}>
              <View style={[styles.actDot, { backgroundColor: act.color }]} />
              <Text style={[styles.actLabel, { color: act.color }]}>{act.label}</Text>
            </View>
            {act.episodes.map((ep) => {
              const isCompleted = completedUnitIds.includes(`ai-${ep.day}`) || completedUnitIds.includes(`${ep.day}-local`) || completedUnitIds.includes(String(ep.day));
              const isLocked = ep.day > FREE_DAYS && !isCompleted;
              return (
                <EpisodeCard
                  key={ep.day}
                  episode={ep}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                />
              );
            })}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#05080d' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { padding: 4 },
  backText: { fontSize: fontSize.sm, color: '#10b981', fontWeight: fontWeight.semibold },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    color: '#e8edf2',
    letterSpacing: 0.3,
  },

  scroll: {
    paddingBottom: spacing.xxl,
  },

  // Hero section
  hero: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  heroIconRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroIcon: { fontSize: 44 },
  heroIconSecondary: { fontSize: 36, marginTop: 8 },
  heroIconVillain: { fontSize: 36, marginTop: 16 },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: '#f0f4f8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: '#10b981',
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  heroDesc: {
    fontSize: fontSize.sm,
    color: '#8b9bb4',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: spacing.md,
  },
  heroBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  heroBadgeText: {
    fontSize: fontSize.xs,
    color: '#10b981',
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },

  // Act sections
  actSection: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  actHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Episode cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: spacing.md,
  },
  cardCompleted: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  cardLocked: {
    opacity: 0.45,
  },
  episodeNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  episodeNumText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },
  episodeNumTextDone: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    color: '#fff',
  },
  cardContent: { flex: 1 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  episodeTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#e8edf2',
    flex: 1,
  },
  episodeTeaser: {
    fontSize: fontSize.xs,
    color: '#8b9bb4',
    lineHeight: 17,
  },
  lockedText: { color: '#5a6a7a' },
  lockIcon: { fontSize: 12 },
  storyPill: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  storyPillText: {
    fontSize: 9,
    color: '#a78bfa',
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
});
