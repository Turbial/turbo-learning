// ─── Theme tokens — single source of truth for design system ───

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
  badge: "#8b5cf6",
  level: "#3b82f6",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
};

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
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
};
