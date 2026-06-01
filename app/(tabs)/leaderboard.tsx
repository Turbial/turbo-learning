// ─── Leaderboard Screen — global / friends rankings ───

import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/theme/tokens";
import { useLeaderboard, LeaderRow } from "../../src/data/useLeaderboard";
import { useAuth } from "../../src/data/useAuth";

function rankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function rankStyle(rank: number) {
  if (rank === 1) return { color: "#b45309", fontWeight: fontWeight.extrabold } as const;
  if (rank === 2) return { color: "#6b7280", fontWeight: fontWeight.extrabold } as const;
  if (rank === 3) return { color: "#b45309", fontWeight: fontWeight.extrabold } as const;
  return undefined;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [scope, setScope] = useState<"global" | "friends">("global");
  const { data, isLoading, isError } = useLeaderboard(scope, 50);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Progress</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scope toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, scope === "global" && styles.toggleActive]}
          onPress={() => setScope("global")}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, scope === "global" && styles.toggleTextActive]}>🌍 Global</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, scope === "friends" && styles.toggleActive]}
          onPress={() => setScope("friends")}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, scope === "friends" && styles.toggleTextActive]}>👥 Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error */}
      {isError && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Couldn't load leaderboard</Text>
          <Text style={styles.emptyHint}>Check your connection and try again later.</Text>
        </View>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>
            {scope === "global" ? "No rankings yet" : "No friends on the board"}
          </Text>
          <Text style={styles.emptyHint}>
            {scope === "global"
              ? "Complete lessons to earn XP and climb the ranks."
              : "Invite friends and compete together."}
          </Text>
        </View>
      )}

      {/* Leaderboard list */}
      {data && data.length > 0 && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
          {/* Top 3 podium */}
          {data.length >= 3 && (
            <View style={styles.podium}>
              {data[1] && (
                <View style={styles.podiumCol}>
                  <Text style={styles.podiumRank}>🥈</Text>
                  <View style={[styles.podiumBlock, styles.podiumSecond]}>
                    <Text style={styles.podiumName} numberOfLines={1}>{data[1].display_name || "Player"}</Text>
                    <Text style={styles.podiumXp}>{data[1].xp.toLocaleString()} XP</Text>
                  </View>
                </View>
              )}
              {data[0] && (
                <View style={styles.podiumCol}>
                  <Text style={styles.podiumRank}>🥇</Text>
                  <View style={[styles.podiumBlock, styles.podiumFirst]}>
                    <Text style={styles.podiumName} numberOfLines={1}>{data[0].display_name || "Player"}</Text>
                    <Text style={styles.podiumXp}>{data[0].xp.toLocaleString()} XP</Text>
                  </View>
                </View>
              )}
              {data[2] && (
                <View style={styles.podiumCol}>
                  <Text style={styles.podiumRank}>🥉</Text>
                  <View style={[styles.podiumBlock, styles.podiumThird]}>
                    <Text style={styles.podiumName} numberOfLines={1}>{data[2].display_name || "Player"}</Text>
                    <Text style={styles.podiumXp}>{data[2].xp.toLocaleString()} XP</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Full list */}
          {data.map((row: LeaderRow) => {
            const isMe = user?.id === row.user_id;
            return (
              <View key={row.user_id} style={[styles.row, isMe && styles.rowMe]}>
                <Text style={[styles.rowRank, rankStyle(row.rank)]}>{rankEmoji(row.rank)}</Text>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowName, isMe && styles.rowNameMe]} numberOfLines={1}>
                    {row.display_name || "Anonymous"}{isMe ? " (you)" : ""}
                  </Text>
                </View>
                <Text style={[styles.rowXp, isMe && styles.rowXpMe]}>
                  {row.xp.toLocaleString()} XP
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  backText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: "600" as const },
  title: { fontSize: fontSize.lg, fontWeight: "800" as const, color: colors.textPrimary, textAlign: "center" as const, flex: 1 },
  headerSpacer: { width: 70 },
  toggleRow: {
    flexDirection: "row",
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.surfaceHover,
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted },
  toggleTextActive: { color: "#fff" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted, textAlign: "center" },
  emptyHint: { fontSize: fontSize.sm, color: colors.textDim, textAlign: "center", marginTop: spacing.xs, lineHeight: 20 },
  scroll: { flex: 1 },
  listContent: { padding: spacing.md },
  // Podium
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  podiumCol: { alignItems: "center", flex: 1, maxWidth: 110 },
  podiumRank: { fontSize: fontSize.xxl, marginBottom: spacing.xs },
  podiumBlock: {
    width: "100%",
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 2,
  },
  podiumFirst: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    paddingVertical: spacing.md,
  },
  podiumSecond: {
    backgroundColor: colors.surfaceHover,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.sm + 2,
  },
  podiumThird: {
    backgroundColor: "#fef9f3",
    borderColor: "#fdba74",
    paddingVertical: spacing.sm,
  },
  podiumName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    maxWidth: 90,
  },
  podiumXp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: "transparent",
  },
  rowMe: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  rowRank: {
    width: 36,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textAlign: "center",
  },
  rowInfo: { flex: 1, marginLeft: spacing.sm },
  rowName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  rowNameMe: { color: colors.primary },
  rowXp: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  rowXpMe: { color: colors.primaryDark },
});
