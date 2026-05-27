// components/feedback/ConfettiOverlay.tsx — lightweight confetti (no extra deps).
import React, { useEffect, useRef } from 'react';
import { Animated, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function ConfettiOverlay({ run, pieces = 40, onDone }:
  { run: boolean; pieces?: number; onDone?: () => void }) {
  const { colors, reduceMotion } = useTheme();
  const { width, height } = useWindowDimensions();
  const anims = useRef(Array.from({ length: pieces }, () => new Animated.Value(0))).current;
  const palette = [colors.accent, colors.success, colors.error, colors.text];
  useEffect(() => {
    if (!run || reduceMotion) { if (run) onDone?.(); return; }
    Animated.stagger(15, anims.map(a =>
      Animated.timing(a, { toValue: 1, duration: 1400, useNativeDriver: true }))).start(() => onDone?.());
  }, [run]);
  if (!run) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {anims.map((a, i) => {
        const x = (i / pieces) * width;
        const ty = a.interpolate({ inputRange: [0, 1], outputRange: [-20, height + 20] });
        const rot = a.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 * (i % 3 + 1)}deg`] });
        return <Animated.View key={i} style={{ position: 'absolute', left: x, width: 8, height: 12,
          backgroundColor: palette[i % palette.length], transform: [{ translateY: ty }, { rotate: rot }] }} />;
      })}
    </View>
  );
}
