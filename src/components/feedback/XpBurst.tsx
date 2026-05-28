// components/feedback/XpBurst.tsx — "+N XP" flies up & fades when XP is earned.
import { useRef, useEffect } from 'react';

import { Animated, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fontWeight, motion } from '../../theme/tokens';

export function XpBurst({ xp, onDone }: { xp: number; onDone?: () => void }) {
  const { colors, reduceMotion } = useTheme();
  const y = useRef(new Animated.Value(0)).current;
  const o = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduceMotion) { o.setValue(1); const t = setTimeout(() => onDone?.(), 400); return () => clearTimeout(t); }
    Animated.parallel([
      Animated.timing(y, { toValue: -40, duration: motion.duration.xpBurst, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0, duration: motion.duration.xpBurst, useNativeDriver: true }),
    ]).start(() => onDone?.());
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: y }], opacity: o, position: 'absolute' }} pointerEvents="none">
      <Text style={{ color: colors.accent, fontWeight: fontWeight.bold, fontSize: 18 }}>+{xp} XP</Text>
    </Animated.View>
  );
}
