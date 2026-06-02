// ─── Leaderboard ──────────────────────────────────────────────────────────────

import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { appTheme as t } from "../../src/theme/appTheme";
import { useLeaderboard, LeaderRow } from "../../src/data/useLeaderboard";
import { useAuth } from "../../src/data/useAuth";

function rankEmoji(rank: number) {
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
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Leaderboard 🏆</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Scope toggle — same pill style as home filter pills */}
      <View style={s.toggleRow}>
        {(["global", "friends"] as const).map((sc) => (
          <TouchableOpacity
            key={sc}
            style={[s.pill, scope === sc && s.pillActive]}
            onPress={() => setScope(sc)}
            activeOpacity={0.75}
          >
            <Text style={[s.pillTxt, scope === sc && s.pillTxtActive]}>
              {sc === "global" ? "🌍  Global" : "👥  Friends"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* States */}
      {isLoading && <View style={s.center}><ActivityIndicator size="large" color={t.colors.accent} /></View>}

      {isError && (
        <View style={s.center}>
          <Text style={s.emptyEmoji}>⚠️</Text>
          <Text style={s.emptyTitle}>Couldn't load leaderboard</Text>
          <Text style={s.emptyHint}>Check your connection and try again.</Text>
        </View>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <View style={s.center}>
          <Text style={s.emptyEmoji}>🏆</Text>
          <Text style={s.emptyTitle}>{scope === "global" ? "No rankings yet" : "No friends on the board"}</Text>
          <Text style={s.emptyHint}>
            {scope === "global" ? "Complete lessons to earn XP and climb the ranks." : "Invite friends and compete together."}
          </Text>
        </View>
      )}

      {data && data.length > 0 && (
        <ScrollView style={s.scroll} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>

          {/* ── Top 3 podium ── */}
          {data.length >= 3 && (
            <View style={s.podiumWrap}>
              {/* Order: 2nd, 1st, 3rd */}
              {([1, 0, 2] as const).map((idx) => {
                const row = data[idx];
                if (!row) return null;
                const medals = ["🥇","🥈","🥉"];
                const medal  = medals[idx] ?? "#";
                const height = [130, 100, 90][idx === 0 ? 1 : idx === 1 ? 0 : 2] ?? 100;
                const color  = [t.weekColors[0], t.colors.textDisabled, t.weekColors[2]][idx === 0 ? 1 : idx === 1 ? 0 : 2] ?? t.colors.accent;
                return (
                  <View key={row.user_id} style={s.podiumCol}>
                    <Text style={s.podiumMedal}>{medal}</Text>
                    <View style={[s.podiumBlock, { height, borderColor: color, backgroundColor: color + "15" }]}>
                      <View style={[s.podiumAvatar, { backgroundColor: color + "30" }]}>
                        <Text style={s.podiumAvatarTxt}>{(row.display_name || "?")[0]!.toUpperCase()}</Text>
                      </View>
                      <Text style={[s.podiumName, { color }]} numberOfLines={1}>{row.display_name || "Player"}</Text>
                      <Text style={s.podiumXp}>{row.xp.toLocaleString()} XP</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Full list ── */}
          <View style={s.listCard}>
            {data.map((row: LeaderRow, i: number) => {
              const isMe  = user?.id === row.user_id;
              const isTop = row.rank <= 3;
              return (
                <View key={row.user_id}>
                  <View style={[s.row, isMe && s.rowMe]}>
                    {/* Rank circle — like day circles from WeeksView */}
                    <View style={[s.rankCircle, isTop && { backgroundColor: t.colors.accent }]}>
                      <Text style={[s.rankTxt, isTop && { color: "#fff" }]}>
                        {rankEmoji(row.rank)}
                      </Text>
                    </View>
                    <View style={s.rowInfo}>
                      <Text style={[s.rowName, isMe && s.rowNameMe]} numberOfLines={1}>
                        {row.display_name || "Anonymous"}{isMe ? " (you)" : ""}
                      </Text>
                    </View>
                    <View style={[s.xpChip, isMe && s.xpChipMe]}>
                      <Text style={[s.xpChipTxt, isMe && s.xpChipTxtMe]}>
                        {row.xp.toLocaleString()} XP
                      </Text>
                    </View>
                  </View>
                  {i < data.length - 1 && <View style={s.rowDivider} />}
                </View>
              );
            })}
          </View>

          <View style={{ height: t.spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.colors.screenBg },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
    backgroundColor: t.colors.cardBg, borderBottomWidth: 1, borderBottomColor: t.colors.border,
  },
  backBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  backTxt: { fontSize: t.text.bodyMd, color: t.colors.accent, fontWeight: t.text.weightSemibold },
  title:   { fontSize: t.text.h2, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, textAlign: "center" },

  // Toggle — home filter pill style
  toggleRow:    { flexDirection: "row", gap: 10, padding: t.spacing.md, backgroundColor: t.colors.cardBg, borderBottomWidth: 1, borderBottomColor: t.colors.border },
  pill:         { flex: 1, borderRadius: t.radius.pill, paddingVertical: 9, backgroundColor: t.colors.accentTint, borderWidth: 1.5, borderColor: t.colors.border, alignItems: "center" },
  pillActive:   { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
  pillTxt:      { fontSize: t.text.bodyMd, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  pillTxtActive:{ color: "#fff", fontWeight: t.text.weightBold },

  // Center / empty states
  center:     { flex: 1, justifyContent: "center", alignItems: "center", padding: t.spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: t.spacing.md },
  emptyTitle: { fontSize: t.text.h2, fontWeight: t.text.weightBold, color: t.colors.textPrimary, textAlign: "center", marginBottom: t.spacing.sm },
  emptyHint:  { fontSize: t.text.bodyMd, color: t.colors.textDisabled, textAlign: "center", lineHeight: 22 },

  scroll:      { flex: 1 },
  listContent: { padding: t.spacing.md, gap: 14 },

  // Podium
  podiumWrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: t.spacing.sm, marginBottom: t.spacing.lg },
  podiumCol:  { alignItems: "center", flex: 1, maxWidth: 110 },
  podiumMedal:{ fontSize: 30, marginBottom: 6 },
  podiumBlock:{ width: "100%", borderRadius: t.radius.lg, borderWidth: 2, alignItems: "center", justifyContent: "flex-end", padding: 10, gap: 4 },
  podiumAvatar:{ width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  podiumAvatarTxt:{ fontSize: 16, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  podiumName: { fontSize: 11, fontWeight: t.text.weightBold, maxWidth: 90, textAlign: "center" },
  podiumXp:   { fontSize: t.text.caption, color: t.colors.textMuted },

  // List card — week card container
  listCard: { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, overflow: "hidden", ...t.cardShadow },

  row:        { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: t.spacing.md, gap: 12 },
  rowMe:      { backgroundColor: t.colors.accentTint },
  rowDivider: { height: 1, backgroundColor: t.colors.borderLight, marginHorizontal: t.spacing.md },

  rankCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: t.colors.accentTint, justifyContent: "center", alignItems: "center" },
  rankTxt:    { fontSize: 13, fontWeight: t.text.weightBold, color: t.colors.textMuted },

  rowInfo:   { flex: 1 },
  rowName:   { fontSize: t.text.body, fontWeight: t.text.weightSemibold, color: t.colors.textPrimary },
  rowNameMe: { color: t.colors.accent, fontWeight: t.text.weightBold },

  xpChip:      { backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  xpChipMe:    { backgroundColor: t.colors.accent },
  xpChipTxt:   { fontSize: 12, fontWeight: t.text.weightBold, color: t.colors.accent },
  xpChipTxtMe: { color: "#fff" },
});
