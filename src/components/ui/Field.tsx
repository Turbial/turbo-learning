// components/ui/Field.tsx — token-driven text input primitive.
// Used by reflection / paste / builder steps. Keyboard-safety lives in the
// step component (KeyboardAvoidingView + scroll); this is just the field.
import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, sizing, fontSize } from '../../theme/tokens';

type FieldProps = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
};

export function Field({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  textContentType,
  autoComplete,
}: FieldProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      textContentType={textContentType}
      autoComplete={autoComplete}
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
