# UI System Spec — Tokens, Primitives, Per-Product Theming

UI is a **system decided now**, not polish deferred to the end. The principle: **tokens are to the look what the registry is to the function** — the one layer that lets a single engine wear many faces. Build components token-driven from the start, or pay re-theming debt across every component later.

## The model: two kinds of token
- **Structural tokens** (shared by all products): spacing, radius, type scale, motion, sizing. Live in `theme/tokens.ts` as plain exports; components import them directly.
- **Color tokens** (themed per product): `ColorScale` — background, surface, surfaceAlt, border, text, textMuted, accent, accentText, accentSoft, success, error. Each product defines a light + dark `ColorScale`.

A **Theme = a product's color palette.** Structural tokens stay constant so every product feels coherent and built by the same hand; only color changes per product.

## Per-product theming (the strategic payoff)
A product is a **theme object, not a fork.** `theme/themes.ts` defines one per product — `ai_for_everyone` (warm/friendly), `ai_operator` (sharp/premium), `duo` (soft/relational), `filmassist` (cinematic), `creditsmith` (financial/trust). The active theme is chosen by the **enrolled program's slug**:

```tsx
// app/_layout.tsx
<ThemeProvider theme={themeForSlug(programSlug)}>
  {/* app */}
</ThemeProvider>
```

Components read color via `useTheme().colors`; OS light/dark is resolved automatically. Same components, different tokens → distinct identity, shared engine. This is the visual half of the universal-platform goal.

## Primitive catalog
Steps and widgets **compose primitives** — they never write raw styles or hardcode a color. Reference implementations included: `Button`, `Card`, `Field`.

| Primitive | Purpose | Key props | Tokens used |
|---|---|---|---|
| `Button` | actions | `title, onPress, variant(primary/secondary/ghost), disabled` | accent, accentText, radius.lg, sizing.buttonHeight |
| `Card` | surfaces / panels | `tinted, style, children` | surface/accentSoft, border, radius.lg, spacing |
| `Field` | text input | `value, onChangeText, placeholder, multiline` | border, surface, text, radius.md, sizing |
| `ProgressBar` | progress | `value, max` | accent, surfaceAlt, radius.pill | *(build in M2A)* |
| `Chip` / `Pill` | tags, options, XP | `label, selected` | accent, border, radius.pill | *(build in M2A)* |
| `XpPill` | XP display + count-up | `xp` | accent, accentSoft | *(build in M2A)* |

## Motion (the "journey" feel)
Micro-interactions — XP bursts, streak fire, badge reveals, step transitions — use the `motion` duration tokens, not magic numbers. **Always gate non-essential motion behind reduced-motion** (`useTheme().reduceMotion`, sourced from the OS): when on, animations degrade to a simple fade. XP burst ≈ `motion.duration.xpBurst`; step/screen transitions ≈ `base`.

## Accessibility (enforced at the primitive level so everything inherits it)
- **Transcripts** ship with all audio → captioned by default.
- **Tap targets ≥ 44pt** (`sizing.tapTargetMin`); buttons ≥ 48.
- **Dynamic type** respected; reading column ≤ ~640px on web.
- **Screen-reader labels** + `accessibilityRole` on every interactive element (the primitives already set these).
- **Contrast**: themed color pairs (text on surface, accentText on accent) chosen to meet AA. Re-check any new palette.

## The rules (what keeps theming cheap)
1. **No hardcoded colors in components.** Color comes from `useTheme()`. The reference step components currently inline `#F97316` — that's the first thing the refactor removes.
2. **Compose primitives, not raw styles.** New steps/widgets use `Button`/`Card`/`Field`/etc.
3. **Structural values come from tokens**, never literals (`radius.lg`, not `16`).
4. **Theme over branching.** No `if (product === 'duo')` styling — the look is the active token set.
5. **Light first, dark defined.** Each theme ships both; OS preference decides. Ship/verify light; dark follows.

## Refactor plan (opening move of M2A — does NOT block Day 1)
Day 1 may run on the current placeholder styling. The design pass is then:
- [ ] Land `theme/tokens.ts`, `theme/themes.ts`, `theme/ThemeContext.tsx`.
- [ ] Build the primitive set (`Button`, `Card`, `Field`, `ProgressBar`, `Chip`, `XpPill`).
- [ ] Wrap the app in `ThemeProvider` keyed to the enrolled program.
- [ ] Refactor the 13 step components + reference widgets off inline styles / hardcoded `#F97316` onto primitives + `useTheme()`.
- [ ] Add motion tokens + reduced-motion to XP/streak/badge animations.
Do this **before** the component count grows — cheap at 13 components, expensive at 40.

## Don't overbuild
Themes are **objects in code**. No theme-editor UI, no runtime palette builder — that's a someday feature. Structural tokens are global for MVP; a product can override structural personality (e.g. rounder radius for Duo) later by extending `Theme`, kept backward-compatible. Same discipline as everywhere: extend deliberately, never mutate the shape under existing components.
