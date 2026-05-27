// shell/types.ts — Dashboard shell contract. Mirrors engine/types.ts.
// A page = a config that picks widgets, exactly as a lesson = a config that
// picks steps. Same mental model one level up.
import type React from 'react';

export type WidgetKey =
  | 'continue_lesson' | 'journey_map' | 'streak' | 'xp_level'
  | 'progress_summary' | 'badges' | 'lessons_list' | 'program_picker'
  | 'daily_reminder' | 'profile_settings' | 'deliverable' | 'review_queue';

export type WidgetSize = 'sm' | 'md' | 'lg' | 'full';

// Handed to every widget. Widgets are SELF-CONTAINED: they fetch their own
// data (via TanStack Query) and never depend on shared shell state.
export interface WidgetProps {
  config?: Record<string, unknown>;  // per-placement config, e.g. { programSlug }
  navigate: (path: string, params?: Record<string, string>) => void;
}

// Mirror of StepHandler. Adding a widget = component + one registry entry.
export interface WidgetHandler {
  component: React.FC<WidgetProps>;
  title: string;                      // source for nav label / header
  icon?: string;
  meta: {
    defaultSize?: WidgetSize;
    requiresEnrollment?: boolean;     // render nothing/placeholder if not enrolled
  };
}

export interface WidgetPlacement {
  widget: WidgetKey;
  size?: WidgetSize;                  // overrides handler.meta.defaultSize
  config?: Record<string, unknown>;
}

// A navigable surface. nav present → it shows in the sidebar (web) / tabs (mobile).
export interface PageConfig {
  id: string;
  title: string;
  route: string;                      // expo-router path, e.g. '/home'
  nav?: { label: string; icon?: string };
  widgets: WidgetPlacement[];
}
