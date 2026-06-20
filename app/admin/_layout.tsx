// Admin layout — gates access to users whose email is in the admin list.
// For MVP: check against EXPO_PUBLIC_ADMIN_EMAILS env var (comma-separated).

import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../src/data/useAuth";
import { useProfile } from "../../src/data/queries";
import { colors } from "../../src/theme/tokens";

const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? "mvk8000@gmail.com")
  .split(",")
  .map((e: string) => e.trim().toLowerCase());

export default function AdminLayout() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isLoading = authLoading || profileLoading;
  const email = user?.email?.toLowerCase() ?? "";
  const isAdmin = ADMIN_EMAILS.includes(email);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace("/(tabs)/home");
    }
  }, [isLoading, user, isAdmin]);

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={s.center}>
        <Text style={s.denied}>Access denied</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
    </Stack>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  denied: { fontSize: 18, fontWeight: "700", color: colors.textSecondary },
});
