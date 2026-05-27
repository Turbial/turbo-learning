// ─── Root Layout — providers, auth gate, theme ───

import { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuth } from "../src/data/useAuth";
import { useOfflineSync } from "../src/data/useOfflineSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signInAnonymously } = useAuth();
  useOfflineSync(); // handles offline queue flush

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Sign in anonymously
      signInAnonymously();
    }
  }, [user, isLoading, signInAnonymously]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboard" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="lesson/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="complete/[unitId]"
              options={{ animation: "fade" }}
            />
          </Stack>
        </AuthGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF8F5",
  },
});
