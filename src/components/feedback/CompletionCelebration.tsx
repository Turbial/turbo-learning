// components/feedback/CompletionCelebration.tsx — lesson-complete motion (drop into the Unit Complete screen).
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../theme/tokens';
import { ConfettiOverlay } from './ConfettiOverlay';
import { StreakFire } from './StreakFire';

export function CompletionCelebration({ xpEarned, streak }: { xpEarned: number; streak: number }) {
  const { colors, reduceMotion } = useTheme();
  const count = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  const [confetti, setConfetti] = useState(true);
  useEffect(() => {
    if (reduceMotion) { setShown(xpEarned); return; }
    const id = count.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(count, { toValue: xpEarned, duration: 900, useNativeDriver: false }).start();
    return () => count.removeListener(id);
  }, []);
  return (
    <View style={{ alignItems: 'center', gap: spacing.md, padding: spacing.xl }}>
      <ConfettiOverlay run={confetti} onDone={() => setConfetti(false)} />
      <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, fontWeight: fontWeight.bold, letterSpacing: 1 }}>YOU EARNED</Text>
      <Text style={{ color: colors.accent, fontSize: 56, fontWeight: fontWeight.bold }}>+{shown} XP</Text>
      <StreakFire streak={streak} />
    </View>
  );
}
