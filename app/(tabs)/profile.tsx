// ─── Profile Tab — redesigned with card layout, avatar, badges, shield ───

import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/data/supabase";
import { Field } from "../../src/components/ui/Field";
import { Button } from "../../src/components/ui/Button";
import { Avatar } from "../../src/components/ui/Avatar";
import { useToast } from "../../src/components/feedback/Toast";
import { spacing, fontSize, fontWeight, radius } from "../../src/theme/tokens";
import { useProfile, useBadges } from "../../src/data/queries";
import { useStreakShield } from "../../src/data/useStreakShield";

const GOAL_LABELS: Record<string, { label: string; emoji: string }> = {
  automate: { label: "Automate my work", emoji: "⚡" },
  career: { label: "Advance my career", emoji: "📈" },
  business: { label: "Start an AI business", emoji: "🚀" },
  learn: { label: "Understand AI better", emoji: "🧠" },
  systems: { label: "Build AI systems", emoji: "🏗️" },
};

const levelNames = ["Beginner", "Learner", "Builder", "Operator", "Master"];

export default function Profile() {
  const toast = useToast();
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: badges } = useBadges(profile?.id);
  const { data: shields, purchase } = useStreakShield(profile?.id);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if ((profile as any).goal) setGoal((profile as any).goal);
    }
  }, [profile]);

  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ name, goal })
      .eq("id", u.user?.id);
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

  const badgeList = badges?.map((b: any) => b.badges) ?? [];
  const level = profile?.level ?? 1;
  const levelName = levelNames[Math.min(level - 1, 4)] ?? `Master +${level - 5}`;
  const goalInfo = profile?.goal ? GOAL_LABELS[profile.goal] : null;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      {/* Hero card */}
      <View style={s.heroCard}>
        <Avatar name={name || "You"} size={80} />
        <Text style={s.name}>{name || "AI Operator"}</Text>
        <View style={s.levelBadge}>
          <Text style={s.levelBadgeText}>Level {level} · {levelName}</Text>
        </View>
        <View style={s.heroStats}>
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{profile?.xp?.toLocaleString() ?? 0}</Text>
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
          {(profile as any)?.daily_mins ? (
            <View style={[s.cardRow, { marginTop: 12 }]}>
              <Text style={s.cardIcon}>⏱️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardLabel}>Daily Commitment</Text>
                <Text style={s.cardValue}>
                  {(profile as any).daily_mins} min{(profile as any)?.learn_time ? ` · ${(profile as any).learn_time}` : ""}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Shield card */}
      <View style={s.card}>
        <View style={s.cardRow}>
          <Text style={s.cardIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cardLabel}>Streak Protection</Text>
            <Text style={s.cardValue}>{shields?.count ?? 0} shield{(shields?.count ?? 0) !== 1 ? "s" : ""} available</Text>
          </View>
          <TouchableOpacity
            style={s.shieldBtn}
            onPress={handleBuyShield}
            disabled={purchase.isPending}
            activeOpacity={0.7}
          >
            <Text style={s.shieldBtnText}>
              {purchase.isPending ? "..." : "Buy Shield"}
            </Text>
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
        <Text style={s.sectionTitle}>Edit Profile</Text>
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
  scroll: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, gap: 16 },

  // Hero
  heroCard: {
    backgroundColor: '#059669',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: '800' as const, color: '#fff', marginTop: 4 },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelBadgeText: { fontSize: 13, fontWeight: '700' as const, color: '#fff' },
  heroStats: {
    flexDirection: 'row',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 14,
    alignSelf: 'stretch',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 17, fontWeight: '800' as const, color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcon: { fontSize: 28 },
  cardLabel: { fontSize: 11, fontWeight: '700' as const, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  cardValue: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a2e', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: '#1a1a2e', marginBottom: 14 },

  // Shield
  shieldBtn: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  shieldBtnText: { fontSize: 13, fontWeight: '700' as const, color: '#92400e' },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  badgeIcon: { fontSize: 18 },
  badgeName: { fontSize: 13, fontWeight: '600' as const, color: '#374151' },

  // Sign out
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  signOutText: { fontSize: 15, fontWeight: '700' as const, color: '#ef4444' },
});
