// components/ui/ProgressRing.tsx — circular progress (streak/daily %).
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { fontWeight } from '../../theme/tokens';

export function ProgressRing({ value, max = 100, size = 64, stroke = 6, label }:
  { value: number; max?: number; size?: number; stroke?: number; label?: string }) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={colors.accent} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      <Text style={{ color: colors.text, fontWeight: fontWeight.bold }}>{label ?? `${Math.round(pct*100)}%`}</Text>
    </View>
  );
}
