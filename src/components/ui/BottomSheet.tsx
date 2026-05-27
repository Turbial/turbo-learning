// components/ui/BottomSheet.tsx — slide-up sheet for mobile interactions.
import React, { useEffect, useRef } from 'react';
import { Modal, Animated, Pressable, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, motion } from '../../theme/tokens';

export function BottomSheet({ visible, onClose, children }:
  { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const y = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.timing(y, { toValue: visible ? 0 : height, duration: motion.duration.base, useNativeDriver: true }).start();
  }, [visible, height, y]);
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <Animated.View style={{ transform: [{ translateY: y }] }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl }}>
            <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, backgroundColor: colors.border }} />
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
