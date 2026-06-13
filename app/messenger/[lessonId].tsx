// ─── Messenger Screen — plays a compiled lesson as a chat + buttons tutor ───
// Route: /messenger/[lessonId]  (e.g. /messenger/ai-operator-day1)

import { useCallback } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChatPlayer, loadMessengerLesson } from "../../src/messenger";
import { colors, fontSize, fontWeight, spacing } from "../../src/theme/tokens";

export default function MessengerScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const loaded = loadMessengerLesson(lessonId ?? "");

  const handleExit = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  }, []);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.missing}>Tutor lesson not found.</Text>
          <TouchableOpacity onPress={handleExit}>
            <Text style={styles.link}>‹ Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ChatPlayer lesson={loaded.lesson} courseTitle={loaded.courseTitle} onExit={handleExit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg, gap: spacing.sm },
  missing: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textSecondary },
  link: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
});
