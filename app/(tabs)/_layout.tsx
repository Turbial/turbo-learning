// ─── Tab Layout — bottom tabs (mobile) / sidebar (web) ───

import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/src/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Journey",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: "Progress",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
    </Tabs>
  );
}
