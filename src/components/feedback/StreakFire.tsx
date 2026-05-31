// components/feedback/StreakFire.tsx — flame that intensifies with streak length.
import { useRef, useEffect } from 'react';

import { Animated, View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fontWeight } from '../../theme/tokens';

export function StreakFire({ streak }: { streak: number }) {
  const { colors, reduceMotion } = useTheme();
  const s = useRef(new Animated.Value(1)).current;
  const intensity = Math.min(1, streak / 28); // grows toward day 28
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(s, { toValue: 1.12, duration: 500, useNativeDriver: true }),
      Animated.timing(s, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]));
    loop.start(); return () => loop.stop();
  }, [reduceMotion]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Animated.Text style={{ fontSize: 22 + intensity * 10, transform: [{ scale: s }] }}>🔥</Animated.Text>
      <Text style={{ color: colors.accent, fontWeight: fontWeight.bold, fontSize: 18 }}>{streak}</Text>
    </View>
  );
}
