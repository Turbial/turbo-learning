// ─── Graduation / Certificate Screen — shown when a user completes all 28 days ───

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useProfile, useProgram } from "../../src/data/queries";
import { colors, spacing, radius, fontSize, fontWeight, shadow } from "../../src/theme/tokens";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GraduateScreen() {
  const {
    programSlug,
    totalXp,
    daysCompleted,
    knowledgeScore,
    lastUnitId,
  } = useLocalSearchParams<{
    programSlug: string;
    totalXp?: string;
    daysCompleted?: string;
    knowledgeScore?: string;
    lastUnitId?: string;
  }>();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: program, isLoading: programLoading } = useProgram(programSlug);

  const isLoading = profileLoading || programLoading;

  const userName = profile?.name ?? "Learner";
  const programTitle = program?.title ?? "the program";

  const totalXpNum = parseInt(totalXp ?? "0", 10);
  const daysCompletedNum = parseInt(daysCompleted ?? "28", 10);
  const knowledgeScoreNum = parseInt(knowledgeScore ?? "0", 10);

  const completionDate = formatDate(new Date());

  const handleShare = async () => {
    const message = [
      `I just completed ${programTitle}!`,
      ``,
      `Certificate of Completion`,
      `Awarded to: ${userName}`,
      `Program: ${programTitle}`,
      `Date: ${completionDate}`,
      ``,
      `Stats:`,
      `  Total XP: ${totalXpNum.toLocaleString()}`,
      `  Days Completed: ${daysCompletedNum}`,
      `  Knowledge Score: ${knowledgeScoreNum}%`,
      ``,
      `#TurboLearning #AI #Operator`,
    ].join("\n");

    try {
      await Share.share({ message });
    } catch {
      // User dismissed share sheet — no action needed
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration */}
        <View style={styles.celebrationBlock}>
          <Text style={styles.graduationEmoji}>🎓</Text>
          <View style={styles.confettiRow}>
            {["🎉", "✨", "🌟", "🎊", "✨", "🎉"].map((c, i) => (
              <Text key={i} style={[styles.confettiItem, { opacity: 0.7 + (i % 3) * 0.1 }]}>
                {c}
              </Text>
            ))}
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.congratsText}>Congratulations, {userName}!</Text>
        <Text style={styles.completionText}>You have completed</Text>
        <Text style={styles.programTitle}>{programTitle}</Text>

        {/* Completion date */}
        <Text style={styles.dateText}>{completionDate}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalXpNum.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daysCompletedNum}</Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{knowledgeScoreNum}%</Text>
            <Text style={styles.statLabel}>Knowledge Score</Text>
          </View>
        </View>

        {/* Certificate card */}
        <View style={styles.certificate}>
          <View style={styles.certificateHeader}>
            <Text style={styles.certificateHeaderText}>Certificate of Completion</Text>
          </View>
          <View style={styles.certificateBody}>
            <Text style={styles.certificateLabel}>This certifies that</Text>
            <Text style={styles.certificateName}>{userName}</Text>
            <Text style={styles.certificateLabel}>has successfully completed</Text>
            <Text style={styles.certificateProgram}>{programTitle}</Text>
            <View style={styles.certificateDivider} />
            <Text style={styles.certificateDate}>{completionDate}</Text>
            <Text style={styles.certificateBrand}>Turbo Learning</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.btnPrimaryText}>Share achievement</Text>
        </TouchableOpacity>

        {lastUnitId ? (
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push(`/deliverable/${lastUnitId}`)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>View my deliverables</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.btnGhostText}>Continue learning</Text>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  // Celebration
  celebrationBlock: {
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  graduationEmoji: {
    fontSize: 72,
    marginBottom: spacing.xs,
  },
  confettiRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  confettiItem: {
    fontSize: 22,
  },

  // Headline
  congratsText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  completionText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
  },
  programTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: "#059669",
    textAlign: "center",
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
    width: "100%",
    maxWidth: 380,
    ...shadow.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: "#059669",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },

  // Certificate
  certificate: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: "#059669",
    overflow: "hidden",
    marginBottom: spacing.xl,
    ...shadow.md,
  },
  certificateHeader: {
    backgroundColor: "#059669",
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  certificateHeaderText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  certificateBody: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: "center",
  },
  certificateLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: "center",
  },
  certificateName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  certificateProgram: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: "#059669",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  certificateDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#059669",
    borderRadius: 1,
    marginBottom: spacing.sm,
    opacity: 0.4,
  },
  certificateDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: "center",
  },
  certificateBrand: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Buttons
  btnPrimary: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: radius.lg,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: radius.lg,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#059669",
  },
  btnSecondaryText: {
    color: "#059669",
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  btnGhost: {
    paddingVertical: 16,
    borderRadius: radius.lg,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  btnGhostText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
