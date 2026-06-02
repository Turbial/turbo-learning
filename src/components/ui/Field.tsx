// components/ui/Field.tsx — driven by appTheme
import React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { appTheme as t } from "../../theme/appTheme";
import { sizing } from "../../theme/tokens";

type FieldProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  keyboardType?: TextInputProps["keyboardType"];
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
  autoFocus?: boolean;
};

export function Field({
  value, onChangeText, placeholder, multiline = false,
  secureTextEntry, autoCapitalize, keyboardType,
  textContentType, autoComplete, autoFocus,
}: FieldProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.colors.textDisabled}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      textContentType={textContentType}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      style={{
        minHeight: multiline ? sizing.fieldMinHeight : sizing.tapTargetMin,
        borderRadius: t.radius.lg,
        borderWidth: 1.5,
        borderColor: t.colors.border,
        backgroundColor: t.colors.inputBg,
        color: t.colors.textPrimary,
        padding: t.spacing.md,
        fontSize: t.text.body,
        textAlignVertical: multiline ? "top" : "center",
        maxWidth: 420,
        width: "100%",
      }}
    />
  );
}
