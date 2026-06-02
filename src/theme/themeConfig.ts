// ─── DESIGN CONFIG ─────────────────────────────────────────────────────────────
//
//   ┌─────────────────────────────────────────────────────────────────────────┐
//   │  This is the ONLY file you need to edit to restyle the entire app.     │
//   │  Every screen, card, button, and text block reads from this config.    │
//   └─────────────────────────────────────────────────────────────────────────┘
//
// After changing any value here, Metro will hot-reload the app automatically.

export type PaletteName = "ocean" | "violet" | "sunrise";
export type RadiusMode  = "sharp" | "rounded" | "soft";
export type DensityMode = "compact" | "comfortable";

const themeConfig = {
  /**
   * Color palette.
   *   "ocean"   — light aqua/teal, fluid and modern  ← current
   *   "violet"  — deep purple, bold and premium
   *   "sunrise" — warm amber/coral, energetic
   */
  palette: "ocean" as PaletteName,

  /**
   * Global font-size multiplier.
   *   1.0 = default  |  1.1 = 10 % larger  |  0.9 = 10 % smaller
   */
  fontScale: 1.0,

  /**
   * Corner-radius style.
   *   "sharp"   — tight corners (4–12 px), business-like
   *   "rounded" — comfortable modern (8–28 px)          ← current
   *   "soft"    — very round, friendly (14–42 px)
   */
  radiusMode: "rounded" as RadiusMode,

  /**
   * Vertical spacing / density.
   *   "compact"     — tighter padding, more content visible
   *   "comfortable" — breathing room                    ← current
   */
  density: "comfortable" as DensityMode,
};

export default themeConfig;
