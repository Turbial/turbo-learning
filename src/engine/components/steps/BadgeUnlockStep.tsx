// ─── BadgeUnlockStep — animated badge reveal ───

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StepProps } from "../../stepRegistry";
import type { BadgeUnlockStep as BadgeUnlockStepType } from "../../types";

const BADGE_INFO: Record<string, { name: string; icon: string; desc: string }> = {
  first_day: { name: "First Steps", icon: "👣", desc: "Completed your first day of learning." },
  week_streak: { name: "7-Day Streak", icon: "🔥", desc: "You showed up every day for a week. That's real momentum." },
  two_week_streak: { name: "14-Day Streak", icon: "💪", desc: "Two weeks of daily commitment. You're building a habit." },
  month_streak: { name: "30-Day Streak", icon: "👑", desc: "A full month. You're in rare territory now." },
  perfect_week: { name: "Perfect Week", icon: "⭐", desc: "100% on every lesson this week. Precision matters." },
  first_workflow: { name: "Workflow Builder", icon: "🏗️", desc: "You built your first AI workflow. You're operating." },
  reflector: { name: "Deep Thinker", icon: "🤔", desc: "Five deep reflections. You're doing the real work." },
  operator: { name: "AI Operator", icon: "🚀", desc: "All 28 days complete. You're an AI Operator now." },
};

export default function BadgeUnlockStep({ step }: StepProps) {
  const s = step as BadgeUnlockStepType;
  const badge = BADGE_INFO[s.badgeSlug] ?? { name: s.badgeSlug, icon: "🏅", desc: "Badge unlocked!" };

  return (
    <View style={styles.container}>
      <View style={styles.badgeCircle}>
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
      </View>
      <Text style={styles.title}>Badge Unlocked!</Text>
      <Text style={styles.badgeName}>{badge.name}</Text>
      <Text style={styles.desc}>{badge.desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f3ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#8b5cf6",
    marginBottom: 20,
  },
  badgeIcon: { fontSize: 48 },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b5cf6",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D241C",
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    color: "#6B5E50",
    textAlign: "center",
    lineHeight: 24,
  },
});
