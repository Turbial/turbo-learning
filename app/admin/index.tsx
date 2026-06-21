// app/admin/index.tsx — Admin analytics dashboard

import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../src/data/supabase";
import { colors, spacing, radius, fontSize } from "../../src/theme/tokens";

// ─── Goal label map ───────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  automate: "Automate work",
  career:   "Advance career",
  business: "Start AI business",
  learn:    "Understand AI",
  systems:  "Build AI systems",
};

// ─── Data hook ────────────────────────────────────────────────────────────────

function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

      const [profilesRes, lessonsRes, subscriptionsRes, reviewRes, recentLessonsRes] = await Promise.all([
        supabase.from("profiles").select("id, xp, streak, created_at, goal, onboarded", { count: "exact" }),
        supabase.from("lesson_progress").select("id, xp_earned, score, completed_at, user_id", { count: "exact" }),
        supabase.from("subscriptions").select("id, status, plan", { count: "exact" }),
        supabase.from("review_queue").select("id", { count: "exact" }),
        supabase.from("lesson_progress").select("completed_at, user_id").gte("completed_at", sevenDaysAgo),
      ]);

      const profiles     = profilesRes.data     ?? [];
      const lessons      = lessonsRes.data       ?? [];
      const subs         = subscriptionsRes.data ?? [];
      const recentLesson = recentLessonsRes.data ?? [];

      // ── Core aggregates ──
      const totalXp  = profiles.reduce((sum: number, p: any) => sum + (p.xp ?? 0), 0);
      const avgStreak = profiles.length
        ? profiles.reduce((sum: number, p: any) => sum + (p.streak ?? 0), 0) / profiles.length
        : 0;
      const avgScore = lessons.length
        ? lessons.reduce((sum: number, l: any) => sum + (l.score ?? 0), 0) / lessons.length
        : 0;
      const activeSubs   = subs.filter((s: any) => s.status === "active").length;
      const newUsers7d   = profiles.filter((p: any) => (p.created_at ?? "") > sevenDaysAgo).length;
      const totalUsers   = profilesRes.count ?? profiles.length;

      // ── Funnel ──
      const onboardedCount   = profiles.filter((p: any) => p.onboarded).length;
      const usersWithLessons = new Set(lessons.map((l: any) => l.user_id)).size;
      const activeThisWeek   = new Set(recentLesson.map((l: any) => l.user_id)).size;

      // ── Daily completions — last 7 days ──
      const dailyCompletions = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 3600 * 1000);
        const dateStr = d.toISOString().slice(0, 10);
        return {
          label: d.toLocaleDateString(undefined, { weekday: "short" }),
          count: recentLesson.filter((l: any) => (l.completed_at ?? "").startsWith(dateStr)).length,
        };
      });

      // ── Goal distribution ──
      const goalDist: Record<string, number> = {};
      profiles.forEach((p: any) => {
        if (p.goal) goalDist[p.goal] = (goalDist[p.goal] ?? 0) + 1;
      });

      // ── Recent completions (last 20) ──
      const { data: recent } = await supabase
        .from("lesson_progress")
        .select("id, xp_earned, score, completed_at")
        .order("completed_at", { ascending: false })
        .limit(20);

      return {
        totalUsers,
        totalCompletions: lessonsRes.count ?? lessons.length,
        totalReviewItems: reviewRes.count ?? 0,
        totalXp,
        avgStreak: Math.round(avgStreak * 10) / 10,
        avgScore:  Math.round(avgScore),
        activeSubs,
        newUsers7d,
        funnel: { totalUsers, onboardedCount, usersWithLessons, activeThisWeek },
        dailyCompletions,
        goalDist,
        recentCompletions: (recent ?? []) as Array<{ id: string; xp_earned: number; score: number; completed_at: string }>,
      };
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <View style={[c.statCard, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null]}>
      <Text style={c.statValue}>{value}</Text>
      <Text style={c.statLabel}>{label}</Text>
      {sub ? <Text style={c.statSub}>{sub}</Text> : null}
    </View>
  );
}

function FunnelChart({ funnel }: { funnel: { totalUsers: number; onboardedCount: number; usersWithLessons: number; activeThisWeek: number } }) {
  const { totalUsers, onboardedCount, usersWithLessons, activeThisWeek } = funnel;
  const base = Math.max(totalUsers, 1);

  const stages = [
    { label: "Signed up",        count: totalUsers,       icon: "👥", color: "#6366f1" },
    { label: "Onboarded",        count: onboardedCount,   icon: "✅", color: "#8b5cf6" },
    { label: "Started learning", count: usersWithLessons, icon: "📚", color: "#059669" },
    { label: "Active this week", count: activeThisWeek,   icon: "🔥", color: "#f59e0b" },
  ];

  return (
    <View style={c.card}>
      {stages.map((stage, i) => {
        const pct = Math.round((stage.count / base) * 100);
        const barW = `${Math.max(pct, 2)}%` as any;
        return (
          <View key={stage.label} style={[c.funnelRow, i < stages.length - 1 && c.funnelRowBorder]}>
            <View style={c.funnelMeta}>
              <Text style={c.funnelIcon}>{stage.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={c.funnelLabel}>{stage.label}</Text>
                <View style={c.funnelBarTrack}>
                  <View style={[c.funnelBarFill, { width: barW, backgroundColor: stage.color }]} />
                </View>
              </View>
            </View>
            <View style={c.funnelRight}>
              <Text style={[c.funnelCount, { color: stage.color }]}>{stage.count.toLocaleString()}</Text>
              <Text style={c.funnelPct}>{pct}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function DailyChart({ data }: { data: Array<{ label: string; count: number }> }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const BAR_MAX  = 80;

  return (
    <View style={c.card}>
      <View style={c.barChartWrap}>
        {data.map((d, i) => {
          const barH = Math.max((d.count / maxCount) * BAR_MAX, d.count > 0 ? 4 : 2);
          const isToday = i === data.length - 1;
          return (
            <View key={d.label} style={c.barCol}>
              <Text style={c.barCount}>{d.count > 0 ? d.count : ""}</Text>
              <View style={c.barTrack}>
                <View style={[
                  c.barFill,
                  { height: barH },
                  isToday ? c.barFillToday : c.barFillNormal,
                ]} />
              </View>
              <Text style={[c.barLabel, isToday && c.barLabelToday]}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function GoalDistribution({ goalDist, total }: { goalDist: Record<string, number>; total: number }) {
  const sorted = Object.entries(goalDist).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    return <View style={c.card}><Text style={c.empty}>No goal data yet</Text></View>;
  }
  return (
    <View style={c.card}>
      {sorted.map(([key, count], i) => {
        const pct  = total > 0 ? Math.round((count / total) * 100) : 0;
        const barW = `${Math.max(pct, 1)}%` as any;
        return (
          <View key={key} style={[c.goalRow, i < sorted.length - 1 && c.goalRowBorder]}>
            <View style={c.goalTop}>
              <Text style={c.goalName}>{GOAL_LABELS[key] ?? key}</Text>
              <Text style={c.goalCount}>{count} · {pct}%</Text>
            </View>
            <View style={c.goalBarTrack}>
              <View style={[c.goalBarFill, { width: barW }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data, isLoading, error, refetch } = useAdminStats();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={c.safe}>
        <View style={c.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={c.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={c.safe}>
        <View style={c.center}>
          <Text style={c.errorText}>⚠️ Failed to load stats</Text>
          <Text style={c.errorSub}>{String(error)}</Text>
          <TouchableOpacity style={c.retryBtn} onPress={() => refetch()}>
            <Text style={c.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={c.safe}>
      <ScrollView
        style={c.scroll}
        contentContainerStyle={c.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={c.header}>
          <Text style={c.headerTitle}>Analytics</Text>
          <Text style={c.headerSub}>Pull to refresh · {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Text>
        </View>

        {/* ── User Funnel ── */}
        <Text style={c.sectionTitle}>User Funnel</Text>
        <FunnelChart funnel={data?.funnel ?? { totalUsers: 0, onboardedCount: 0, usersWithLessons: 0, activeThisWeek: 0 }} />

        {/* ── Key metrics ── */}
        <Text style={c.sectionTitle}>Users</Text>
        <View style={c.grid}>
          <StatCard label="Total users"   value={data?.totalUsers ?? 0}     accent="#6366f1" />
          <StatCard label="New (7d)"      value={data?.newUsers7d ?? 0}      sub="last 7 days" accent="#8b5cf6" />
          <StatCard label="Avg streak"    value={`${data?.avgStreak ?? 0}d`} accent="#f59e0b" />
          <StatCard label="Active subs"   value={data?.activeSubs ?? 0}      accent="#059669" />
        </View>

        <Text style={c.sectionTitle}>Learning</Text>
        <View style={c.grid}>
          <StatCard label="Completions"    value={data?.totalCompletions ?? 0}                                  accent={colors.primary} />
          <StatCard label="Avg score"      value={`${data?.avgScore ?? 0}%`}                                   accent="#10b981" />
          <StatCard label="XP distributed" value={(data?.totalXp ?? 0).toLocaleString()} sub="total XP earned" accent="#f59e0b" />
          <StatCard label="Review items"   value={data?.totalReviewItems ?? 0}                                  accent="#6366f1" />
        </View>

        {/* ── Daily completions chart ── */}
        <Text style={c.sectionTitle}>Daily completions · last 7 days</Text>
        <DailyChart data={data?.dailyCompletions ?? []} />

        {/* ── Goal distribution ── */}
        <Text style={c.sectionTitle}>Goal distribution</Text>
        <GoalDistribution
          goalDist={data?.goalDist ?? {}}
          total={data?.totalUsers ?? 0}
        />

        {/* ── Recent completions ── */}
        <Text style={c.sectionTitle}>Recent completions</Text>
        <View style={c.card}>
          {(data?.recentCompletions ?? []).length === 0 ? (
            <Text style={c.empty}>No completions yet</Text>
          ) : (
            (data?.recentCompletions ?? []).map((comp) => (
              <View key={comp.id} style={c.completionRow}>
                <View style={c.completionLeft}>
                  <Text style={c.completionXp}>+{comp.xp_earned} XP</Text>
                  <Text style={c.completionScore}>{comp.score}%</Text>
                </View>
                <Text style={c.completionDate}>
                  {new Date(comp.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const c = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#f8fafc" },
  scroll:  { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },

  // Header
  header:     { marginBottom: 4 },
  headerTitle:{ fontSize: 26, fontWeight: "800", color: "#1a1a2e" },
  headerSub:  { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  // Section title
  sectionTitle: {
    fontSize: fontSize.sm, fontWeight: "800", color: colors.textMuted,
    letterSpacing: 1.2, textTransform: "uppercase", marginTop: spacing.sm,
  },

  // Stat grid
  grid:     { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCard: {
    backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md,
    minWidth: "45%", flex: 1,
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: "#1a1a2e", marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  statSub:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Card wrapper
  card: {
    backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },

  // Funnel
  funnelRow:       { paddingVertical: 12 },
  funnelRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  funnelMeta:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  funnelIcon:      { fontSize: 18, width: 26 },
  funnelLabel:     { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 4 },
  funnelBarTrack:  { height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  funnelBarFill:   { height: 6, borderRadius: 3 },
  funnelRight:     { position: "absolute", right: 0, top: 12, alignItems: "flex-end" },
  funnelCount:     { fontSize: 15, fontWeight: "800" },
  funnelPct:       { fontSize: 11, color: colors.textMuted, fontWeight: "600" },

  // Daily chart
  barChartWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120, paddingTop: 16 },
  barCol:       { flex: 1, alignItems: "center", gap: 4 },
  barCount:     { fontSize: 10, fontWeight: "700", color: colors.textMuted, height: 14 },
  barTrack:     { width: "100%", height: 80, justifyContent: "flex-end" },
  barFill:      { width: "100%", borderRadius: 4 },
  barFillNormal:{ backgroundColor: "#c7d2fe" },
  barFillToday: { backgroundColor: "#6366f1" },
  barLabel:     { fontSize: 10, fontWeight: "600", color: colors.textMuted },
  barLabelToday:{ color: "#6366f1", fontWeight: "800" },

  // Goal distribution
  goalRow:       { paddingVertical: 10 },
  goalRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  goalTop:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  goalName:      { fontSize: 13, fontWeight: "600", color: "#374151" },
  goalCount:     { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  goalBarTrack:  { height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  goalBarFill:   { height: 6, borderRadius: 3, backgroundColor: "#059669" },

  // Completions
  completionRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  completionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  completionXp:   { fontSize: 14, fontWeight: "700", color: "#059669" },
  completionScore:{ fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  completionDate: { fontSize: 12, color: colors.textMuted },

  // Misc
  empty:       { fontSize: 14, color: colors.textMuted, textAlign: "center", padding: spacing.md },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.textMuted },
  errorText:   { fontSize: 18, fontWeight: "700", color: "#dc2626", marginBottom: 8 },
  errorSub:    { fontSize: 13, color: colors.textMuted, textAlign: "center", marginBottom: 16 },
  retryBtn:    { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.md },
  retryText:   { color: "#fff", fontWeight: "700", fontSize: 15 },
});
