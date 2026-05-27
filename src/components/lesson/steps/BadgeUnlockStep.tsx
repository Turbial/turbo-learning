// BadgeUnlockStep — Auto-display badge unlock, no XP
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ORANGE = "#E84E0F";

const BADGES: Record<string, { name: string; icon: string; desc: string }> = {
  first_day: { name: "First Steps", icon: "👣", desc: "Completed your first day of learning." },
  week_streak: { name: "7-Day Streak", icon: "🔥", desc: "You showed up every day for a week." },
  two_week_streak: { name: "14-Day Streak", icon: "💪", desc: "Two weeks of daily commitment." },
  month_streak: { name: "30-Day Streak", icon: "👑", desc: "A full month. Rare territory." },
  perfect_week: { name: "Perfect Week", icon: "⭐", desc: "100% on every lesson this week." },
  first_workflow: { name: "Workflow Builder", icon: "🏗️", desc: "You built your first AI workflow." },
  reflector: { name: "Deep Thinker", icon: "🤔", desc: "Five deep reflections completed." },
  operator: { name: "AI Operator", icon: "🚀", desc: "All 28 days complete." },
};

interface BadgeUnlockProps {
  step: { badgeSlug: string };
  onNext: () => void;
  onXP: (amount: number) => void;
}

export default function BadgeUnlockStep({ step }: BadgeUnlockProps) {
  const badge = BADGES[step.badgeSlug] ?? { name: step.badgeSlug, icon: "🏅", desc: "Badge unlocked!" };

  return (
    <View style={styles.container}>
      <View style={styles.badgeCircle}>
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
      </View>
      <Text style={styles.label}>BADGE UNLOCKED</Text>
      <Text style={styles.name}>{badge.name}</Text>
      <Text style={styles.desc}>{badge.desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  badgeCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#fff7ed", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: ORANGE, marginBottom: 20 },
  badgeIcon: { fontSize: 48 },
  label: { fontSize: 14, fontWeight: "700", color: ORANGE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  name: { fontSize: 24, fontWeight: "800", color: "#2D241C", marginBottom: 8 },
  desc: { fontSize: 16, color: "#6B5E50", textAlign: "center", lineHeight: 24 },
});
