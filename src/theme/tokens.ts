// ─── Theme tokens — single source of truth for design system ───
// Updated to include the Turbo Learning design spec color tokens.

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

export const motion = {
  duration: { fast: 150, base: 250, slow: 400, xpBurst: 600 },
} as const;

export const sizing = { tapTargetMin: 44, buttonHeight: 48, fieldMinHeight: 96 } as const;

export const lineHeight = { tight: 1.2, normal: 1.4, relaxed: 1.6 } as const;

// ─── Turbo Learning brand palette ───
export const brand = {
  violet: "#6C3CE1",
  violetDark: "#4A12CE",
  violetLight: "#7B44FF",
  violetSoft: "#EDE0FF",
  violetBorder: "#E0D6FF",

  teal: "#00C4A7",
  tealLight: "#08B09A",

  coral: "#FF6B6B",

  gold: "#F59E0B",
  goldLight: "#FFCD5E",
  goldBg: "#FFF3D0",
  goldBorder: "#F59E0B",

  // Screen background gradient stops
  bgStart: "#F3E8FF",
  bgMid: "#E8F3FF",
  bgEnd: "#FFF0E8",
} as const;

// Default color scale (used by ThemeContext)
export const defaultColorScale: ColorScale = {
  background: "#F3E8FF",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F0EB",
  border: "#E0D6FF",
  text: "#1A1535",
  textMuted: "#9090B8",
  accent: "#6C3CE1",
  accentText: "#FFFFFF",
  accentSoft: "#EDE0FF",
  success: "#00C4A7",
  error: "#FF6B6B",
};

// ─── Legacy flat colors object (used by existing components) ───
export const colors = {
  // ── Brand ──
  primary: "#6C3CE1", // ← updated from legacy green to Violet
  primaryDark: "#4A12CE",
  primaryDim: "#EDE0FF",
  primaryBorder: "#E0D6FF",

  violet: "#6C3CE1",
  violetDark: "#4A12CE",

  teal: "#00C4A7",
  tealDark: "#08B09A",

  coral: "#FF6B6B",

  gold: "#F59E0B",
  goldLight: "#FFCD5E",
  goldBg: "#FFF3D0",
  goldBorder: "#F59E0B",

  // ── Screen background ──
  screenBg: "#F3E8FF",
  bg: "#F3E8FF",

  // ── Surfaces ──
  surface: "#FFFFFF",
  surfaceHover: "#F5F0EB",
  surfaceBorder: "#E0D6FF",

  // ── Text ──
  textPrimary: "#1A1535",
  textSecondary: "#5A4E40",
  textMuted: "#9090B8",
  textDim: "#B0B0D0",

  // ── Borders ──
  borderLight: "#E0D6FF",
  borderMuted: "#DDD0FF",

  // ── Feedback ──
  success: "#00C4A7",
  successBg: "#CCFAF4",
  successBorder: "#00C4A7",
  error: "#FF6B6B",
  errorBg: "#FFF0F0",
  errorBorder: "#FF6B6B",
  warning: "#F59E0B",
  warningBg: "#FFF3D0",
  warningBorder: "#FFCD5E",

  // ── Gamification ──
  xp: "#6C3CE1",
  streak: "#F59E0B",
  badge: "#6C3CE1",
  level: "#6C3CE1",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
  pill: 9999,
  avatar: 17,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,

  // Semantic aliases
  body: 14,
  bodyLg: 16,
  caption: 11,
  subtitle: 18,
  title: 22,
  display: 28,
} as const;

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
    shadowColor: "#6C3CE1",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#6C3CE1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#4A12CE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  hero: {
    shadowColor: "#4A12CE",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

// ─── Subject card gradient configs ───
export const subjectGradients = {
  mathematics: ["#6C3CE1", "#7B44FF"] as [string, string],
  science: ["#00C4A7", "#08B09A"] as [string, string],
  language: ["#FF6B6B", "#FF4F4F"] as [string, string],
  history: ["#F59E0B", "#FFCD5E"] as [string, string],
  logic: ["#9090B8", "#B0B0D0"] as [string, string],
  creative: ["#B0B0D0", "#9090B8"] as [string, string],
} as const;
