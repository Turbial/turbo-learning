# M1 Smoke Test Checklist

**Goal:** Verify the wiring works — onboard → home → lesson player → complete → back to journey — before stacking M2+ components.

## Prerequisites

- [ ] Supabase project exists and is accessible
- [ ] `0001_schema.sql` applied (via Supabase SQL Editor or CLI)
- [ ] `0002_seed_ai_operator.sql` applied
- [ ] `0003_complete_lesson.sql` applied
- [ ] Anonymous sign-in enabled (Auth → Settings → Enable Anonymous Sign-ins = ON)
- [ ] `.env.local` created with:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
  ```

## Test Steps

### 1. App boots
- [ ] `npx expo start` runs without errors
- [ ] Press `w` → web opens in browser
- [ ] App shows onboarding screen (Welcome to Turbo Academy)

### 2. Onboarding flow
- [ ] Tap "Get Started" → name input appears
- [ ] Enter name, tap Continue → goal selector appears
- [ ] Select a goal, tap Continue → daily commitment appears
- [ ] Select time + minutes, tap "Start Learning"
- [ ] Redirects to Journey (Home) screen

### 3. Journey screen
- [ ] Shows "AI Operator" header with stats row (Day 0, XP 0, 🔥 0)
- [ ] 4 weeks visible (Week 1 "Foundation" through Week 4 "Launch")
- [ ] Day 1 shows "▶ Continue" badge (current day)
- [ ] Days 2–28 show 🔒 (locked)

### 4. Lesson Player — Day 1
- [ ] Tap Day 1 → lesson player opens
- [ ] Progress bar visible at top (0%)
- [ ] **Step 1 (info):** Shows "Welcome to Day 1" + auto-plays TTS (if supported)
- [ ] **Step 2 (highlight):** Shows body with yellow-highlighted phrases
- [ ] **Step 3 (mc):** Shows question + 4 options, tap one, "Check Answer" → feedback appears, auto-advances
- [ ] **Step 4 (scenario_card):** Shows "The Real Job Impact" scenario card
- [ ] **Step 5 (tf):** True/False question, tap answer → feedback
- [ ] **Step 6 (info):** "Three Layers" info card
- [ ] **Step 7 (good_fit):** Good Fit / Not Ideal judgment → feedback
- [ ] **Step 8 (example):** Shows Sarah example
- [ ] **Step 9 (highlight):** Operator mindset text with highlights
- [ ] **Step 10 (reflection):** Two text fields, fill both, tap "Save Reflection"
- [ ] **Step 11 (completion):** Shows "Day 1 Complete!" with XP tally + score
- [ ] Progress bar reaches ~100%

### 5. Back navigation
- [ ] "← Back" visible on steps after step 1
- [ ] Tapping back returns to previous step
- [ ] Tapping back from step 1 does nothing

### 6. Completion screen
- [ ] Redirects to `/complete/day1` with XP and score params
- [ ] Shows celebration + XP earned + score %
- [ ] Shows "Streak started!" card
- [ ] "Continue Journey" → returns to Home
- [ ] "View Progress" → opens Progress tab

### 7. Progress screen
- [ ] Shows Level 1 with XP bar (should show progress from Day 1)
- [ ] Streak section shows "1 day" (if streak was recorded)
- [ ] Badges section shows "First Steps" badge (if badge was awarded)

### 8. Edge cases
- [ ] Unknown step types render FallbackStep (no crash)
- [ ] Browser back button works correctly across lesson steps
- [ ] Page refresh mid-lesson restarts lesson (M1 behavior — state isn't persisted yet)
- [ ] Tapping locked days does nothing

## Sign-off Criteria

All checkboxes above must pass on both web and at least one native platform (iOS simulator or Android emulator). File bugs as GitHub issues, tag `M1-smoke`.

## Known Limitations (M1 — not bugs)

- Step responses are not persisted to Supabase (local-only until M3)
- Streak/XPG/badge updates are client-side only (Supabase RPC not yet wired)
- No offline support (offline queue exists but isn't flushed yet)
- Audio uses browser TTS (robot-y; MP3 in M5)
- Locked days 2–28 are placeholders (content to be authored)
