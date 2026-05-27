// shell/widgetRegistry.ts — the plug-in point. Mirrors engine/stepRegistry.ts.
// Partial<Record> + getWidget() fallback: a page may reference a widget before
// it's built; unknown/unbuilt keys render FallbackWidget instead of crashing.
import type { WidgetKey, WidgetHandler } from './types';
import { ContinueLessonWidget } from './widgets/ContinueLessonWidget';
import { FallbackWidget } from './widgets/FallbackWidget';

export const logWidgetError = (code: string, meta?: Record<string, unknown>) =>
  console.warn(`[widgets] ${code}`, meta ?? {});

// Only BUILT widgets appear here. Append as they're implemented (post Day 1).
export const widgetRegistry: Partial<Record<WidgetKey, WidgetHandler>> = {
  continue_lesson: {
    component: ContinueLessonWidget,
    title: 'Continue',
    icon: 'play',
    meta: { defaultSize: 'lg', requiresEnrollment: true },
  },
  // TODO (post Day 1, identical pattern):
  // journey_map, streak, xp_level, progress_summary, badges, lessons_list,
  // program_picker, daily_reminder, profile_settings, deliverable, review_queue
};

const fallbackWidget: WidgetHandler = {
  component: FallbackWidget,
  title: 'Unavailable',
  meta: { defaultSize: 'md' },
};

export function getWidget(key: string): WidgetHandler {
  const w = widgetRegistry[key as WidgetKey];
  if (!w) logWidgetError('unknown_widget', { key });
  return w ?? fallbackWidget;
}
