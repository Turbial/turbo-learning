// components/ui/TabBar.tsx — custom animated bottom tab bar (Expo Router).
import React from 'react';
import { View, Pressable, Text } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, fontWeight, sizing } from '../../theme/tokens';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: spacing.md }}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        return (
          <Pressable key={route.key} accessibilityRole="button"
            onPress={() => { const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name); }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: sizing.tapTargetMin, paddingTop: spacing.sm }}>
            <Text style={{ color: focused ? colors.accent : colors.textMuted, fontSize: fontSize.caption, fontWeight: focused ? fontWeight.bold : fontWeight.medium }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
