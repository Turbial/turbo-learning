// components/ui/Tooltip.tsx — tap-to-reveal info hint.
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize } from '../../theme/tokens';

export function Tooltip({ text, children }: { text: string; children?: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setOpen(o => !o)} accessibilityRole="button" accessibilityLabel={text}>
        {children ?? <Text style={{ color: colors.textMuted }}>ⓘ</Text>}
      </Pressable>
      {open ? (
        <View style={{ position: 'absolute', bottom: 24, left: 0, maxWidth: 240, backgroundColor: colors.text, borderRadius: radius.sm, padding: spacing.sm, zIndex: 10 }}>
          <Text style={{ color: colors.background, fontSize: fontSize.caption, lineHeight: 18 }}>{text}</Text>
        </View>
      ) : null}
    </View>
  );
}
