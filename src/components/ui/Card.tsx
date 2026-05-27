// components/ui/Card.tsx — token-driven surface primitive.
import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/tokens';

export function Card({
  children, tinted = false, style,
}: { children: React.ReactNode; tinted?: boolean; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[{
        backgroundColor: tinted ? colors.accentSoft : colors.surface,
        borderRadius: radius.lg,
        borderWidth: tinted ? 0 : 1,
        borderColor: colors.border,
        padding: spacing.xl,
        gap: spacing.md,
      }, style]}
    >
      {children}
    </View>
  );
}
