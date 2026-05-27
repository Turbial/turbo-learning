// shell/pages.ts — page configs. Each page is a SUBSET of widgets, no forced
// sequence. "One page with everything" = a config listing every registered key.
import type { PageConfig, WidgetKey } from './types';
import { widgetRegistry } from './widgetRegistry';

export const homePage: PageConfig = {
  id: 'home', title: 'Home', route: '/home',
  nav: { label: 'Home', icon: 'home' },
  widgets: [
    { widget: 'continue_lesson', size: 'full' }, // program comes from enrollment (or config)
    { widget: 'streak', size: 'sm' },
    { widget: 'xp_level', size: 'sm' },
    { widget: 'journey_map', size: 'lg' },
  ],
};

export const progressPage: PageConfig = {
  id: 'progress', title: 'Progress', route: '/progress',
  nav: { label: 'Progress', icon: 'chart' },
  widgets: [
    { widget: 'xp_level', size: 'full' },
    { widget: 'badges', size: 'lg' },
    { widget: 'progress_summary', size: 'lg' },
  ],
};

export const settingsPage: PageConfig = {
  id: 'settings', title: 'Settings', route: '/settings',
  nav: { label: 'Settings', icon: 'gear' },
  widgets: [
    { widget: 'profile_settings', size: 'full' }, // ← former onboarding lives here, not as a gate
    { widget: 'daily_reminder', size: 'md' },
    { widget: 'program_picker', size: 'md' },      // switching program re-keys the data widgets
  ],
};

// MARCUS'S MASTER PAGE — "one page with everything". Every registered widget.
// Turning a feature off a page = removing its key from that page's `widgets`.
export const everythingPage: PageConfig = {
  id: 'all', title: 'All Features', route: '/all',
  nav: { label: 'All', icon: 'grid' },
  widgets: (Object.keys(widgetRegistry) as WidgetKey[]).map((w) => ({ widget: w })),
};

export const pages: PageConfig[] = [homePage, progressPage, settingsPage, everythingPage];
