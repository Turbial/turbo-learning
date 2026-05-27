// XPToast — XP earned toast notification with haptic feedback
import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Platform } from "react-native";

const ORANGE = "#E84E0F";

interface XPToastProps {
  xp: number;
  visible: boolean;
  onDone?: () => void;
}

export function XPToast({ xp, visible, onDone }: XPToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!visible) return;
    try { if (Platform.OS !== "web") { const H = require("expo-haptics"); H.notificationAsync(H.NotificationFeedbackType.Success); } } catch {}
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => onDone?.());
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Text style={styles.icon}>⚡</Text>
      <Text style={styles.text}>+{xp} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ORANGE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  icon: { fontSize: 18 },
  text: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
