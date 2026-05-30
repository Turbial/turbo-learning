# Turbo Learning — QA Test Plan

**Product:** Turbo Learning (turbo-learning)  
**URL:** http://178.105.166.126:3092  
**GitHub:** github.com/Turbial/turbo-learning  
**Stack:** React Native Web (Expo) + Supabase  
**Date:** 2026-05-30  

---

## Test Environment Setup

### Prerequisites
- A modern browser (Chrome/Firefox/Edge latest)
- A valid email address (for registration testing)
- Test plan ID: use **TS-XXXX** format for each test case logged

### Test Accounts
| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Fresh user | Create during test | 6+ chars | Registration + onboarding + first lesson |
| Returning user | Create during test | 6+ chars | Login + continuing progress |
| Premium test | TBD (contact dev) | — | Subscription feature testing |

---

## TC-01: Landing Page + Registration

**Prerequisites:** Clear browser cookies/cache, or use incognito window.

### Steps
1. Navigate to `http://178.105.166.126:3092`
2. Verify the page redirects to `/auth/login`
3. Click "Create your account" link (or navigate to `/auth/register`)
4. Enter a test name (2+ characters)
5. Enter a unique test email (`qa-test-{timestamp}@example.com`)
6. Enter a password (6+ characters)  
7. Click "Create account"

### Expected Results
- [ ] Redirects to onboarding screen (`/onboard`) immediately
- [ ] Does NOT skip to home screen (Bug #1 fix verification)
- [ ] If email confirmation is enabled, shows "Check your email" message

---

## TC-02: Onboarding Flow

**Prerequisites:** Freshly registered account (from TC-01).

### Steps
1. After registration, you land on Welcome screen ("Welcome to Turbo Academy")
2. Click "Get Started"
3. Enter a name in "What should we call you?" → Click Continue
4. Select a goal (tap one of the 5 options: Automate my work, Advance my career, etc.)
5. Click Continue
6. Select daily minutes (5, 10, 15, 20, or 30) AND learning time (Morning, Afternoon, Evening, Night)
7. Click "Start Learning"

### Expected Results
- [ ] All 4 onboarding steps render with emoji icons
- [ ] Progress dots at bottom update (4 dots, fills as you progress)
- [ ] Name field requires at least 1 character
- [ ] Goal selection requires a choice (button disabled until selected)
- [ ] "Start Learning" redirects to the Journey tab
- [ ] Journey tab shows "AI Operator" program with 28-day grid

---

## TC-03: Login + Session Persistence

**Prerequisites:** Account created in TC-01.

### Steps
1. Click the Settings tab → "Sign out"
2. Verify you're redirected to login page
3. Enter the test email + password
4. Click "Sign in"

### Expected Results
- [ ] Login succeeds and redirects to onboarding (first time) or home (returning)
- [ ] Previously completed days show as ✅ (green/done state)
- [ ] XP and streak persist from previous session

---

## TC-04: Day 1 Lesson — Complete Flow

**Prerequisites:** Logged in, on Journey tab.

### Steps
1. Tap Day 1 ("What AI Actually Is" or similar title)
2. Step through each step in the lesson:
   - Info steps: Read and tap "Continue"
   - Scenario cards: Read and tap primary button
   - MC question: Select an answer → verify feedback appears → auto-advances
   - True/False: Select True or False → verify feedback → tap Continue
   - Good Fit: Select judgment → verify auto-advance
   - Fill in the Blank: Type answer → verify feedback
   - Builder: Fill all fields → click "Build It"
   - Reflection: Write in text areas → click "Save Reflection"
   - Completion: See XP tally
3. On completion screen, verify:
   - XP counter animates
   - Score percentage displays
   - Streak card shows
   - "Continue Journey" button works
4. Click "Continue Journey"

### Expected Results
- [ ] All step types render without errors
- [ ] Progress bar at top fills as you advance (green bar, 4px tall)
- [ ] ← Back button works after step 2
- [ ] "Continue →" appears after answering interactive steps
- [ ] No "Cannot read properties of undefined" errors (Bug fix verification)
- [ ] Completion screen shows XP earned, score, streak
- [ ] Badge unlock dialog appears for "First Steps" badge
- [ ] Redirected to Journey tab

---

## TC-05: Progress Tab Verification

**Prerequisites:** Completed Day 1 (TC-04).

### Steps
1. Tap the "Progress" tab (📊)
2. Verify displayed stats

### Expected Results
- [ ] Shows Level (should be Level 1 if Day 1 completed)
- [ ] Shows XP total (~71 XP from Day 1)
- [ ] Shows streak count (fire emoji)
- [ ] Shows badges earned ("First Steps" badge visible)
- [ ] Shield count displayed
- [ ] "Get Shield" button present

---

## TC-06: Leaderboard

**Prerequisites:** Logged in with progress.

### Steps
1. Tap the "Ranks" tab (🏆)
2. Scroll through the leaderboard

### Expected Results
- [ ] Leaderboard renders without errors
- [ ] Test user appears in the list (if other users exist)
- [ ] XP values displayed correctly
- [ ] Levels displayed

---

## TC-07: Dashboard Tab

**Prerequisites:** Logged in with progress.

### Steps
1. Tap the "Dashboard" tab (📋)
2. Verify all widgets render

### Expected Results
- [ ] Level + XP header card visible
- [ ] Streak fire icon visible
- [ ] "Start today's lesson" button (shows correct current day)
- [ ] 28-day grid renders (28 squares)
- [ ] Completed days highlighted in green
- [ ] Current day highlighted with border
- [ ] Progress ring circle shows completion percentage
- [ ] Day streak count displayed

---

## TC-08: Week Locking (Bug #2 Verification)

**Prerequisites:** Completed Day 1 only.

### Steps
1. On Journey tab, scroll to Week 1
2. Verify: Day 1 = done (✅), Day 2 = current (▶), Days 3-7 = locked (🔒)
3. Scroll to Week 2
4. Verify: Day 8 is locked (🔒), not "current"

### Expected Results
- [ ] Day 2 shows as "current" after Day 1 done
- [ ] Days 8, 15, 22 show as locked until previous week's last day is completed
- [ ] Locked days are not tappable
- [ ] Week headers display correctly (Week 1: Foundation, Week 2: Automation, etc.)

---

## TC-09: Pricing Page + Plan Display

**Prerequisites:** Logged in.

### Steps
1. Navigate to `http://178.105.166.126:3092/pricing`
2. Verify both plans display

### Expected Results
- [ ] Free plan card visible: "Free", with features list
- [ ] Pro plan card visible: "Pro", "$9.99/mo", with features list
- [ ] Free plan shows "Get started" button
- [ ] Pro plan shows "Upgrade" button
- [ ] No loading errors or blank cards
- [ ] Plan data loaded from Supabase (not hardcoded)

---

## TC-10: Checkout Flow (Stripe)

**Prerequisites:** Logged in.

### Steps
1. Navigate to `/pricing`
2. Click "Upgrade" on the Pro plan
3. Verify the checkout selection screen appears
4. Verify "💳 Credit / Debit Card" option shows
5. Verify "🅿️ PayPal" option shows (if PayPal keys configured)
6. Click "Pay with Card"

### Expected Results
- [ ] Checkout page renders with plan name + price
- [ ] "Pay with Card" button is clickable
- [ ] Stripe redirects to hosted checkout page (or shows auth error if not logged in with valid token)
- [ ] Cancel button returns to pricing page
- [ ] Error messages display if something fails

---

## TC-11: Profile Page

**Prerequisites:** Logged in.

### Steps
1. Navigate to `/profile/index`
2. Edit name field → click "Save changes"
3. Verify the profile updates

### Expected Results
- [ ] Avatar displays (shows initial if no avatar set)
- [ ] Name, level, XP displayed
- [ ] Streak shield card visible with count
- [ ] Badges section shows earned badges
- [ ] "Save changes" works and shows success toast
- [ ] "Get Shield" button present (clickable)

---

## TC-12: Settings + Sign Out

**Prerequisites:** Logged in.

### Steps
1. Navigate to `/profile/settings`
2. Toggle "Daily reminders" switch
3. Select a reminder time (Morning, Afternoon, Evening)
4. Click "Sign out"

### Expected Results
- [ ] Notification toggle switches states
- [ ] Time slot selection highlights selected option
- [ ] Sign out works → redirects to login page
- [ ] After sign out, protected routes redirect to login

---

## TC-13: Forgot Password

**Prerequisites:** Registered email.

### Steps
1. Navigate to `/auth/login`
2. Click "Forgot password" link
3. Enter registered email address
4. Click "Send reset link"

### Expected Results
- [ ] Shows "Reset your password" title
- [ ] After submit, shows confirmation message
- [ ] "Back to sign in" link works
- [ ] If email sending is configured, email arrives with reset link

---

## TC-14: Error Handling + Edge Cases

### Steps

**Invalid auth:**
1. Try logging in with wrong password → Error message displays
2. Try registering with existing email → Error message displays
3. Try registering with name < 2 characters → Validation error
4. Try registering with password < 6 characters → Validation error

**Empty states:**
5. Fresh account with no progress → Journey shows Day 1 as current, rest locked
6. Progress tab with no data → Shows Level 1, 0 XP, no badges

**Back navigation:**
7. During a lesson, tap ← Back on step 3+ → Returns to previous step
8. From lesson, tap 🏠 icon → Returns to Journey tab

**Refresh persistence:**
9. Mid-lesson, refresh the page → Auth session persists, returns to lesson (may restart)

### Expected Results
- [ ] All validation errors display user-friendly messages
- [ ] No white screens or crashes on edge cases
- [ ] Back navigation works correctly
- [ ] Home button in lesson returns to Journey

---

## TC-15: Programs Catalog

**Prerequisites:** Logged in.

### Steps
1. Navigate to `/programs/index`
2. Verify program cards display

### Expected Results
- [ ] "AI Operator" program card visible
- [ ] "DUO" program card visible (if active)
- [ ] Enroll/Continue button on each card
- [ ] Enrolling switches button to "Continue"

---

## TC-16: Cross-Browser Verification

**Prerequisites:** Test account available.

### Steps
1. Run TC-01 through TC-04 on each browser:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (if macOS available)
   - Mobile Chrome (responsive view)

### Expected Results
- [ ] All pages render correctly on each browser
- [ ] Forms submit correctly on each browser
- [ ] No layout breaks or visual glitches

---

## Bug Regression Checklist

These are previously fixed bugs — verify they stay fixed:

| Bug | Test | Status |
|-----|------|--------|
| BuilderStep crash (missing fields) | TC-04: Builder step in Day 3 lesson | ☐ |
| Onboarding bypass | TC-01: After register, goes to /onboard, not /home | ☐ |
| Days 8/15/22 unlocked | TC-08: Week 2 Day 8 shows as locked | ☐ |
| Progress bar invisible | TC-04: Green bar visible at top of lesson | ☐ |
| Plans page blank | TC-09: Plans load from Supabase | ☐ |
| Dashboard tab missing | TC-07: Dashboard tab visible in bottom nav | ☐ |
| Lesson not found (UUID in URL) | TC-04: Day 3 lesson at `/lesson/3ad4d876-...` loads | ☐ |

---

## Test Completion Criteria

All test cases must pass with the following minimum:

- **Critical (5):** TC-01, TC-02, TC-03, TC-04, TC-08 — 100% pass required
- **High (6):** TC-05, TC-06, TC-07, TC-09, TC-10, TC-14 — 100% pass required
- **Medium (3):** TC-11, TC-12, TC-13 — 90% pass required
- **Low (2):** TC-15, TC-16 — best effort

---

## Reporting Issues

For each bug found:
1. **Test Case ID:** Which TC step failed
2. **URL:** Full URL where it happened
3. **Steps to reproduce:** Exact actions
4. **Expected:** What should happen
5. **Actual:** What happened (include screenshots)
6. **Browser + Version:** e.g., Chrome 128
7. **Console errors:** Open DevTools (F12) → Console tab → copy any red errors

---

## Contact

- **Developer:** Turbo CEO
- **Repo:** github.com/Turbial/turbo-learning
- **Slack:** #turboceo
- **Server:** 178.105.166.126 (Hetzner)
- **Database:** Supabase project `afgmlkduuapquqkcqdsk`
