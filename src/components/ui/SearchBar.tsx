// components/ui/SearchBar.tsx — search input with debounce + clear.
import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize } from '../../theme/tokens';

export function SearchBar({ onSearch, placeholder = 'Search…', debounceMs = 300 }:
  { onSearch: (q: string) => void; placeholder?: string; debounceMs?: number }) {
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  useEffect(() => { const t = setTimeout(() => onSearch(q), debounceMs); return () => clearTimeout(t); }, [q]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md }}>
      <TextInput value={q} onChangeText={setQ} placeholder={placeholder} placeholderTextColor={colors.textMuted}
        style={{ flex: 1, height: 44, color: colors.text, fontSize: fontSize.bodyLg }} />
      {q ? <Pressable onPress={() => setQ('')} accessibilityRole="button"><Text style={{ color: colors.textMuted }}>✕</Text></Pressable> : null}
    </View>
  );
}
