// app/profile/index.tsx — edit name, avatar, goal, daily mins, learn time, shields.
import { useState, useEffect } from "react";

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/data/supabase";
import { Field } from "../../src/components/ui/Field";
import { Button } from "../../src/components/ui/Button";
import { Avatar } from "../../src/components/ui/Avatar";
import { useToast } from "../../src/components/feedback/Toast";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, fontSize, fontWeight, radius, colors as themeColors } from "../../src/theme/tokens";
import { useProfile, useBadges } from "../../src/data/queries";
import { useStreakShield } from "../../src/data/useStreakShield";
import { useAuth } from "../../src/data/useAuth";

const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? "mvk8000@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase());

export default function Profile() {
  const { colors } = useTheme(); const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: badges } = useBadges(profile?.id);
  const { data: shields, purchase } = useStreakShield(profile?.id);
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");
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

  const handleBuyShield = async () => {
    try {
      await purchase.mutateAsync();
      toast("🛡️ Shield purchased! Your streak is protected.", "success");
    } catch (err: any) {
      toast(err?.message ?? "Failed to purchase shield", "error");
    }
  };

  const badgeList = badges?.map((b: any) => b.badges) ?? [];

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        gap: spacing.md,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ alignItems: "center", gap: spacing.sm, paddingTop: spacing.md }}>
        <Avatar name={name || "You"} size={72} />
        <Text
          style={{
            color: colors.text,
            fontSize: fontSize.title,
            fontWeight: "800" as const,
            textAlign: "center" as const,
          }}
        >
          {name || "Your profile"}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: "center" as const }}>
          Level {profile?.level ?? 1} · {profile?.xp?.toLocaleString() ?? 0} XP
        </Text>
      </View>

      {/* Streak & Shield card */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: fontSize.md,
              fontWeight: fontWeight.bold,
            }}
          >
            🔥 {profile?.streak ?? 0}-Day Streak
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
            Protected by {shields?.count ?? 0} shield{(shields?.count ?? 0) !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: themeColors.warningBg,
            borderRadius: radius.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: themeColors.warningBorder,
          }}
          onPress={handleBuyShield}
          disabled={purchase.isPending}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: "#92400e",
              fontSize: fontSize.sm,
              fontWeight: fontWeight.bold,
            }}
          >
            {purchase.isPending ? "..." : "🛡️ Get Shield"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Badges earned */}
      {badgeList.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: fontSize.md,
              fontWeight: fontWeight.bold,
              marginBottom: spacing.sm,
            }}
          >
            🏅 Badges ({badgeList.length})
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {badgeList.map((b: any) => (
              <View
                key={b.slug}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: radius.md,
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: fontSize.sm }}>
                  {b.icon ?? "🏅"} {b.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Edit fields */}
      <Field value={name} onChangeText={setName} placeholder="Display name" />
      <Field
        value={goal}
        onChangeText={setGoal}
        placeholder="Your goal"
        multiline
      />
      <Button title="Save changes" onPress={save} />

      {isAdmin && (
        <TouchableOpacity
          onPress={() => router.push("/admin")}
          style={{
            backgroundColor: "#1a1a2e",
            borderRadius: radius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            alignItems: "center",
            marginTop: spacing.sm,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: fontSize.sm }}>
            ⚙️ Admin Dashboard
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
