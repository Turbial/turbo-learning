// ─── App home palette — single source of truth for home screen UI ────────────
//
// This is intentionally separate from the product/content theme system
// (ThemeContext + themes.ts), which handles per-program color branding.
// This file owns the visual language of the app shell itself.
//
// ┌─────────────────────────────────────────────────────────────┐
// │  To redesign the whole app → change ONE line at the bottom  │
// │    export const appPalette = oceanTheme;                     │
// └─────────────────────────────────────────────────────────────┘

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubjectColors = {
  bg:   string;  // card top-panel background
  glow: string;  // caustic light ring tint (lighter version of bg)
};

export type AppPalette = {
  // Surfaces
  bg:     string;  // screen background
  bgTint: string;  // light tint for tracks, icon bgs, active row highlights
  card:   string;  // white card / surface

  // Accent scale — dark → light
  deep:   string;  // darkest: hero card bg, strong emphasis
  mid:    string;  // primary: buttons, active nav, links
  bright: string;  // highlight: fills on dark surfaces, card shadow colour
  teal:   string;  // secondary accent
  sky:    string;  // tertiary accent

  // Borders & typography
  border: string;
  text:   string;
  muted:  string;
  dim:    string;

  // Hero card
  heroProgressFill: string;  // progress bar fill on dark hero bg
  heroCtaText:      string;  // "Continue →" text on the white CTA button

  // Streak badge (intentionally warm across all themes)
  streakBg:     string;
  streakBorder: string;
  streakText:   string;

  // Per-subject card colours.
  // Indices map to the SUBJECTS array in the screen files:
  //   0 = Mathematics   1 = Science Lab    2 = Language Arts
  //   3 = World History  4 = Logic & Puzzles  5 = Creative Arts
  subjects: SubjectColors[];
};

// ─── Ocean theme — light, fluid, "looking through water" ─────────────────────
export const oceanTheme: AppPalette = {
  bg:     "#F0FDFF",
  bgTint: "#CFFAFE",
  card:   "#FFFFFF",

  deep:   "#0E7490",
  mid:    "#0891B2",
  bright: "#06B6D4",
  teal:   "#14B8A6",
  sky:    "#0EA5E9",
  border: "#BAE6FD",

  text:   "#0F172A",
  muted:  "#64748B",
  dim:    "#94A3B8",

  heroProgressFill: "#A5F3FC",
  heroCtaText:      "#0E7490",

  streakBg:     "#FFF7ED",
  streakBorder: "#FED7AA",
  streakText:   "#EA580C",

  subjects: [
    { bg: "#0891B2", glow: "#38BDF8" }, // Mathematics
    { bg: "#0D9488", glow: "#2DD4BF" }, // Science Lab
    { bg: "#0284C7", glow: "#38BDF8" }, // Language Arts
    { bg: "#0369A1", glow: "#67E8F9" }, // World History
    { bg: "#94A3B8", glow: "#CBD5E1" }, // Logic & Puzzles (locked)
    { bg: "#A8A29E", glow: "#D6D3D1" }, // Creative Arts (locked)
  ],
};

// ─── Violet theme — deep purple, bold contrast ───────────────────────────────
export const violetTheme: AppPalette = {
  bg:     "#FAF8FF",
  bgTint: "#EDE9FE",
  card:   "#FFFFFF",

  deep:   "#4C1D95",
  mid:    "#6C3CE1",
  bright: "#7C3AED",
  teal:   "#8B5CF6",
  sky:    "#A78BFA",
  border: "#DDD6FE",

  text:   "#1E1B4B",
  muted:  "#6B7280",
  dim:    "#9CA3AF",

  heroProgressFill: "#C4B5FD",
  heroCtaText:      "#4C1D95",

  streakBg:     "#FFF7ED",
  streakBorder: "#FED7AA",
  streakText:   "#EA580C",

  subjects: [
    { bg: "#6C3CE1", glow: "#A78BFA" }, // Mathematics
    { bg: "#0D9488", glow: "#2DD4BF" }, // Science Lab
    { bg: "#DC2626", glow: "#FCA5A5" }, // Language Arts
    { bg: "#D97706", glow: "#FCD34D" }, // World History
    { bg: "#94A3B8", glow: "#CBD5E1" }, // Logic & Puzzles (locked)
    { bg: "#A8A29E", glow: "#D6D3D1" }, // Creative Arts (locked)
  ],
};

// ─── Sunrise theme — warm coral + amber ──────────────────────────────────────
export const sunriseTheme: AppPalette = {
  bg:     "#FFFBF5",
  bgTint: "#FEF3C7",
  card:   "#FFFFFF",

  deep:   "#92400E",
  mid:    "#D97706",
  bright: "#F59E0B",
  teal:   "#FBBF24",
  sky:    "#FCD34D",
  border: "#FDE68A",

  text:   "#1C1917",
  muted:  "#78716C",
  dim:    "#A8A29E",

  heroProgressFill: "#FDE68A",
  heroCtaText:      "#92400E",

  streakBg:     "#FFF7ED",
  streakBorder: "#FED7AA",
  streakText:   "#EA580C",

  subjects: [
    { bg: "#D97706", glow: "#FCD34D" }, // Mathematics
    { bg: "#0D9488", glow: "#2DD4BF" }, // Science Lab
    { bg: "#DC2626", glow: "#FCA5A5" }, // Language Arts
    { bg: "#7C3AED", glow: "#C4B5FD" }, // World History
    { bg: "#94A3B8", glow: "#CBD5E1" }, // Logic & Puzzles (locked)
    { bg: "#A8A29E", glow: "#D6D3D1" }, // Creative Arts (locked)
  ],
};

// ─── Active palette ───────────────────────────────────────────────────────────
// ↓ Change this one line to instantly swap the entire home screen look ↓
export const appPalette: AppPalette = oceanTheme;
