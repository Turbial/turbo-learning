// data/useAnalytics.ts — typed event tracking.
import { useCallback } from 'react';
import { track as rawTrack } from '../integrations/analytics';

export type AnalyticsEvent =
  | 'lesson_started' | 'step_completed' | 'lesson_completed'
  | 'program_enrolled' | 'streak_extended' | 'badge_earned'
  | 'subscription_started' | 'subscription_cancelled';

export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent, props?: Record<string, unknown>) => {
    rawTrack(event, props);
  }, []);
  return { track };
}
