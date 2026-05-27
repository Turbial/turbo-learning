// ComboIndicator — Shows combo multiplier
import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";

const ORANGE = "#E84E0F";

interface ComboIndicatorProps {
  combo: number;
  visible?: boolean;
}

export function ComboIndicator({ combo, visible = true }: ComboIndicatorProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (combo <= 1) return;
    // Pulse animation on combo change
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, friction: 3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  }, [combo]);

  useEffect(() => {
    if (combo <= 1) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [combo > 1]);

  if (combo <= 1 || !visible) return null;

  const multiplier = Math.floor(combo / 3);
  const bonus = multiplier * 5;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: Animated.multiply(scale, pulse) }] }]}>
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.text}>{combo} correct streak</Text>
      {bonus > 0 && <Text style={styles.bonus}>+{bonus} bonus</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: "#fff7ed",
    borderWidth: 2,
    borderColor: ORANGE + "40",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginVertical: 8,
  },
  icon: { fontSize: 16 },
  text: { fontSize: 14, fontWeight: "700", color: ORANGE },
  bonus: { fontSize: 12, fontWeight: "800", color: ORANGE, backgroundColor: ORANGE + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
});
