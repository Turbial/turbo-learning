// components/ui/Avatar.tsx — user avatar with initials fallback.
import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, fontWeight } from '../../theme/tokens';

const initials = (name?: string) =>
  (name ?? '').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?';

export function Avatar({ name, uri, size = 40, onPress }:
  { name?: string; uri?: string | null; size?: number; onPress?: () => void }) {
  const { colors } = useTheme();
  const inner = uri
    ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius.pill }} />
    : <View style={{ width: size, height: size, borderRadius: radius.pill, backgroundColor: colors.accentSoft,
        alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.accent, fontWeight: fontWeight.bold, fontSize: size * 0.4 }}>{initials(name)}</Text>
      </View>;
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button">{inner}</Pressable> : inner;
}
