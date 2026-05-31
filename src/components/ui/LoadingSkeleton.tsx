// components/ui/LoadingSkeleton.tsx — shimmer skeletons while data loads.
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/tokens';

export function Skeleton({ width = '100%', height = 16, rounded = radius.md }:
  { width?: number | string; height?: number; rounded?: number }) {
  const { colors, reduceMotion } = useTheme();
  const o = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.5, duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [o, reduceMotion]);
  return <Animated.View style={{ width: width as any, height, borderRadius: rounded, backgroundColor: colors.surfaceAlt, opacity: o }} />;
}
