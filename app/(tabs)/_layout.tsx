// ─── Tab Layout — bottom tabs styled from appTheme ───────────────────────────

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { appTheme as t } from "../../src/theme/appTheme";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={s.iconWrap}>
      <Text style={[s.icon, focused && s.iconFocused]}>{emoji}</Text>
      {focused && <View style={s.activeDot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   t.tabBar.active,
        tabBarInactiveTintColor: t.tabBar.inactive,
        tabBarStyle: {
          backgroundColor: t.tabBar.bg,
          borderTopColor:  t.tabBar.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: t.text.weightBold,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Journey",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: "Progress",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarLabel: "Ranks",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      {/* Hidden — desktop layout rendered by home.tsx on web */}
      <Tabs.Screen name="HomeDesktop" options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: { alignItems: "center", justifyContent: "center", height: 28, width: 36 },
  icon:        { fontSize: 20, opacity: 0.5 },
  iconFocused: { opacity: 1, fontSize: 22 },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.tabBar.active,
  },
});
