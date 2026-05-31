# Turbo Learning — QA Test Plan

**Product:** Turbo Learning (turbo-learning)  
**URL:** http://178.105.166.126:3092  
**GitHub:** github.com/Turbial/turbo-learning  
**Stack:** React Native Web (Expo) + Supabase  
**Date:** 2026-05-30 (revised — Session 2)  

---

## Test Environment Setup

### Prerequisites
- A modern browser (Chrome/Firefox/Edge latest)
- A valid email address (for registration testing)
- Incognito/private window recommended for fresh user tests

### Test Accounts
| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Fresh user | Create during test | 6+ chars | Registration + onboarding + first lesson |
| Returning user | Use from previous session | 6+ chars | Login + continuing progress + resume |

---

## TC-01: Registration

**Prerequisites:** Clear browser cookies/cache, or use incognito window.

### Steps
1. Navigate to `http://178.105.166.126:3092`
2. Verify the page redirects to `/auth/login`
3. Click "New here? Create an account" link
4. Enter a test name (2+ characters)
5. Enter a unique test email (`qa-test-{timestamp}@example.com`)
6. Enter a password (6+ characters)  
7. Click "Create account"

### Expected Results
- [ ] Field widths capped at ~420px, centered on screen
- [ ] Email validation works (rejects invalid emails)
- [ ] Password validation works (rejects < 6 chars)
- [ ] Name validation works (rejects < 2 chars)
- [ ] On success: shows "Check your email" confirmation screen
- [ ] If email already registered: shows "An account with this email already exists" error (not fake confirmation screen)
- [ ] If rate-limited: shows "Too many signup attempts. Please wait a minute" (not raw "email rate limit exceeded")
- [ ] Email verification link redirects to the live app (not localhost — no timeout)

---

## TC-02: Onboarding Flow

**Prerequisites:** Freshly registered + verified account.

### Steps
1. After registration, you land on Welcome screen ("Welcome to Turbo Academy")
2. Click "Get Started"
3. Enter a name in "What should we call you?" → Click Continue
4. Select a goal (tap one of the 5 options: ⚡ Automate my work, 📈 Advance my career, 🚀 Start an AI business, 🧠 Understand AI better, 🏗️ Build AI systems)
5. Click Continue
6. Select daily minutes (5, 10, 15, 20, or 30) AND learning time (Morning, Afternoon, Evening, Night)
7. Click "Start Learning"

### Expected Results
- [ ] All 4 onboarding steps render with emoji icons
- [ ] Progress dots at bottom update (4 dots, fills as you progress)
- [ ] Name field requires at least 1 character (button disabled until filled)
- [ ] Goal selection requires a choice (button disabled until selected)
- [ ] "Start Learning" redirects to the Journey tab
- [ ] Journey tab shows "AI Operator" program

### Regression — Returning Users
- [ ] Log out → Log back in → Goes **straight to Home** (skips onboarding entirely)
- [ ] No flashing of the 4 onboarding steps for returning users

---

## TC-03: Login + Session Persistence

**Prerequisites:** Account created in TC-01.

### Steps
1. Sign out (Profile tab → Sign out)
2. Verify you're redirected to login page
3. Enter the test email + password
4. Click "Sign in"

### Expected Results
- [ ] Login form is centered, fields at ~420px max width
- [ ] Login succeeds and redirects to Home (not onboarding) for returning users
- [ ] Previously completed days show as ✅ (green/done state)
- [ ] XP and streak persist from previous session

---

## TC-04: Day 1 Lesson — Complete Flow

**Prerequisites:** Logged in, on Journey tab.

### Steps
1. Tap Day 1 ("What AI Actually Is" or similar title)
2. Step through each step in the lesson:
   - **Info steps:** Read text → narration does NOT auto-play → press ▶ to start → press ⏸ to pause → tap speed (0.8x, 1x, 1.5x, 2x)
   - **Highlight steps:** Same narration behavior as InfoStep (no auto-play)
   - **MC question:** Select an answer → "Check Answer" → verify feedback appears → tap "Continue →" to advance (not auto-advancing)
   - **True/False:** Select True or False → feedback appears → tap "Continue →"
   - **Good Fit:** Select judgment → feedback appears → tap "Continue →" (not auto-advancing)
   - **Fill in the Blank:** Type answer → "Check Answer" → verify feedback
   - **Scenario cards:** Read and tap primary button
   - **Builder:** Fill all fields → click "Build It"
   - **Reflection:** Write in text areas → click "Save Reflection"
   - **Completion step:** View completion summary
3. On completion screen, verify:
   - XP counter animates
   - Score percentage displays
   - Streak card shows
   - Badge unlock dialog for "First Steps"
   - "Continue Journey" button works
4. Click "Continue Journey"

### Expected Results
- [ ] All step types render without errors
- [ ] **Audio does NOT auto-play** on lesson load (user must press ▶)
- [ ] **Speed change works while audio is playing** (tap 1.5x during playback → audio speeds up)
- [ ] Progress bar at top fills as you advance (green bar)
- [ ] ← Back button works after step 2
- [ ] "Continue →" appears after answering interactive steps (no auto-advance)
- [ ] **Wrong answer shows correct ✗ feedback** (not "Correct" text next to ✗ icon)
- [ ] No "Cannot read properties of undefined" errors
- [ ] Completion screen shows XP earned, score, streak

### Regression — XP
- [ ] **XP earned per answer shows on Journey/Progress/Dashboard immediately** (not just at lesson end)
- [ ] **Going back and re-answering same question does NOT duplicate XP** (no farming)
- [ ] Level updates correctly with XP accumulation

---

## TC-05: Mid-Lesson Resume

**Prerequisites:** Started a lesson (TC-04) but didn't finish — left mid-way.

### Steps
1. Start a lesson, answer 2-3 steps, then press 🏠 Home
2. Verify Journey shows ▶ Continue on that day
3. Tap ▶ Continue on that day
4. Verify you resume at the step you left off
5. Refresh the browser mid-lesson
6. Verify you resume at the same step

### Expected Results
- [ ] **Resume works after navigating away** (not back to "Welcome to Day 1")
- [ ] **Resume works after page refresh** (step index, XP, combo streak all preserved)
- [ ] **Pressing 🏠 Home clears the resume state** (next visit starts fresh)
- [ ] **Lesson completion clears the resume state** automatically

---

## TC-06: Progress Tab Verification

**Prerequisites:** Completed Day 1 (TC-04).

### Steps
1. Tap the "Progress" tab (📊)
2. Verify displayed stats

### Expected Results
- [ ] Shows Level (should be Level 1–2 if Day 1 completed)
- [ ] Shows XP total (should reflect mid-lesson XP if earned during TC-05)
- [ ] Shows streak count (🔥 emoji)
- [ ] Badges section shows earned badges
- [ ] Shield count displayed
- [ ] "Get Shield" button present

---

## TC-07: Leaderboard

**Prerequisites:** Logged in with progress.

### Steps
1. Tap the "Ranks" tab (🏆)
2. Switch between 🌍 Global and 👥 Friends tabs
3. Scroll through the leaderboard

### Expected Results
- [ ] Leaderboard renders without errors
- [ ] Test user appears in the list
- [ ] XP values displayed correctly
- [ ] Podium (top 3) renders with 🥇🥈🥉
- [ ] Current user row highlighted
- [ ] **Error state shows "Check your connection and try again later"** (not misleading "Pull to retry")

---

## TC-08: Dashboard Tab

**Prerequisites:** Logged in with progress.

### Steps
1. Tap the "Dashboard" tab (📋)
2. Verify all widgets render

### Expected Results
- [ ] Level + XP header card visible
- [ ] Streak fire icon visible
- [ ] "Start today's lesson" button
- [ ] 28-day grid renders
- [ ] Completed days highlighted
- [ ] Current day highlighted with border
- [ ] Progress ring shows completion percentage

---

## TC-09: Week Locking

**Prerequisites:** Completed Day 1 only.

### Steps
1. On Journey tab, scroll to Week 1
2. Verify: Day 1 = done (✅), Day 2 = current (▶), Days 3-7 = locked (🔒)
3. Scroll to Week 2
4. Verify: Day 8 is locked (🔒), not "current"

### Expected Results
- [ ] Day 2 shows as "current" after Day 1 done
- [ ] Days 8, 15, 22 show as locked until previous week's last day is completed
- [ ] Locked days are not tappable (no response on tap)
- [ ] Week headers display correctly

---

## TC-10: Profile Tab

**Prerequisites:** Logged in.

### Steps
1. Tap the "Profile" tab (👤)
2. Edit name field → click "Save changes"
3. Edit learning goal → click "Save changes"
4. Verify onboarding selections appear as read-only
5. Click "Get Shield"
6. Click "Sign out"

### Expected Results
- [ ] Avatar displays (shows initial letter if no avatar set)
- [ ] Name, level, XP displayed
- [ ] **Onboarding selections shown as read-only:**
  - "🎯 Main goal: [emoji] [label]"
  - "⏱️ Daily commitment: [N] min · [Morning/Afternoon/Evening/Night]"
- [ ] Streak shield card visible with count
- [ ] Badges section shows earned badges
- [ ] "Save changes" works with success toast
- [ ] **"Get Shield" works** (no "null value in column shield_type" error)
- [ ] **"Sign out" works → redirects to login** (previously hidden — Profile tab didn't exist in nav)

---

## TC-11: Pricing + Checkout

**Prerequisites:** Logged in.

### Steps
1. Navigate to `/pricing`
2. Verify both Free and Pro plans display
3. Click "Upgrade" on Pro plan
4. Verify checkout page renders
5. Click "Pay with Card"

### Expected Results
- [ ] Free plan card visible with features
- [ ] Pro plan card with "$9.99/mo" and features
- [ ] Checkout page renders with plan name + price
- [ ] Stripe redirects to hosted checkout (or appropriate error if keys incomplete)
- [ ] Cancel button returns to pricing page

---

## TC-12: Forgot Password

**Prerequisites:** Registered email.

### Steps
1. Navigate to `/auth/login`
2. Click "Forgot password?" link
3. Enter registered email address
4. Click "Send reset link"

### Expected Results
- [ ] Shows "Reset your password" title
- [ ] After submit, shows confirmation message
- [ ] "Back to sign in" link works
- [ ] Reset link redirects to the live app (not localhost)
- [ ] Password reset completes successfully

---

## TC-13: Error Handling + Edge Cases

### Steps

**Invalid auth:**
1. Try logging in with wrong password → Error message displays
2. Try registering with existing email → Shows "An account with this email already exists. Sign in instead."
3. Try registering with name < 2 characters → Validation error
4. Try registering with password < 6 characters → Validation error
5. Rapid re-registration → Shows "Too many signup attempts. Please wait a minute"

**Empty states:**
6. Fresh account with no progress → Journey shows Day 1 as current, rest locked
7. Progress tab with no data → Shows Level 1, 0 XP, no badges
8. Leaderboard with no data → Shows trophy emoji, "No rankings yet"
9. Leaderboard error → Shows ⚠️ "Check your connection and try again later"

**Back navigation:**
10. During a lesson, tap ← Back on step 3+ → Returns to previous step
11. From lesson, tap 🏠 → Returns to Journey (and clears resume state)

**Speed change while audio playing:**
12. On Info/Highlight step, press ▶ to play audio → tap 1.5x speed → audio speeds up immediately

### Expected Results
- [ ] All validation errors display user-friendly messages (not raw Supabase errors)
- [ ] No white screens or crashes on edge cases
- [ ] Back navigation works correctly
- [ ] Home button in lesson returns to Journey

---

## TC-14: Cross-Browser Verification

**Prerequisites:** Test account available.

### Steps
1. Run TC-01 through TC-04 on each browser:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (if macOS available)
   - Mobile Chrome (responsive view / device)

### Expected Results
- [ ] All pages render correctly on each browser
- [ ] Forms submit correctly on each browser
- [ ] No layout breaks or visual glitches
- [ ] Audio/speech works on supported browsers

---

## Bug Regression Checklist (Session 2 Fixes)

These are fixed in this session — verify they stay fixed:

| # | Bug Description | Test | Verified? |
|---|----------------|------|-----------|
| B1 | Login/register fields too wide on web | TC-01, TC-03: fields capped at 420px, centered | ☐ |
| B2 | Auth forms not centered on page | TC-01, TC-03: forms centered horizontally | ☐ |
| B3 | Email verification link timed out | TC-01: verify link redirects to live app | ☐ |
| B4 | Duplicate email shows "Check your email" instead of error | TC-13: shows "already exists" message | ☐ |
| B5 | Email rate limit shows raw error message | TC-13: shows friendly "wait a minute" message | ☐ |
| B6 | Leaderboard says "Pull to retry" (no pull-to-refresh) | TC-07: shows "Check your connection" instead | ☐ |
| B7 | Lesson audio auto-plays on page load | TC-04: no auto-play, user presses ▶ | ☐ |
| B8 | Speed change doesn't work while audio playing | TC-13: speed changes immediately mid-playback | ☐ |
| B9 | Wrong MC answer shows "Correct" text next to ✗ | TC-04: shows correct wrong-answer feedback | ☐ |
| B10 | Auto-advance after answering (user can't read feedback) | TC-04: "Continue →" button appears, no auto-skip | ☐ |
| B11 | Page refresh mid-lesson resets to Day 1 | TC-05: resumes at same step | ☐ |
| B12 | No logout button / no Profile tab | TC-10: Profile tab (👤) in bottom nav with Sign out | ☐ |
| B13 | XP only commits at lesson end (not visible mid-lesson) | TC-04: XP visible on Journey/Progress immediately | ☐ |
| B14 | Re-answering same question duplicates XP | TC-04: going back and re-answering = 0 XP | ☐ |
| B15 | "Continue" goes to Day 1 instead of resuming | TC-05: resume works via Continue button | ☐ |
| B16 | Logout+relogin shows onboarding every time | TC-02 regression: returning users skip onboarding | ☐ |
| B17 | "Get Shield" fails with shield_type not-null error | TC-10: Get Shield works, shield count increments | ☐ |

---

## Test Completion Criteria

- **Critical (6):** TC-01, TC-02, TC-03, TC-04, TC-05, TC-13 — 100% pass required
- **High (5):** TC-06, TC-07, TC-08, TC-10, TC-12 — 100% pass required
- **Medium (3):** TC-09, TC-11, TC-14 — 90% pass required
- **Regression (17):** B1–B17 — 100% pass required (all previously fixed bugs)

---

## Reporting Issues

For each bug found:
1. **Bug ID:** e.g., B18
2. **Test Case ID:** Which TC step failed
3. **URL:** Full URL where it happened
4. **Steps to reproduce:** Exact actions
5. **Expected:** What should happen
6. **Actual:** What happened (attach screenshots)
7. **Browser + Version:** e.g., Chrome 132
8. **Console errors:** DevTools (F12) → Console tab → copy any red errors

---

## Contact

- **Developer:** Turbo CEO
- **Repo:** github.com/Turbial/turbo-learning
- **Slack:** #turboceo
- **Server:** 178.105.166.126 (Hetzner)
- **Database:** Supabase project `afgmlkduuapquqkcqdsk`
