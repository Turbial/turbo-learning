// components/ui/EmptyState.tsx — illustrated empty states.
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../theme/tokens';

export function EmptyState({ icon, title, message, action }:
  { icon?: React.ReactNode; title: string; message?: string; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, gap: spacing.md }}>
      {icon}
      <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold, textAlign: 'center' }}>{title}</Text>
      {message ? <Text style={{ color: colors.textMuted, fontSize: fontSize.bodyLg, textAlign: 'center', lineHeight: 22 }}>{message}</Text> : null}
      {action}
    </View>
  );
}
