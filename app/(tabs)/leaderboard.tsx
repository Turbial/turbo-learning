// ─── Leaderboard Screen — My League (weekly) + Global rankings ───

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fontSize, fontWeight, shadow } from "../../src/theme/tokens";
import { useLeaderboard, LeaderRow } from "../../src/data/useLeaderboard";
import { useMyLeague, LeagueStanding, TIER_INFO } from "../../src/data/useLeagues";
import { useAuth } from "../../src/data/useAuth";

// ─── Helpers ───

function rankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function globalRankStyle(rank: number) {
  if (rank === 1) return { color: "#b45309", fontWeight: fontWeight.extrabold } as const;
  if (rank === 2) return { color: "#6b7280", fontWeight: fontWeight.extrabold } as const;
  if (rank === 3) return { color: "#b45309", fontWeight: fontWeight.extrabold } as const;
  return undefined;
}

// ─── My League tier card ───

function LeagueTierCard({
  tier,
  myRank,
  myWeekXp,
}: {
  tier: string;
  myRank: number;
  myWeekXp: number;
}) {
  const info = TIER_INFO[tier] ?? TIER_INFO.bronze;
  return (
    <View style={[styles.tierCard, { borderColor: info.color }]}>
      <View style={styles.tierBadge}>
        <Text style={styles.tierEmoji}>{info.emoji}</Text>
        <Text style={[styles.tierLabel, { color: info.color }]}>{info.label} League</Text>
        <Text style={styles.tierReset}>Resets Monday</Text>
      </View>
      <View style={styles.tierStats}>
        <View style={styles.tierStat}>
          <Text style={[styles.tierStatValue, { color: info.color }]}>
            {myRank > 0 ? `#${myRank}` : "—"}
          </Text>
          <Text style={styles.tierStatLabel}>My Rank</Text>
        </View>
        <View style={styles.tierStatDivider} />
        <View style={styles.tierStat}>
          <Text style={[styles.tierStatValue, { color: info.color }]}>
            {myWeekXp.toLocaleString()}
          </Text>
          <Text style={styles.tierStatLabel}>Week XP</Text>
        </View>
      </View>
    </View>
  );
}

// ─── League standings rows ───

function LeagueStandingsList({
  standings,
  myUserId,
}: {
  standings: LeagueStanding[];
  myUserId?: string;
}) {
  if (standings.length === 0) {
    return (
      <View style={styles.emptyInner}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={styles.emptyTitle}>Your league is filling up</Text>
        <Text style={styles.emptyHint}>
          Complete lessons to earn weekly XP and climb the ranks.
        </Text>
      </View>
    );
  }

  return (
    <>
      {standings.map((row) => {
        const isMe = row.user_id === myUserId;
        const tier = TIER_INFO[row.tier] ?? TIER_INFO.bronze;
        return (
          <View key={row.user_id} style={[styles.row, isMe && styles.rowMe]}>
            <Text style={[styles.rowRank, isMe && { color: tier.color }]}>
              {rankEmoji(Number(row.rank))}
            </Text>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, isMe && styles.rowNameMe]} numberOfLines={1}>
                {row.display_name || "Learner"}
                {isMe ? " (you)" : ""}
              </Text>
            </View>
            <Text style={[styles.rowXp, isMe && { color: tier.color }]}>
              {row.week_xp.toLocaleString()} XP
            </Text>
          </View>
        );
      })}
    </>
  );
}

// ─── Global leaderboard (podium + full list) ───

function GlobalList({ data, myUserId }: { data: LeaderRow[]; myUserId?: string }) {
  return (
    <>
      {/* Top 3 podium */}
      {data.length >= 3 && (
        <View style={styles.podium}>
          {data[1] && (
            <View style={styles.podiumCol}>
              <Text style={styles.podiumRank}>🥈</Text>
              <View style={[styles.podiumBlock, styles.podiumSecond]}>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {data[1].display_name || "Player"}
                </Text>
                <Text style={styles.podiumXp}>{data[1].xp.toLocaleString()} XP</Text>
              </View>
            </View>
          )}
          {data[0] && (
            <View style={styles.podiumCol}>
              <Text style={styles.podiumRank}>🥇</Text>
              <View style={[styles.podiumBlock, styles.podiumFirst]}>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {data[0].display_name || "Player"}
                </Text>
                <Text style={styles.podiumXp}>{data[0].xp.toLocaleString()} XP</Text>
              </View>
            </View>
          )}
          {data[2] && (
            <View style={styles.podiumCol}>
              <Text style={styles.podiumRank}>🥉</Text>
              <View style={[styles.podiumBlock, styles.podiumThird]}>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {data[2].display_name || "Player"}
                </Text>
                <Text style={styles.podiumXp}>{data[2].xp.toLocaleString()} XP</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Full list */}
      {data.map((row: LeaderRow) => {
        const isMe = myUserId === row.user_id;
        return (
          <View key={row.user_id} style={[styles.row, isMe && styles.rowMe]}>
            <Text style={[styles.rowRank, globalRankStyle(row.rank)]}>
              {rankEmoji(row.rank)}
            </Text>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, isMe && styles.rowNameMe]} numberOfLines={1}>
                {row.display_name || "Anonymous"}
                {isMe ? " (you)" : ""}
              </Text>
            </View>
            <Text style={[styles.rowXp, isMe && styles.rowXpMe]}>
              {row.xp.toLocaleString()} XP
            </Text>
          </View>
        );
      })}
    </>
  );
}

// ─── Main screen ───

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<"league" | "global">("league");

  const leagueQuery = useMyLeague(user?.id);
  const globalQuery = useLeaderboard("global", 50);

  const myEntry = leagueQuery.data?.standings.find((s) => s.user_id === user?.id);
  const myTier = leagueQuery.data?.tier ?? "bronze";
  const tierInfo = TIER_INFO[myTier] ?? TIER_INFO.bronze;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Progress</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab toggle — League vs Global */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, tab === "league" && styles.toggleActive]}
          onPress={() => setTab("league")}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, tab === "league" && styles.toggleTextActive]}>
            {tierInfo.emoji} My League
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, tab === "global" && styles.toggleActive]}
          onPress={() => setTab("global")}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, tab === "global" && styles.toggleTextActive]}>
            🌍 Global
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── LEAGUE TAB ── */}
      {tab === "league" && (
        <>
          {leagueQuery.isLoading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {leagueQuery.isError && (
            <View style={[styles.center, { paddingHorizontal: spacing.xl }]}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
              <Text style={[styles.emptyTitle, { textAlign: "center" as const }]}>
                Couldn't load your league
              </Text>
              <Text style={[styles.emptyHint, { textAlign: "center" as const }]}>
                Check your connection and try again later.
              </Text>
            </View>
          )}

          {!leagueQuery.isLoading && !leagueQuery.isError && leagueQuery.data && (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
              {/* Tier badge + rank card */}
              <LeagueTierCard
                tier={myTier}
                myRank={myEntry ? Number(myEntry.rank) : 0}
                myWeekXp={myEntry?.week_xp ?? 0}
              />

              <Text style={styles.sectionHeader}>This Week's Standings</Text>

              <LeagueStandingsList
                standings={leagueQuery.data.standings}
                myUserId={user?.id}
              />
            </ScrollView>
          )}
        </>
      )}

      {/* ── GLOBAL TAB ── */}
      {tab === "global" && (
        <>
          {globalQuery.isLoading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {globalQuery.isError && (
            <View style={[styles.center, { paddingHorizontal: spacing.xl }]}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
              <Text style={[styles.emptyTitle, { textAlign: "center" as const }]}>
                Couldn't load leaderboard
              </Text>
              <Text style={[styles.emptyHint, { textAlign: "center" as const }]}>
                Check your connection and try again later.
              </Text>
            </View>
          )}

          {!globalQuery.isLoading &&
            !globalQuery.isError &&
            (!globalQuery.data || globalQuery.data.length === 0) && (
              <View style={[styles.center, { paddingHorizontal: spacing.xl }]}>
                <Text style={styles.emptyEmoji}>🏆</Text>
                <Text style={[styles.emptyTitle, { textAlign: "center" as const }]}>
                  No rankings yet
                </Text>
                <Text style={[styles.emptyHint, { textAlign: "center" as const }]}>
                  Complete lessons to earn XP and climb the ranks.
                </Text>
              </View>
            )}

          {globalQuery.data && globalQuery.data.length > 0 && (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
              <Text style={styles.sectionHeader}>All-Time XP Rankings</Text>
              <GlobalList data={globalQuery.data} myUserId={user?.id} />
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header
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
  title: {
    fontSize: fontSize.lg,
    fontWeight: "800" as const,
    color: colors.textPrimary,
    textAlign: "center" as const,
    flex: 1,
  },
  headerSpacer: { width: 70 },

  // Tab toggle
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

  // Centered states
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  emptyInner: { alignItems: "center", padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: "center" as const,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  // Scroll / list
  scroll: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  // Section label
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  // ── Tier card ──
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.md,
  },
  tierBadge: { alignItems: "center", marginBottom: spacing.md },
  tierEmoji: { fontSize: 40, marginBottom: spacing.xs },
  tierLabel: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, marginBottom: 2 },
  tierReset: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  tierStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  tierStat: { alignItems: "center" },
  tierStatValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold },
  tierStatLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  tierStatDivider: { width: 1, height: 36, backgroundColor: colors.surfaceBorder },

  // ── Rows (shared: league standings + global list) ──
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
    textAlign: "center" as const,
  },
  rowInfo: { flex: 1, marginLeft: spacing.sm },
  rowName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  rowNameMe: { color: colors.primary },
  rowXp: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  rowXpMe: { color: colors.primaryDark },

  // ── Global podium ──
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
  podiumXp: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
