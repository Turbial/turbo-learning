// ─── Profile tab ──────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/data/supabase";
import { useToast } from "../../src/components/feedback/Toast";
import { appTheme as t } from "../../src/theme/appTheme";
import { useProfile, useBadges } from "../../src/data/queries";
import { useStreakShield } from "../../src/data/useStreakShield";

const GOAL_LABELS: Record<string, { label: string; emoji: string }> = {
  automate: { label: "Automate my work",     emoji: "⚡" },
  career:   { label: "Advance my career",    emoji: "📈" },
  business: { label: "Start an AI business", emoji: "🚀" },
  learn:    { label: "Understand AI better", emoji: "🧠" },
  systems:  { label: "Build AI systems",     emoji: "🏗️" },
};

const LEVEL_NAMES = ["Beginner", "Learner", "Builder", "Operator", "Master"];

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0]![0]! + p[p.length-1]![0]!).toUpperCase() : (p[0]![0] ?? "?").toUpperCase();
}

export default function Profile() {
  const toast  = useToast();
  const router = useRouter();
  const { data: profile }           = useProfile();
  const { data: badges }            = useBadges(profile?.id);
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

  const badgeList = badges?.map((b: any) => b.badges) ?? [];
  const level     = profile?.level ?? 1;
  const levelName = LEVEL_NAMES[Math.min(level - 1, 4)] ?? `Master +${level - 5}`;
  const goalInfo  = profile?.goal ? GOAL_LABELS[profile.goal] : null;
  const initials  = getInitials(profile?.name);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero card ── */}
      <View style={s.hero}>
        <View style={[s.ring, s.rA]} /><View style={[s.ring, s.rB]} />
        <View style={[s.ring, s.rC]} /><View style={[s.ring, s.rD]} />

        {/* Avatar */}
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initials}</Text>
        </View>
        <Text style={s.heroName}>{name || "AI Operator"}</Text>
        <View style={s.levelPill}>
          <Text style={s.levelPillTxt}>⭐ Level {level} · {levelName}</Text>
        </View>

        {/* Stats row */}
        <View style={s.heroStats}>
          {[
            { val: (profile?.xp ?? 0).toLocaleString(), label: "XP" },
            { val: `🔥 ${profile?.streak ?? 0}`,        label: "Streak" },
            { val: String(badgeList.length),             label: "Badges" },
          ].map((st, i, arr) => (
            <View key={st.label} style={{ flexDirection: "row", flex: 1 }}>
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>{st.val}</Text>
                <Text style={s.heroStatLbl}>{st.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.heroDivider} />}
            </View>
          ))}
        </View>
      </View>

      {/* ── Goal card ── */}
      {goalInfo && (
        <View style={s.card}>
          <View style={s.cardAccent} />
          <View style={s.cardBody}>
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
        </View>
      )}

      {/* ── Shield card ── */}
      <View style={s.card}>
        <View style={[s.cardAccent, { backgroundColor: t.colors.warning }]} />
        <View style={s.cardBody}>
          <View style={s.cardRow}>
            <Text style={s.cardIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardLabel}>Streak Protection</Text>
              <Text style={s.cardValue}>{shields?.count ?? 0} shield{(shields?.count ?? 0) !== 1 ? "s" : ""} available</Text>
            </View>
            <TouchableOpacity style={s.shieldBtn} onPress={handleBuyShield} disabled={purchase.isPending} activeOpacity={0.75}>
              <Text style={s.shieldBtnTxt}>{purchase.isPending ? "..." : "Buy Shield"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Badges ── */}
      {badgeList.length > 0 && (
        <View style={s.card}>
          <View style={[s.cardAccent, { backgroundColor: t.colors.accentLight }]} />
          <View style={s.cardBody}>
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
        </View>
      )}

      {/* ── Edit profile ── */}
      <View style={s.card}>
        <View style={[s.cardAccent, { backgroundColor: t.colors.sky }]} />
        <View style={s.cardBody}>
          <Text style={s.sectionTitle}>Edit Profile</Text>
          <TextInput
            style={s.input} value={name} onChangeText={setName}
            placeholder="Display name" placeholderTextColor={t.colors.textDisabled}
          />
          <TextInput
            style={[s.input, { minHeight: 80, textAlignVertical: "top" }]}
            value={goal} onChangeText={setGoal}
            placeholder="Your learning goal" placeholderTextColor={t.colors.textDisabled}
            multiline
          />
          <TouchableOpacity style={s.saveBtn} onPress={save} activeOpacity={0.85}>
            <Text style={s.saveBtnTxt}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sign out ── */}
      <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.75}>
        <Text style={s.signOutTxt}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: t.spacing.xxl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: t.colors.screenBg },
  content: { padding: t.spacing.md, gap: 14 },

  // Hero card
  hero: {
    backgroundColor: t.hero.bg, borderRadius: t.radius.xxl,
    padding: t.spacing.lg, alignItems: "center", gap: 10, overflow: "hidden",
    shadowColor: t.hero.bg, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 20, elevation: 8,
  },
  ring: { position: "absolute", borderRadius: 9999 },
  rA: { width: 260, height: 260, top: -80, right: -70, backgroundColor: "rgba(255,255,255,0.06)" },
  rB: { width: 140, height: 140, bottom: -50, left: -30, backgroundColor: "rgba(255,255,255,0.07)" },
  rC: { width: 80,  height: 80,  top: 20, right: 60, backgroundColor: "rgba(255,255,255,0.09)" },
  rD: { width: 50,  height: 50,  top: 60, right: 20, backgroundColor: "rgba(255,255,255,0.11)" },

  avatar:    { width: 88, height: 88, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.22)", justifyContent: "center", alignItems: "center" },
  avatarTxt: { fontSize: 34, fontWeight: t.text.weightExtrabold, color: "#fff" },
  heroName:  { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: "#fff" },
  levelPill: { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 16, paddingVertical: 5, borderRadius: t.radius.pill },
  levelPillTxt: { fontSize: 13, fontWeight: t.text.weightBold, color: "#fff" },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: t.radius.lg, padding: 14, alignSelf: "stretch" },
  heroStat:  { flex: 1, alignItems: "center" },
  heroStatVal:{ fontSize: t.text.h3, fontWeight: t.text.weightExtrabold, color: "#fff" },
  heroStatLbl:{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2, fontWeight: t.text.weightSemibold, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  heroDivider:{ width: 1, backgroundColor: "rgba(255,255,255,0.18)" },

  // Card (week-card pattern: colored left stripe + body)
  card:    { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, overflow: "hidden", flexDirection: "row", ...t.cardShadow },
  cardAccent: { width: 5, backgroundColor: t.colors.accent },
  cardBody:{ flex: 1, padding: t.spacing.md },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardIcon:{ fontSize: 26 },
  cardLabel:{ fontSize: 11, fontWeight: t.text.weightBold, color: t.colors.textDisabled, textTransform: "uppercase" as any, letterSpacing: 0.5 },
  cardValue:{ fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginTop: 2 },
  sectionTitle: { fontSize: t.text.h3, fontWeight: t.text.weightBold, color: t.colors.textPrimary, marginBottom: t.spacing.md },

  // Shield
  shieldBtn:   { backgroundColor: t.colors.warningBg, paddingHorizontal: 14, paddingVertical: 9, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.warningBorder },
  shieldBtnTxt:{ fontSize: 13, fontWeight: t.text.weightBold, color: t.colors.warningText },

  // Badges
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: t.colors.accentTint, borderRadius: t.radius.md, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: t.colors.border },
  badgeIcon: { fontSize: 18 },
  badgeName: { fontSize: 13, fontWeight: t.text.weightSemibold, color: t.colors.textBody },

  // Edit form
  input:     { height: 48, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.inputBg, color: t.colors.textPrimary, paddingHorizontal: t.spacing.md, fontSize: t.text.body, marginBottom: 10 },
  saveBtn:   { height: 48, backgroundColor: t.colors.accent, borderRadius: t.radius.lg, alignItems: "center", justifyContent: "center" },
  saveBtnTxt:{ color: "#fff", fontSize: t.text.body, fontWeight: t.text.weightExtrabold },

  // Sign out
  signOutBtn: { alignItems: "center", paddingVertical: 16, borderRadius: t.radius.lg, borderWidth: 1.5, borderColor: "#fecaca", backgroundColor: t.colors.errorBg },
  signOutTxt: { fontSize: t.text.body, fontWeight: t.text.weightBold, color: t.colors.error },
});
