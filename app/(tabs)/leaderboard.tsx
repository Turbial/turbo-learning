// ─── Leaderboard Screen ───────────────────────────────────────────────────────

import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { appTheme as t } from "../../src/theme/appTheme";
import { useLeaderboard, LeaderRow } from "../../src/data/useLeaderboard";
import { useAuth } from "../../src/data/useAuth";

function rankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [scope, setScope] = useState<"global" | "friends">("global");
  const { data, isLoading, isError } = useLeaderboard(scope, 50);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>← Progress</Text>
        </TouchableOpacity>
        <Text style={s.title}>Leaderboard</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Scope toggle */}
      <View style={s.toggleRow}>
        {(["global", "friends"] as const).map((sc) => (
          <TouchableOpacity
            key={sc}
            style={[s.toggleBtn, scope === sc && s.toggleActive]}
            onPress={() => setScope(sc)}
            activeOpacity={0.7}
          >
            <Text style={[s.toggleText, scope === sc && s.toggleTextActive]}>
              {sc === "global" ? "🌍 Global" : "👥 Friends"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={t.colors.accent} />
        </View>
      )}

      {/* Error */}
      {isError && (
        <View style={[s.center, { paddingHorizontal: t.spacing.xl }]}>
          <Text style={s.emptyEmoji}>⚠️</Text>
          <Text style={[s.emptyTitle, { textAlign: "center" }]}>Couldn't load leaderboard</Text>
          <Text style={[s.emptyHint, { textAlign: "center" }]}>Check your connection and try again.</Text>
        </View>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <View style={[s.center, { paddingHorizontal: t.spacing.xl }]}>
          <Text style={s.emptyEmoji}>🏆</Text>
          <Text style={[s.emptyTitle, { textAlign: "center" }]}>
            {scope === "global" ? "No rankings yet" : "No friends on the board"}
          </Text>
          <Text style={[s.emptyHint, { textAlign: "center" }]}>
            {scope === "global"
              ? "Complete lessons to earn XP and climb the ranks."
              : "Invite friends and compete together."}
          </Text>
        </View>
      )}

      {/* List */}
      {data && data.length > 0 && (
        <ScrollView style={s.scroll} contentContainerStyle={s.listContent}>
          {/* Podium */}
          {data.length >= 3 && (
            <View style={s.podium}>
              {[data[1], data[0], data[2]].map((row, idx) => {
                if (!row) return null;
                const medals = ["🥈", "🥇", "🥉"];
                const heights = [s.podiumSecond, s.podiumFirst, s.podiumThird];
                return (
                  <View key={row.user_id} style={s.podiumCol}>
                    <Text style={s.podiumRank}>{medals[idx]}</Text>
                    <View style={[s.podiumBlock, heights[idx]]}>
                      <Text style={s.podiumName} numberOfLines={1}>{row.display_name || "Player"}</Text>
                      <Text style={s.podiumXp}>{row.xp.toLocaleString()} XP</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Full list */}
          {data.map((row: LeaderRow) => {
            const isMe = user?.id === row.user_id;
            return (
              <View key={row.user_id} style={[s.row, isMe && s.rowMe]}>
                <Text style={[s.rowRank, row.rank <= 3 && { fontWeight: t.text.weightExtrabold, color: t.colors.warning }]}>
                  {rankEmoji(row.rank)}
                </Text>
                <View style={s.rowInfo}>
                  <Text style={[s.rowName, isMe && s.rowNameMe]} numberOfLines={1}>
                    {row.display_name || "Anonymous"}{isMe ? " (you)" : ""}
                  </Text>
                </View>
                <Text style={[s.rowXp, isMe && { color: t.colors.accentDark }]}>
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

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: t.colors.screenBg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
    borderBottomWidth: 1, borderBottomColor: t.colors.border,
    backgroundColor: t.colors.cardBg,
  },
  backText: { fontSize: t.text.bodyMd, color: t.colors.accent, fontWeight: t.text.weightSemibold },
  title:    { fontSize: t.text.h2, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, textAlign: "center", flex: 1 },

  toggleRow: { flexDirection: "row", padding: t.spacing.sm, gap: t.spacing.sm, backgroundColor: t.colors.cardBg },
  toggleBtn:        { flex: 1, paddingVertical: t.spacing.sm + 2, borderRadius: t.radius.md, alignItems: "center", backgroundColor: t.colors.accentTint },
  toggleActive:     { backgroundColor: t.colors.accent },
  toggleText:       { fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  toggleTextActive: { color: "#fff" },

  center:     { flex: 1, justifyContent: "center", alignItems: "center", padding: t.spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: t.spacing.md },
  emptyTitle: { fontSize: t.text.h2, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: t.spacing.sm },
  emptyHint:  { fontSize: t.text.bodyMd, color: t.colors.textDisabled, textAlign: "center", marginTop: t.spacing.xs, lineHeight: 20 },

  scroll:      { flex: 1 },
  listContent: { padding: t.spacing.md },

  podium:       { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: t.spacing.sm, marginBottom: t.spacing.lg, paddingTop: t.spacing.md },
  podiumCol:    { alignItems: "center", flex: 1, maxWidth: 110 },
  podiumRank:   { fontSize: t.text.display, marginBottom: t.spacing.xs },
  podiumBlock:  { width: "100%", borderRadius: t.radius.lg, padding: t.spacing.sm, alignItems: "center", borderWidth: 2 },
  podiumFirst:  { backgroundColor: "#fef3c7", borderColor: "#f59e0b", paddingVertical: t.spacing.md },
  podiumSecond: { backgroundColor: t.colors.accentTint, borderColor: t.colors.border, paddingVertical: t.spacing.sm + 2 },
  podiumThird:  { backgroundColor: "#fef9f3", borderColor: "#fdba74", paddingVertical: t.spacing.sm },
  podiumName:   { fontSize: t.text.caption, fontWeight: t.text.weightSemibold, color: t.colors.textBody, maxWidth: 90 },
  podiumXp:     { fontSize: t.text.caption, color: t.colors.textMuted, marginTop: 2 },

  row:    { flexDirection: "row", alignItems: "center", paddingVertical: t.spacing.sm + 4, paddingHorizontal: t.spacing.md, backgroundColor: t.colors.cardBg, borderRadius: t.radius.md, marginBottom: t.spacing.xs, borderWidth: 1, borderColor: "transparent" },
  rowMe:  { backgroundColor: t.colors.accentTint, borderColor: t.colors.border },
  rowRank:{ width: 36, fontSize: t.text.body, fontWeight: t.text.weightSemibold, color: t.colors.textMuted, textAlign: "center" },
  rowInfo:{ flex: 1, marginLeft: t.spacing.sm },
  rowName:{ fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold, color: t.colors.textPrimary },
  rowNameMe: { color: t.colors.accent },
  rowXp:     { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: t.colors.accent },
});
