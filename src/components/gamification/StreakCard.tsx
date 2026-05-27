// StreakCard — Streak + shield display
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ORANGE = "#E84E0F";

interface StreakCardProps {
  streak: number;
  shieldCount: number;
  longestStreak?: number;
}

export function StreakCard({ streak, shieldCount, longestStreak }: StreakCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.streakSection}>
        <Text style={styles.fireIcon}>🔥</Text>
        <View>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.shieldSection}>
        <Text style={styles.shieldIcon}>🛡️</Text>
        <View>
          <Text style={styles.shieldNum}>{shieldCount}</Text>
          <Text style={styles.shieldLabel}>Shields</Text>
        </View>
      </View>
      {longestStreak !== undefined && (
        <>
          <View style={styles.divider} />
          <View style={styles.bestSection}>
            <Text style={styles.bestIcon}>🏆</Text>
            <View>
              <Text style={styles.bestNum}>{longestStreak}</Text>
              <Text style={styles.bestLabel}>Best</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e8e2d9",
    justifyContent: "space-around",
    alignItems: "center",
  },
  streakSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  fireIcon: { fontSize: 28 },
  streakNum: { fontSize: 22, fontWeight: "800", color: ORANGE },
  streakLabel: { fontSize: 11, color: "#A09484", fontWeight: "600" },
  divider: { width: 1, height: 40, backgroundColor: "#e8e2d9" },
  shieldSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  shieldIcon: { fontSize: 28 },
  shieldNum: { fontSize: 22, fontWeight: "800", color: "#3b82f6" },
  shieldLabel: { fontSize: 11, color: "#A09484", fontWeight: "600" },
  bestSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  bestIcon: { fontSize: 28 },
  bestNum: { fontSize: 22, fontWeight: "800", color: "#8b5cf6" },
  bestLabel: { fontSize: 11, color: "#A09484", fontWeight: "600" },
});
