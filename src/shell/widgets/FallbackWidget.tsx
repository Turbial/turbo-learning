// shell/widgets/FallbackWidget.tsx — safe placeholder for unknown/unbuilt widgets.
import React from 'react';
import { View, Text } from 'react-native';
import type { WidgetProps } from '../types';

export const FallbackWidget: React.FC<WidgetProps> = () => (
  <View style={{ padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' }}>
    <Text style={{ color: '#6B7280' }}>This feature isn’t available yet.</Text>
  </View>
);
