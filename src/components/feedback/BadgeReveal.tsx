// components/feedback/BadgeReveal.tsx — badge unlock celebration (scale + glow + confetti).
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, Modal } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../theme/tokens';
import { ConfettiOverlay } from './ConfettiOverlay';
import { Button } from '../ui/Button';

export function BadgeReveal({ visible, name, icon = '🏅', onClose }:
  { visible: boolean; name: string; icon?: string; onClose: () => void }) {
  const { colors, reduceMotion } = useTheme();
  const scale = useRef(new Animated.Value(0.5)).current;
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    if (!visible) return;
    setConfetti(true);
    if (reduceMotion) { scale.setValue(1); return; }
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <ConfettiOverlay run={confetti} onDone={() => setConfetti(false)} />
        <Animated.View style={{ transform: [{ scale }], backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xxxl, alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: 64 }}>{icon}</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, fontWeight: fontWeight.bold, letterSpacing: 1 }}>BADGE UNLOCKED</Text>
          <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>{name}</Text>
          <Button title="Nice!" onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}
