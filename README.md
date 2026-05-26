# Turbo Learning — Unified Guided Experience Platform

**Expo (React Native) + Supabase + TypeScript**

A reusable, mobile-first, JSON-driven guided-experience engine. Powers Turbo Academy, Duo, and future guided programs from one codebase.

## Stack

- **App:** Expo (standalone native iOS + Android + web from one codebase)
- **Routing:** Expo Router (file-based)
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Server state:** TanStack Query
- **Session state:** Zustand
- **Audio V1:** expo-speech (native) / Web Speech API (web)

## Project Structure

```
app/ ─── Expo Router routes (native + web)
 _layout.tsx ─── root: providers (Query, theme, auth gate)
 index.tsx ─── redirect → /onboard or /home
 onboard.tsx ─── single-scroll onboarding
 (tabs)/
 home.tsx ─── Journey screen
 progress.tsx ─── XP, badges, streak
 lesson/[id].tsx ─── Lesson Player
 complete/[unitId].tsx ─── Unit Complete

src/
 engine/ ─── product-agnostic core
 types.ts ─── Step discriminated union
 stepRegistry.ts ─── type → { component, validate, score, behavior }
 LessonPlayer.tsx ─── generic progression driver
 lessonMachine.ts ─── pure state transitions
 scoring.ts ─── XP and level rules
 narration/ ─── audio abstraction
 components/steps/ ─── one component per step type
 data/ ─── Supabase client + queries
 store/ ─── Zustand stores
 content/ ─── local JSON lessons (dev)
 theme/ ─── design tokens
```

## Getting Started

```bash
npm install
npx expo start
# Press 'w' for web, 'i' for iOS simulator, 'a' for Android
```

## Build Milestones

| # | Milestone | Status |
|---|-----------|--------|
| M0 | Architecture + schema sign-off | ✅ Architecture locked |
| M1 | App shell + auth + content loading | 🚧 In progress |
| M2 | Step renderer + 12 core step types | 🚧 In progress |
| M3 | Gamification foundation | 🔜 |
| M4 | Full step catalog + onboarding polish | 🔜 |
| M5 | Audio V1 | 🔜 |
| M6 | Retention plumbing | 🔜 |
| M7 | Multi-program + later features | 🔜 |
