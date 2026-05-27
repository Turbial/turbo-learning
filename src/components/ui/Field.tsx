// components/ui/Field.tsx — token-driven text input primitive.
// Used by reflection / paste / builder steps. Keyboard-safety lives in the
// step component (KeyboardAvoidingView + scroll); this is just the field.
import React from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, sizing, fontSize } from '../../theme/tokens';

export function Field({
  value, onChangeText, placeholder, multiline = false,
}: { value: string; onChangeText: (t: string) => void; placeholder?: string; multiline?: boolean }) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      style={{
        minHeight: multiline ? sizing.fieldMinHeight : sizing.tapTargetMin,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        color: colors.text,
        padding: spacing.md,
        fontSize: fontSize.bodyLg,
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  );
}
