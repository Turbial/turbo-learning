// âââ Theme tokens â single source of truth for design system âââ

// Per-product themed color scale (used by Claude's ThemeContext + UI primitives)
export type ColorScale = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  success: string;
  error: string;
};

export type Theme = {
  name: string;
  colors: { light: ColorScale; dark: ColorScale };
};

// Structural tokens used by Claude's UI system
export const motion = {
  duration: { fast: 150, base: 250, slow: 400, xpBurst: 600 },
} as const;

export const sizing = { tapTargetMin: 44, buttonHeight: 48, fieldMinHeight: 96 } as const;

export const lineHeight = { tight: 1.2, normal: 1.4, relaxed: 1.6 } as const;

// Default light color scale for the AI Operator theme (used by ThemeContext)
export const defaultColorScale: ColorScale = {
  background: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F0EB",
  border: "#e8e2d9",
  text: "#2D241C",
  textMuted: "#A09484",
  accent: "#059669",
  accentText: "#FFFFFF",
  accentSoft: "#ecfdf5",
  success: "#4E8A5C",
  error: "#ef4444",
};

// Legacy flat colors object (used by our existing components)
export const colors = {
  // Brand
  primary: "#059669",
  primaryDark: "#047857",
  primaryDim: "#ecfdf5",
  primaryBorder: "#a7f3d0",

  // Neutrals
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceHover: "#F5F0EB",
  surfaceBorder: "#e8e2d9",

  // Text
  textPrimary: "#2D241C",
  textSecondary: "#5A4E40",
  textMuted: "#A09484",
  textDim: "#C4BDB6",

  // Feedback
  success: "#4E8A5C",
  successBg: "#ecfdf5",
  successBorder: "#a7f3d0",
  error: "#ef4444",
  errorBg: "#fef2f2",
  errorBorder: "#fecaca",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  warningBorder: "#fde68a",

  // Gamification
  xp: "#059669",
  streak: "#f59e0b",
  badge: "#4A8ED4",
  level: "#4A8ED4",

  // Extended palette (used by HomeDesktop and league UI)
  coral: "#ff6b6b",
  violet: "#7c3aed",
  gold: "#f59e0b",
  goldBg: "#fef9c3",
  goldBorder: "#fde047",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
  pill: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
  // Semantic aliases â used by auth screens, pricing, etc.
  body: 14,
  bodyLg: 16,
  caption: 12,
  subtitle: 18,
  title: 22,
  display: 28,
};

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  hero: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};
