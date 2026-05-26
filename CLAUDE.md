# CLAUDE.md — Turbo Learning

## Project Identity
- **Name:** Turbo Learning — Unified Guided Experience Platform
- **Stack:** Expo (React Native) + Supabase + TypeScript
- **Owner:** Turbile CEO (Builder)
- **Repo:** github.com/Turbial/turbo-learning

## Architecture
- Expo Router (file-based routing, native + web)
- Step Renderer pattern: discriminated union `Step` types → `stepRegistry` → `LessonPlayer`
- Adding a step type = add component + registry entry; LessonPlayer never changes
- Content is JSON; local JSON files during dev (M1–M2), Supabase in M3+
- Theme tokens single source of truth: `src/theme/tokens.ts`
- TTS via expo-speech (native) / Web Speech API (web)

## Commands
```bash
npm run start  # expo start
npm run web    # web only
npm run ios    # iOS simulator (macOS required)
npm run android # Android emulator
npx expo build:web   # production web build
```

## Key Patterns
1. All step components receive `StepProps` from stepRegistry
2. Engine is product-agnostic — labels come from program config
3. Offline-first: Zustand session store + offline queue → Supabase on completion
4. Build against local JSON first; Supabase integration is Phase 2

## Phase 0 Doc
Full architecture spec at the project root (Phase0_Architecture_Handoff.md)
