// components/feedback/LevelUpModal.tsx — full-screen level-up celebration.
import { useState, useEffect } from 'react';

import { Modal, View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../theme/tokens';
import { ConfettiOverlay } from './ConfettiOverlay';
import { Button } from '../ui/Button';

export function LevelUpModal({ visible, level, levelName, onClose }:
  { visible: boolean; level: number; levelName?: string; onClose: () => void }) {
  const { colors } = useTheme();
  const [confetti, setConfetti] = useState(false);
  useEffect(() => { if (visible) setConfetti(true); }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <ConfettiOverlay run={confetti} onDone={() => setConfetti(false)} />
        <Text style={{ color: colors.accent, fontSize: fontSize.caption, fontWeight: fontWeight.bold, letterSpacing: 2 }}>LEVEL UP</Text>
        <Text style={{ color: colors.text, fontSize: 72, fontWeight: fontWeight.bold }}>{level}</Text>
        {levelName ? <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.semibold }}>{levelName}</Text> : null}
        <Button title="Keep going" onPress={onClose} />
      </View>
    </Modal>
  );
}
