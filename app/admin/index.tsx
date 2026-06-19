// app/admin/index.tsx — Admin stats overview

import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../src/data/supabase";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";

// ─── Data hooks ───

function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profilesRes, lessonsRes, subscriptionsRes, reviewRes] = await Promise.all([
        supabase.from("profiles").select("id, xp, level, streak, created_at", { count: "exact" }),
        supabase.from("lesson_progress").select("id, xp_earned, score, completed_at", { count: "exact" }),
        supabase.from("subscriptions").select("id, status, plan", { count: "exact" }),
        supabase.from("review_queue").select("id", { count: "exact" }),
      ]);

      const profiles = profilesRes.data ?? [];
      const lessons = lessonsRes.data ?? [];
      const subs = subscriptionsRes.data ?? [];

      const totalXp = profiles.reduce((sum: number, p: any) => sum + (p.xp ?? 0), 0);
      const avgStreak = profiles.length
        ? profiles.reduce((sum: number, p: any) => sum + (p.streak ?? 0), 0) / profiles.length
        : 0;
      const avgScore = lessons.length
        ? lessons.reduce((sum: number, l: any) => sum + (l.score ?? 0), 0) / lessons.length
        : 0;
      const activeSubs = subs.filter((s: any) => s.status === "active").length;

      // Recent completions (last 20)
      const { data: recent } = await supabase
        .from("lesson_progress")
        .select("id, xp_earned, score, completed_at")
        .order("completed_at", { ascending: false })
        .limit(20);

      // New users last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const newUsers = profiles.filter((p: any) => p.created_at > sevenDaysAgo).length;

      return {
        totalUsers: profilesRes.count ?? profiles.length,
        totalCompletions: lessonsRes.count ?? lessons.length,
        totalReviewItems: reviewRes.count ?? 0,
        totalXpDistributed: totalXp,
        avgStreak: Math.round(avgStreak * 10) / 10,
        avgScore: Math.round(avgScore),
        activeSubs,
        newUsersLast7Days: newUsers,
        recentCompletions: (recent ?? []) as Array<{ id: string; xp_earned: number; score: number; completed_at: string }>,
      };
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

// ─── Stat card ───

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <View style={[s.statCard, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null]}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Screen ───

export default function AdminDashboard() {
  const { data, isLoading, error, refetch, isFetching } = useAdminStats();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.errorText}>⚠️ Failed to load stats</Text>
          <Text style={s.errorSub}>{String(error)}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <Text style={s.sectionTitle}>Users</Text>
        <View style={s.grid}>
          <StatCard label="Total users" value={data?.totalUsers ?? 0} accent={colors.primary} />
          <StatCard label="New (7d)" value={data?.newUsersLast7Days ?? 0} sub="last 7 days" accent="#8b5cf6" />
          <StatCard label="Avg streak" value={`${data?.avgStreak ?? 0}d`} accent="#f59e0b" />
          <StatCard label="Active subs" value={data?.activeSubs ?? 0} accent="#059669" />
        </View>

        <Text style={s.sectionTitle}>Learning</Text>
        <View style={s.grid}>
          <StatCard label="Total completions" value={data?.totalCompletions ?? 0} accent={colors.primary} />
          <StatCard label="Avg score" value={`${data?.avgScore ?? 0}%`} accent="#10b981" />
          <StatCard label="XP distributed" value={(data?.totalXpDistributed ?? 0).toLocaleString()} sub="total XP earned" accent="#f59e0b" />
          <StatCard label="Review items" value={data?.totalReviewItems ?? 0} accent="#6366f1" />
        </View>

        <Text style={s.sectionTitle}>Recent completions</Text>
        <View style={s.card}>
          {(data?.recentCompletions ?? []).length === 0 ? (
            <Text style={s.empty}>No completions yet</Text>
          ) : (
            (data?.recentCompletions ?? []).map((c) => (
              <View key={c.id} style={s.completionRow}>
                <View style={s.completionLeft}>
                  <Text style={s.completionXp}>+{c.xp_earned} XP</Text>
                  <Text style={s.completionScore}>{c.score}%</Text>
                </View>
                <Text style={s.completionDate}>
                  {new Date(c.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.md,
    minWidth: "45%",
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: "#1a1a2e", marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  statSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  completionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  completionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  completionXp: { fontSize: 14, fontWeight: "700", color: "#059669" },
  completionScore: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  completionDate: { fontSize: 12, color: colors.textMuted },
  empty: { fontSize: 14, color: colors.textMuted, textAlign: "center", padding: spacing.md },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.textMuted },
  errorText: { fontSize: 18, fontWeight: "700", color: "#dc2626", marginBottom: 8 },
  errorSub: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginBottom: 16 },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.md },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
