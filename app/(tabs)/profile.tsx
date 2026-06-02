// ─── Profile Tab ──────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/data/supabase";
import { Field } from "../../src/components/ui/Field";
import { Button } from "../../src/components/ui/Button";
import { Avatar } from "../../src/components/ui/Avatar";
import { useToast } from "../../src/components/feedback/Toast";
import { appTheme as t } from "../../src/theme/appTheme";
import { useProfile, useBadges } from "../../src/data/queries";
import { useStreakShield } from "../../src/data/useStreakShield";

const GOAL_LABELS: Record<string, { label: string; emoji: string }> = {
  automate: { label: "Automate my work",       emoji: "⚡" },
  career:   { label: "Advance my career",      emoji: "📈" },
  business: { label: "Start an AI business",   emoji: "🚀" },
  learn:    { label: "Understand AI better",   emoji: "🧠" },
  systems:  { label: "Build AI systems",       emoji: "🏗️" },
};

const levelNames = ["Beginner", "Learner", "Builder", "Operator", "Master"];

export default function Profile() {
  const toast    = useToast();
  const router   = useRouter();
  const { data: profile }              = useProfile();
  const { data: badges }               = useBadges(profile?.id);
  const { data: shields, purchase }    = useStreakShield(profile?.id);
  const [name, setName]  = useState("");
  const [goal, setGoal]  = useState("");

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if ((profile as any).goal) setGoal((profile as any).goal);
    }
  }, [profile]);

  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update({ name, goal }).eq("id", u.user?.id);
    toast(error ? error.message : "Profile saved", error ? "error" : "success");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const handleBuyShield = async () => {
    try {
      await purchase.mutateAsync();
      toast("🛡️ Shield purchased! Your streak is protected.", "success");
    } catch (err: any) {
      toast(err?.message ?? "Failed to purchase shield", "error");
    }
  };

  const badgeList  = badges?.map((b: any) => b.badges) ?? [];
  const level      = profile?.level ?? 1;
  const levelName  = levelNames[Math.min(level - 1, 4)] ?? `Master +${level - 5}`;
  const goalInfo   = profile?.goal ? GOAL_LABELS[profile.goal] : null;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      {/* Hero card */}
      <View style={s.heroCard}>
        {/* Caustic rings */}
        <View style={s.ring1} /><View style={s.ring2} />
        <Avatar name={name || "You"} size={80} />
        <Text style={s.name}>{name || "AI Operator"}</Text>
        <View style={s.levelBadge}>
          <Text style={s.levelBadgeText}>Level {level} · {levelName}</Text>
        </View>
        <View style={s.heroStats}>
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{(profile?.xp ?? 0).toLocaleString()}</Text>
            <Text style={s.heroStatLabel}>XP</Text>
          </View>
          <View style={s.heroDivider} />
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>🔥 {profile?.streak ?? 0}</Text>
            <Text style={s.heroStatLabel}>Streak</Text>
          </View>
          <View style={s.heroDivider} />
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{badgeList.length}</Text>
            <Text style={s.heroStatLabel}>Badges</Text>
          </View>
        </View>
      </View>

      {/* Goal card */}
      {goalInfo && (
        <View style={s.card}>
          <View style={s.cardRow}>
            <Text style={s.cardIcon}>{goalInfo.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardLabel}>Learning Goal</Text>
              <Text style={s.cardValue}>{goalInfo.label}</Text>
            </View>
          </View>
          {(profile as any)?.daily_mins && (
            <View style={[s.cardRow, { marginTop: 12 }]}>
              <Text style={s.cardIcon}>⏱️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardLabel}>Daily Commitment</Text>
                <Text style={s.cardValue}>
                  {(profile as any).daily_mins} min{(profile as any)?.learn_time ? ` · ${(profile as any).learn_time}` : ""}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Shield card */}
      <View style={s.card}>
        <View style={s.cardRow}>
          <Text style={s.cardIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cardLabel}>Streak Protection</Text>
            <Text style={s.cardValue}>
              {shields?.count ?? 0} shield{(shields?.count ?? 0) !== 1 ? "s" : ""} available
            </Text>
          </View>
          <TouchableOpacity style={s.shieldBtn} onPress={handleBuyShield} disabled={purchase.isPending} activeOpacity={0.7}>
            <Text style={s.shieldBtnText}>{purchase.isPending ? "..." : "Buy Shield"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges */}
      {badgeList.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>🏅 Badges Earned</Text>
          <View style={s.badgeGrid}>
            {badgeList.map((b: any) => (
              <View key={b.slug} style={s.badgeChip}>
                <Text style={s.badgeIcon}>{b.icon ?? "🏅"}</Text>
                <Text style={s.badgeName}>{b.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Edit profile */}
      <View style={s.card}>
        <Text style={[s.sectionTitle, { textAlign: "center" }]}>Edit Profile</Text>
        <Field value={name} onChangeText={setName} placeholder="Display name" />
        <View style={{ height: 12 }} />
        <Field value={goal} onChangeText={setGoal} placeholder="Your learning goal" multiline />
        <View style={{ height: 16 }} />
        <Button title="Save changes" onPress={save} />
      </View>

      {/* Sign out */}
      <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.7}>
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: t.colors.screenBg },
  content: { padding: 20, gap: 16 },

  heroCard: {
    backgroundColor: t.hero.bg,
    borderRadius: t.radius.xxl, padding: 24, alignItems: "center", gap: 8,
    overflow: "hidden",
  },
  ring1: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -80, right: -60, backgroundColor: "rgba(255,255,255,0.07)" },
  ring2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -40, left: -20, backgroundColor: "rgba(255,255,255,0.06)" },
  name:        { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: "#fff", marginTop: 4 },
  levelBadge:  { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 14, paddingVertical: 4, borderRadius: t.radius.pill },
  levelBadgeText: { fontSize: 13, fontWeight: t.text.weightBold, color: "#fff" },
  heroStats:   { flexDirection: "row", marginTop: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: t.radius.lg, padding: 14, alignSelf: "stretch" },
  heroStat:    { flex: 1, alignItems: "center" },
  heroStatVal: { fontSize: 17, fontWeight: t.text.weightExtrabold, color: "#fff" },
  heroStatLabel:{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2, fontWeight: t.text.weightSemibold, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  heroDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },

  card:      { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, padding: 18, ...t.cardShadow },
  cardRow:   { flexDirection: "row", alignItems: "center", gap: 14 },
  cardIcon:  { fontSize: 28 },
  cardLabel: { fontSize: 11, fontWeight: t.text.weightBold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  cardValue: { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: 14 },

  shieldBtn: { backgroundColor: t.colors.warningBg, paddingHorizontal: 14, paddingVertical: 10, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.warningBorder },
  shieldBtnText: { fontSize: 13, fontWeight: t.text.weightBold, color: t.colors.warningText },

  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: t.colors.accentTint, borderRadius: t.radius.md, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: t.colors.border },
  badgeIcon: { fontSize: 18 },
  badgeName: { fontSize: 13, fontWeight: t.text.weightSemibold, color: t.colors.textBody },

  signOutBtn:  { alignItems: "center", paddingVertical: 14, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: t.colors.errorBg, backgroundColor: t.colors.errorBg },
  signOutText: { fontSize: 15, fontWeight: t.text.weightBold, color: t.colors.error },
});
