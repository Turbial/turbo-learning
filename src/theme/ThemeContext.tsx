// theme/ThemeContext.tsx — selects the active product theme + OS light/dark.
// Wrap the app once (in app/_layout.tsx) with the theme for the enrolled program:
//   <ThemeProvider theme={themeForSlug(programSlug)}> ... </ThemeProvider>
// Components read colors via useTheme(); structural tokens import directly.
import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import type { Theme, ColorScale } from './tokens';
import { defaultColorScale } from './tokens';
import { defaultTheme } from './themes';

type ThemeValue = { colors: ColorScale; scheme: 'light' | 'dark'; reduceMotion: boolean };

const fallbackColors = defaultTheme.colors.light ?? defaultColorScale;

const ThemeCtx = createContext<ThemeValue>({
  colors: fallbackColors, scheme: 'light', reduceMotion: false,
});

export function ThemeProvider({
  theme = defaultTheme, reduceMotion = false, children,
}: { theme?: Theme; reduceMotion?: boolean; children: React.ReactNode }) {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = theme.colors[scheme] ?? theme.colors.light ?? defaultColorScale;
  return <ThemeCtx.Provider value={{ colors, scheme, reduceMotion }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
