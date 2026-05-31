// components/ui/Button.tsx — token-driven primitive. NO hardcoded colors.
// variants: primary (filled accent) | secondary (outline) | ghost (text).
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, sizing, fontWeight, fontSize } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  title, onPress, variant = 'primary', disabled = false,
}: { title: string; onPress: () => void; variant?: Variant; disabled?: boolean }) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? (disabled ? colors.border : colors.accent) : 'transparent';
  const fg = isPrimary ? colors.accentText : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{
        minHeight: sizing.buttonHeight,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        backgroundColor: bg,
        borderWidth: variant === 'secondary' ? 2 : 0,
        borderColor: colors.accent,
        opacity: disabled && !isPrimary ? 0.5 : 1,
        maxWidth: 420,
        width: '100%',
      }}
    >
      <Text style={{ color: fg, fontWeight: fontWeight.semibold, fontSize: fontSize.bodyLg }}>
        {title}
      </Text>
    </Pressable>
  );
}
