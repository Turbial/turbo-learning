// shell/DashboardShell.tsx — generic page renderer. Mirrors LessonPlayer:
// it looks up each widget via getWidget() and renders it. NO per-widget logic.
// Responsive: bottom tabs on mobile (handled by app/(tabs)/_layout), sidebar on
// web/wide. Both read the SAME page configs.
import React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import type { PageConfig } from './types';
import { getWidget } from './widgetRegistry';

export function DashboardShell({ page }: { page: PageConfig }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 768; // refine grid on wide screens; full = always one column

  const navigate = (path: string, params?: Record<string, string>) =>
    router.push(params ? ({ pathname: path as any, params }) : (path as any));

  return (
    <View style={{ flex: 1 }}>
      {/* Global header (audio toggle, profile) lives in app/(tabs)/_layout.tsx */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {page.widgets.map((p, i) => {
          const W = getWidget(p.widget).component;       // always returns (fallback-safe)
          const size = p.size ?? getWidget(p.widget).meta.defaultSize ?? 'md';
          const basis = wide && size !== 'full' ? '48%' : '100%'; // simple 2-up on wide
          return (
            <View key={`${p.widget}-${i}`} style={{ width: basis }}>
              <W config={p.config} navigate={navigate} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
