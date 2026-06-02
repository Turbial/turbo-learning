// components/ui/Button.tsx — driven by appTheme
import React from "react";
import { Pressable, Text } from "react-native";
import { appTheme as t } from "../../theme/appTheme";
import { fontWeight, fontSize } from "../../theme/tokens";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  title, onPress, variant = "primary", disabled = false,
}: { title: string; onPress: () => void; variant?: Variant; disabled?: boolean }) {
  const isPrimary   = variant === "primary";
  const isSecondary = variant === "secondary";
  const bg  = isPrimary ? (disabled ? t.colors.border : t.colors.accent) : "transparent";
  const fg  = isPrimary ? "#fff" : t.colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{
        minHeight: 48,
        borderRadius: t.radius.lg,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        backgroundColor: bg,
        borderWidth: isSecondary ? 2 : 0,
        borderColor: t.colors.accent,
        opacity: disabled && !isPrimary ? 0.5 : 1,
        maxWidth: 420,
        width: "100%",
      }}
    >
      <Text style={{ color: fg, fontWeight: fontWeight.semibold, fontSize: fontSize.bodyLg }}>
        {title}
      </Text>
    </Pressable>
  );
}
