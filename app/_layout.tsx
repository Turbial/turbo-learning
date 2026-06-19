// ─── Root Layout — providers, auth gate, theme ───

import { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { ToastProvider } from "../src/components/feedback/Toast";
import ErrorBoundary from "../src/components/ui/ErrorBoundary";
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
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  useOfflineSync(); // handles offline queue flush

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      // Not authenticated and not on an auth page → redirect to login
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      // Already authenticated on an auth page → redirect to onboarding
      // (onboard.tsx handles first-time vs returning: new users set goals, returning users skip to home)
      router.replace("/onboard");
    }
  }, [user, isLoading, segments]);

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
        <ErrorBoundary>
        <ToastProvider>
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
                name="messenger/[lessonId]"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="complete/[unitId]"
                options={{ animation: "fade" }}
              />
              <Stack.Screen
                name="auth/login"
                options={{ animation: "slide_from_bottom" }}
              />
              <Stack.Screen
                name="auth/register"
                options={{ animation: "slide_from_bottom" }}
              />
              <Stack.Screen name="auth/forgot-password" />
              <Stack.Screen name="checkout/[plan]" />
              <Stack.Screen name="deliverable/[id]" />
              <Stack.Screen name="pricing" />
              <Stack.Screen name="profile/index" />
              <Stack.Screen name="profile/settings" />
              <Stack.Screen name="programs/index" />
            </Stack>
          </AuthGate>
        </ToastProvider>
        </ErrorBoundary>
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
