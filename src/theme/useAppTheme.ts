// ─── useAppTheme ─────────────────────────────────────────────────────────────
//
// Hook for accessing the app theme inside React components.
//
// Usage:
//   const t = useAppTheme();
//   <Text style={{ color: t.colors.accent, fontSize: t.text.h2 }}>...</Text>
//
// For StyleSheet.create(), import the static `appTheme` directly:
//   import { appTheme as t } from "./appTheme";
//   const s = StyleSheet.create({ foo: { color: t.colors.accent } });

import { useContext, createContext } from "react";
import { appTheme, type AppTheme } from "./appTheme";

// Default context value is the built theme — no Provider needed
// unless you want runtime theme switching.
const ThemeContext = createContext<AppTheme>(appTheme);

/** Hook — use inside any React component to get the current theme. */
export function useAppTheme(): AppTheme {
  return useContext(ThemeContext);
}

/**
 * Optional provider for runtime theme switching.
 * Wrap _layout.tsx with this if you ever want to swap themes at runtime.
 *
 * Example:
 *   <ThemeProvider theme={buildTheme({ ...themeConfig, palette: "violet" })}>
 *     <App />
 *   </ThemeProvider>
 */
export { ThemeContext };
export type { AppTheme };
