const fs = require('fs');

// Complete screen data
const pages = [
  // AUTH (3)
  {n:1,name:"Login",route:"/auth/login",group:"🔐 Auth",desc:"Email + password sign-in with brand header",fields:[
    ["LOGO","Brand logo","🚀 Rocket in 72px circle, white bg 20%, centered above card"],
    ["TEXT","Title","'Turbo Academy' — 28px bold white"],
    ["TEXT","Tagline","'AI Operator · 28-Day Program' — 14px white 75%"],
    ["TEXT","Card title","'Welcome back' — 24px bold #1a1a2e"],
    ["TEXT","Card subtitle","'Sign in to continue your journey' — 15px #6b7280"],
    ["INPUT","Email","'Email address' placeholder, keyboard email, autoComplete email"],
    ["INPUT","Password","'Password' placeholder, secure text entry"],
    ["ERROR","Error pill","Red #fef2f2 bg, #dc2626 text. Shows validation errors. Conditional"],
    ["BTN","Sign in","Green #059669. 'Signing in…' busy state. Disabled while loading"],
    ["LINK","Forgot password?","Centered, #6b7280 gray → /auth/forgot-password"],
    ["DIVIDER","'or' divider","Line + 'or' text + line, gray"],
    ["LINK","Create account","'Create a free account →' full-width pill btn, gray bg, green text → /auth/register"]
  ],layout:"Full green #059669 background. Brand section centered top. White card at bottom with rounded top corners 28px, shadow, padding 24px, gap 12px."},
  {n:2,name:"Register",route:"/auth/register",group:"🔐 Auth",desc:"Create account form. Two views: form → email confirmation after submit",fields:[
    ["LOGO","Brand logo","🚀 72px circle, same as Login"],
    ["TEXT","Title","'Turbo Academy' — 28px bold white"],
    ["TEXT","Tagline","'Start your 28-day AI journey' — 14px white 75%"],
    ["TEXT","Card title","'Create your account' — 24px bold"],
    ["TEXT","Card subtitle","'Free to start, no credit card required' — 15px gray"],
    ["INPUT","Full name","'Your full name' placeholder, auto-capitalize words"],
    ["INPUT","Email","'Email address' placeholder, keyboard email"],
    ["INPUT","Password","'Password (6+ characters)' placeholder, secure, autoComplete new-password"],
    ["ERROR","Error pill","Red, conditional. Min 2 chars name, valid email, 6+ chars password"],
    ["BTN","Create account","Green. 'Creating account…' busy state. Disabled while loading"],
    ["TEXT","Terms","'By signing up you agree to our Terms and Privacy Policy' — 12px gray, centered"],
    ["DIVIDER","'or' divider","Line + 'or' + line"],
    ["LINK","Sign in link","'Already have an account? Sign in →' pill, light gray bg → /auth/login"],
    ["STATE","Confirm view","📧 + 'Check your email' title + 'We sent a confirmation link to [email]' + back link. Replaces card"]
  ],layout:"Same green bg + white card as Login. Two visual states: form → email confirmation."},
  {n:3,name:"Forgot Password",route:"/auth/forgot-password",group:"🔐 Auth",desc:"Password reset email. Two views: email form → sent confirmation",fields:[
    ["LOGO","Logo","🔑 Key emoji in 72px circle — different icon from Login/Register"],
    ["TEXT","Title","'Reset Password' — 28px bold white"],
    ["TEXT","Tagline","'We'll send you a reset link' — 14px white 75%"],
    ["TEXT","Card title","'Forgot your password?' — 24px bold"],
    ["TEXT","Card subtitle","'Enter your email and we'll send you a link to reset it.' — 15px gray"],
    ["INPUT","Email","'Email address' placeholder"],
    ["ERROR","Error pill","Red, conditional. Validates email format"],
    ["BTN","Send reset link","Green. 'Sending…' busy state. Calls supabase.auth.resetPasswordForEmail()"],
    ["STATE","Sent view","Green success box #ecfdf5: 📧 40px emoji + 'Check your email' title + message with email + back link"],
    ["LINK","Back link","'← Back to sign in' — green text, 15px bold → /auth/login"]
  ],layout:"Same green bg + white card. Two views: email form → sent confirmation box."},

  // ONBOARDING (1 screen, 4 steps)
  {n:4,name:"Onboarding Wizard",route:"/onboard",group:"🎯 Onboarding",desc:"4-step wizard for first-time users. Progress dots at top. Conditional navigation.",fields:[
    ["PROGRESS","Step indicators","4 nodes (32px circles) connected by lines. Done: green fill ✓. Active: white fill, green border. Future: gray fill. At top, horizontal, centered"],
    ["TEXT","Step headers","Each step: 56px emoji + 26px bold title + 16px subtitle. All centered"],
    ["INPUT","Step 0 — Name","👋 'Welcome!' + 'Let's set up your learning journey'. TextInput 'Your name', 18px, centered, autoFocus"],
    ["CARDS","Step 1 — Goal","🎯 'Your Goal' + 'What brings you to AI Operator?'. 5 cards: ⚡Automate work · 📈Advance career · 🚀Start AI business · 🧠Understand AI · 🏗️Build systems. Each: emoji+label+description. Selected: green border, light green bg, ✓ checkmark"],
    ["PILLS","Step 2 — Minutes","⏱️ 'Your Rhythm' + 'Set your learning habits'. 'Minutes per day' label + 5 pills (5/10/15/20/30). Selected: green bg+border. 22px bold nums, 'min' label"],
    ["CARDS","Step 2 — Time","'Best time to learn' label + 4 time cards: 🌅Morning / ☀️Afternoon / 🌆Evening / 🌙Night. 24px emoji + 13px label. Selected: green bg+border"],
    ["CARD","Step 3 — Review","👋 'Your Name' + 'What should we call you?'. Summary card: 3 rows (👤Name · 🎯Goal · ⏱️Daily mins+time) with dividers. Rounded, gray bg, green border"],
    ["BTN","Back","'← Back' — outlined btn, gray border, flex 1. Hidden on step 0"],
    ["BTN","Continue/Start","Green btn, flex 2. 'Continue' (steps 0-2). 'Start My Journey 🚀' (step 3). Disabled until required field filled. 'Starting…' busy state"]
  ],layout:"White bg. Progress dots top (padding 20px, horizontal 40px). Centered scrollable body. Bottom nav bar: 1px border-top, padding 20px, row flex."},

  // TABS (5)
  {n:5,name:"Journey / Home",route:"/(tabs)/home",group:"📑 Tabs",desc:"Main learning hub. 28-day program broken into 4 color-coded weeks with day rows.",fields:[
    ["BADGE","Program label","'AI OPERATOR' — 11px bold, white 70%, letter-spaced 2px, uppercase"],
    ["TITLE","Program name","26px bold white. e.g., 'AI Operator'"],
    ["TEXT","Subtitle","14px white 75%. '28 days to go from user → operator'"],
    ["ICON","Program icon","🤖 Robot in 64px circle, white bg 15%, right side of header"],
    ["STATS","4 stat cards","⚡ XP · 🔥 Streak · ✅ Completed · Level. White bg 15%, 14px padding, 16px radius. Row flex, gap 8px, inside green header"],
    ["BANNER","Streak at-risk","Yellow #fef3c7 card: ⚠️ + 'Your N-day streak is at risk!' + hours left + shield count. Conditional. Overlaps header bottom (marginTop -12)"],
    ["TITLE","'Your Journey'","20px bold #1a1a2e, centered + 'N/28 days' green counter. Centered row"],
    ["BAR","Progress bar","6px tall, green fill, gray #e5e7eb bg, 3px radius. Full width. Below journey header"],
    ["CARDS","4 week cards","WEEK 1-4. Each: accent bar 🧱green/⚙️blue/🔗purple/🚀amber. Emoji 24px + WEEK N label (11px) + title (17px) + goal text + mini 4px progress bar. White bg, 20px radius, shadow. 7 day rows inside"],
    ["ROWS","Day rows","36px numbered circle: green ✓ check=done, outlined green=current, gray=locked. Day title (14px). 'Now' pill on current. 🔒 icon on locked. 12px padding, 14px radius row bg. Current row: gray bg highlight"],
    ["SKELETON","Loading","Gray skeleton blocks: header stats + 4 week card placeholders"]
  ],layout:"Green #059669 header (paddingBottom 24). Stats row inside header. White #f9fafb scrollable body. Week cards: 16px margin, 20px radius, #fff bg, subtle shadow."},
  {n:6,name:"Progress",route:"/(tabs)/progress",group:"📑 Tabs",desc:"Stats, XP tracker, streak visualization, badges. All animated counters.",fields:[
    ["TITLE","'Your Progress'","28px bold #1a1a2e, centered, marginBottom 24px"],
    ["STATS","4 stat cards","⚡ XP · 🔥 Day Streak · ✅ Completed · 🏅 Badges. Animated count-up numbers. White cards, 1px #e8e2d9 border, 16px radius. Row flex gap 8px"],
    ["CARD","Level card","Row: 64px green circle (level number, white text) + 'Level N · [Title]' label + 8px XP progress bar (gray bg, green fill) + 'N XP · N XP to Level N+1' text. White bg card, 16px radius"],
    ["CARD","Streak card","'🔥 Streak Progress' centered heading. 7-day M-S row: 40px circles, filled=🔥 yellow bg + orange border, today=scale(1.15). If 0: 🎯 empty state. Motivation italic text below, centered"],
    ["CARD","Badges card","'🏅 Badges (N)' centered heading. Grid of badge chips (icon+name, white block, border, 8px gap). Or: 🎯 + 'Complete Day 1 to earn your first badge!' centered"],
    ["LINK","Leaderboard btn","'🏆 View Leaderboard' — white card, 16px padding, green text, centered. → /(tabs)/leaderboard"]
  ],layout:"Scrollable #f9fafb bg. Padding 24px, gap 16px. Cards: white bg, 16px radius, 1px border, padding 16-24px."},
  {n:7,name:"Leaderboard",route:"/(tabs)/leaderboard",group:"📑 Tabs",desc:"Global and friends rankings. Podium + scrollable list. 4 states.",fields:[
    ["LINK","Back arrow","'← Progress' green text. Header bar, border-bottom 1px"],
    ["TITLE","'Leaderboard'","18px bold, centered in header row. flex 1"],
    ["TOGGLE","Scope pills","2 pills flex row: 🌍 Global / 👥 Friends. Active: green bg, white text. Inactive: gray bg, muted text. 12px radius, padding 10px vertical"],
    ["PODIUM","Top 3","3 columns centered, flex row: 🥈2nd(smaller, gray bg)→🥇1st(tall, yellow #fef3c7 bg, #f59e0b border 2px)→🥉3rd(small, cream bg). Name + XP below. max 110px wide each"],
    ["LIST","Rank rows","Rank emoji/# (36px wide) + name (flex) + XP. Current user: green #ecfdf5 bg, green border, '(you)' label. White cards, 1px border, 12px radius, 4px margin-bottom"],
    ["EMPTY","Empty state","🏆 48px + contextual title + hint. Centered, flex 1, padding"],
    ["ERROR","Error state","⚠️ 48px + 'Couldn't load leaderboard' + hint. Centered"]
  ],layout:"White bg. Header bar. Toggle in gray bg strip. Podium (conditional) or empty/error state. Scrollable rank list below."},
  {n:8,name:"Dashboard",route:"/(tabs)/dashboard",group:"📑 Tabs",desc:"Quick overview + daily action. Level card, today prompt, progress grid.",fields:[
    ["CARD","Header card","Tinted green bg. 'LEVEL N' label (12px gray) + XP count (22px bold) left. 🔥 StreakFire display right. Row layout"],
    ["LABEL","'TODAY'","12px bold #9ca3af, letter-spaced 1.5px, centered"],
    ["VALUE","'Day N'","24px bold #1a1a2e, centered"],
    ["HINT","Progress","'N/28 days completed' — 14px #6b7280, centered marginBottom 8px"],
    ["BTN","Start lesson","Green 'Start today's lesson'. Centered in card. → /(tabs)/home"],
    ["GAUGE","ProgressRing","Circular gauge: N-1 / 28 completion. Green arc on gray ring. Below: 'Complete' label"],
    ["VALUE","Streak stat","'N🔥' — 28px bold. Below: 'Day streak' label. Both centered in white card"],
    ["GRID","28-Day grid","'Your 28 Days' heading + 4×7 grid (38px cells, 8px gap). Green = done, outlined green + #ecfdf5 bg = current, gray #f3f4f6 + #9ca3af text = future. Centered justifyContent"]
  ],layout:"Scrollable #f9fafb. Padding 32px, gap 24px. Cards: white bg, 20px radius, shadow. All centered."},
  {n:9,name:"Profile Tab",route:"/(tabs)/profile",group:"📑 Tabs",desc:"User profile, stats, goal, shield, badges, edit form, sign out.",fields:[
    ["AVATAR","Avatar circle","80px, initials or default. In green #059669 hero card. Centered"],
    ["TEXT","Display name","22px bold white. Or 'AI Operator' default. Centered"],
    ["PILL","Level badge","'Level N · [Title]' — pill, white bg 20%, 13px bold white, 20px radius. paddingH 14px, paddingV 4px"],
    ["STATS","Hero stats","XP / 🔥 Streak / Badges. White bg 12%, 16px radius, horizontal row with 1px dividers. Self-stretch"],
    ["CARD","Goal card","Conditional. 28px emoji + 'Learning Goal' label (11px gray, uppercase) + goal name (16px bold). If daily_mins: + ⏱️ 'Daily Commitment' row. White card, 20px radius, shadow"],
    ["CARD","Shield card","🛡️ 28px + 'Streak Protection' label + 'N shields available' text + 'Buy Shield' yellow #fef3c7 pill btn, #92400e text. Row layout, gap 14px"],
    ["CARD","Badges card","'🏅 Badges Earned' heading + grid of badge chips (icon+name in pills, gray bg, border). Conditional"],
    ["CARD","Edit Profile","'Edit Profile' centered heading + Display name Field + Goal Field (multiline) + 12px spacer + 'Save changes' green btn. White card"],
    ["BTN","Sign out","Red outlined btn: 'Sign out' — #ef4444 text, #fef2f2 bg, #fee2e2 border 1.5px. 14px padding, 16px radius"]
  ],layout:"Scrollable #f9fafb. Green hero card (24px radius, padding 24px, centered, gap 8px). White cards below (20px radius, 18px padding, 16px gap). Sign out at bottom + 40px spacer."},

  // LESSON FLOW (2)
  {n:10,name:"Lesson Player",route:"/lesson/[id]",group:"📖 Lessons",desc:"Core learning engine. Renders 20 step types dynamically. Progress bar, combo, nav.",fields:[
    ["BAR","Progress bar","4px green bar at top. Width = stepIndex/steps.length × 100%. Gray #e0d9cf bg"],
    ["BANNER","Combo bar","'🔥 Nx Combo! [label]' — yellow #fef3c7 bg, #92400e text. Conditional (combo≥2)"],
    ["ICON","Home button","🏠 in top-right corner, absolute positioned, zIndex 10. Clears lesson state, returns to home"],
    ["COMPONENT","Step content","Flex 1, padding 20px. Renders 1 of 20 step components. Info: title+body+audio player. MC: question+radio options+feedback. TF: question+True/False cards. FillBlank: question+text input+answer. Match: tap pairs. Quiz: mini-MC grid. Builder: multi-field form. Scenario: framed card. Example: prompt display. Reflection: text areas. Chat: AI bubbles+input. Completion: 🎉+XP. All use shared stepStyles"],
    ["ANIM","XP bursts","Floating '+N XP' animations at 45% from top, zIndex 100. Fade out after 800ms"],
    ["LINK","Back button","'← Back' — 15px, #6B5E50 gray, 600 weight. Visible if allowBack && stepIndex>0"],
    ["LINK","Continue/Complete","'Continue →' or 'Complete →' — 15px, green #059669, 700 weight. Right-aligned. Visible after non-interactive steps or after answering"],
    ["FLOAT","ChatWidget","Floating AI assistant button. Opens chat overlay for help during lessons"]
  ],layout:"Full screen. Progress bar top. Combo bar below. Step content fills remaining space. Nav bar bottom: 1px border-top, 16px padding, space-between. Loading: ActivityIndicator centered + 'Loading lesson...' text."},
  {n:11,name:"Lesson Complete",route:"/complete/[unitId]",group:"📖 Lessons",desc:"Celebration screen. Animated XP, score, streak, knowledge meter. Level-up + badge modals.",fields:[
    ["CELEBRATION","Confetti + XP","Animated XP counter with confetti overlay. Streak fire display. Phase 1: 0-1.4s"],
    ["PILL","Score pill","'N% Score' — white pill, green text. Rounded full. Fades in + opacity transition. Phase 2: 1.4-2.8s"],
    ["METER","KnowledgeMeter","Visual correct/total bar. Animated. Only shown if graded questions exist. Scale + opacity transition"],
    ["CARD","Streak card","🔥 32px + 'Streak started!' or 'N-day streak!' + motivational hint. Yellow #fef3c7 bg, max-width 320px, 16px radius, 16px padding"],
    ["TEXT","Total XP","'N total XP · Level N [Title]' — gray text, 14px, centered, marginBottom 32px"],
    ["BTN","Continue Journey","Green, full-width, 16px padding, max 320px. 'Continue Journey' — → /(tabs)/home"],
    ["LINK","View Progress","Green text link, 16px, 600 weight. 'View Progress' — → /(tabs)/progress"],
    ["MODAL","LevelUpModal","Overlay: confetti + green circle with '< N >' level number + 'Level N' + '[Title]' + close btn. On level-up. Dimissible. zIndex above content"],
    ["MODAL","BadgeReveal","Overlay: large badge icon + name + description + close btn. Queued (shows one at a time). Dismissible"]
  ],layout:"Full screen, white #FAF8F5 bg. All content centered (flex: 1, justifyContent: center, alignItems: center). Elements max-width 320px. Animated phase transitions via useEffect timers."},

  // SECONDARY (4)
  {n:12,name:"Pricing",route:"/pricing",group:"⚙️ Secondary",desc:"Subscription plans from Supabase. Loading, error, empty states.",fields:[
    ["TITLE","'Choose your plan'","28px bold, centered. Fetches from supabase.from('plans').eq('is_active', true)"],
    ["CARDS","Plan cards","Each: name + 'POPULAR' badge (orange pill, if is_popular) + price (accent color or gray) + bullet features list + action btn. ScrollView gap 24px"],
    ["BTN","Plan actions","Free plan: 'Get started' secondary btn → /onboard. Paid: 'Upgrade' primary btn → /checkout/[slug]. Current: disabled 'Current plan'"],
    ["LOADING","Spinner","ActivityIndicator large, green, centered flex 1"],
    ["ERROR","Error view","'Failed to load plans. Please try again.' + Retry ghost button"],
    ["EMPTY","Empty view","📋 48px + 'No plans available' + 'Check back soon for pricing options.'"]
  ],layout:"ScrollView. Padding 32px, gap 24px. Cards: white bg, rounded. Background from theme. Bullet features with • prefix."},
  {n:13,name:"Checkout",route:"/checkout/[plan]",group:"⚙️ Secondary",desc:"Payment method selector. Stripe card + optional PayPal.",fields:[
    ["TITLE","'Choose payment method'","Title size, bold, centered. Text align center"],
    ["SUBTITLE","Plan info","'{planLabel} · {price}' — body size, muted, centered, marginTop 4px"],
    ["ERROR","Error banner","Red #fef2f2 bg, #ef4444 text, 16px radius, 16px padding. Border #fecaca. Conditional"],
    ["CARD","Card payment","💳 + 'Credit / Debit Card' subtitle (18px, 700 weight) + description + 'Pay with Card' green btn. Calls startCheckout(plan) — Stripe"],
    ["CARD","PayPal payment","🅿️ + 'PayPal' subtitle + description + 'Pay with PayPal' secondary btn. Conditional on isPayPalAvailable(). Calls startPayPalCheckout(plan)"],
    ["BTN","Cancel","Ghost btn. 'Cancel' — → router.back()"]
  ],layout:"Centered column. Flex 1, justifyContent center. Padding 32px, gap 24px. Background from theme. Cards: white bg, rounded."},
  {n:14,name:"Settings",route:"/profile/settings",group:"⚙️ Secondary",desc:"App preferences. Daily reminders toggle, reminder time picker, sign out.",fields:[
    ["TITLE","'Settings'","Title size, bold, centered"],
    ["CARD","Settings card","White bg, 16px radius, 1px border, 24px padding. Contains toggle + divider + time picker"],
    ["TOGGLE","Daily reminders","Row: 'Daily reminders' label (bodyLg, 600 weight) + Switch component. justifyContent space-between"],
    ["DIVIDER","Divider","1px, theme border color. height 1px"],
    ["LABEL","'Reminder time'","'Reminder time' — small, muted, uppercase, letter-spaced. Above time picker"],
    ["PILLS","Time slots","3 pressable pills in row: Morning / Afternoon / Evening. Selected: accent bg + accent border + accent text. Inactive: surface bg + border color. Min height 48px, 16px radius. Equal flex"],
    ["BTN","Sign out","Secondary/outlined. Calls supabase.auth.signOut() → /auth/login. Spacer (flex 1) pushes to bottom"]
  ],layout:"White bg page. Padding 32px, gap 24px. Card wraps settings. Flex 1 spacer pushes sign out to visible area."},
  {n:15,name:"Programs","route":"/programs/index",group:"⚙️ Secondary",desc:"Browse + enroll in programs. FlatList with cards.",fields:[
    ["TITLE","'Programs'","Title size, bold, centered. FlatList ListHeaderComponent. marginBottom 8px"],
    ["CARDS","Program cards","Each: title (subtitle size, bold, centered) + optional subtitle (centered, muted) + button with top margin. White Card wrapper"],
    ["BTN","Enroll / Continue","If enrolled: 'Continue' → /home. If not: 'Enroll' → upsert enrollment in supabase → refetch → /home"],
    ["EMPTY","Empty state","'No programs yet' + 'Check back soon.' — EmptyState component"],
    ["LOADING","Skeletons","3 gray skeleton cards, 88px height, gap 16px"]
  ],layout:"FlatList. Padding 32px, gap 16px. Cards: white bg, 16px radius. Simple list format."},
];

function renderPage(p) {
  let h = '';
  h += `<div class="screen-card${p.n > 9 ? '' : ''}">`;
  h += `<div class="card-header"><span class="card-num">${p.n}</span> <span class="card-name">${p.name}</span> <span class="card-route">${p.route}</span></div>`;
  h += `<div class="card-body">`;
  if (p.desc) h += `<div class="card-desc">${p.desc}</div>`;
  h += `<ul class="field-list">`;
  p.fields.forEach(f => {
    const [type, name, note] = f;
    const cls = type.replace(/\s/g, '-').toLowerCase();
    h += `<li class="field-item"><span class="badge badge-${cls}">${type}</span><span class="fname">${name}</span><span class="fnote">${note}</span></li>`;
  });
  h += `</ul>`;
  if (p.layout) h += `<div class="layout"><strong>📐 Layout:</strong> ${p.layout}</div>`;
  h += `</div></div>`;
  return h;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Turbo Academy — Complete Screen Inventory</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f1117; color: #e2e8f0; padding: 2rem; }
  h1 { text-align: center; color: #059669; font-size: 1.8rem; margin-bottom: 0.25rem; }
  .subtitle { text-align: center; color: #64748b; margin-bottom: 2.5rem; font-size: 0.9rem; }
  .section { margin-bottom: 2.5rem; }
  .section-title { color: #059669; font-size: 1.15rem; border-bottom: 2px solid #1a1f30; padding-bottom: 0.4rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .section-badge { background: #059669; color: #fff; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 5px; font-weight: 700; }
  .screens-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 1rem; }
  .screen-card { background: #141820; border-radius: 12px; border: 1px solid #1e2633; overflow: hidden; }
  .card-header { padding: 0.65rem 0.9rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid #1e2633; background: #1a1f2a; }
  .card-num { background: #1e2633; color: #059669; font-size: 0.7rem; font-weight: 800; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .card-name { font-weight: 700; font-size: 0.9rem; flex: 1; }
  .card-route { font-size: 0.65rem; color: #64748b; font-family: monospace; background: #1e2633; padding: 0.1rem 0.35rem; border-radius: 3px; }
  .card-body { padding: 0.8rem; }
  .card-desc { color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.6rem; font-style: italic; }
  .field-list { list-style: none; display: flex; flex-direction: column; gap: 0.15rem; }
  .field-item { display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.73rem; padding: 0.2rem 0; border-bottom: 1px solid #1e263322; }
  .badge { font-size: 0.58rem; font-weight: 700; padding: 0.06rem 0.3rem; border-radius: 3px; white-space: nowrap; min-width: 44px; text-align: center; }
  .badge-logo, .badge-icon, .badge-avatar { background: #83184322; color: #f472b6; }
  .badge-text, .badge-title, .badge-label, .badge-value, .badge-hint, .badge-badge { background: #064e3b22; color: #34d399; }
  .badge-input { background: #1e40af22; color: #60a5fa; }
  .badge-btn, .badge-link, .badge-button { background: #7c3aed22; color: #a78bfa; }
  .badge-state, .badge-cards, .badge-pills, .badge-card, .badge-stats, .badge-bar, .badge-grid, .badge-banner, .badge-rows, .badge-podium, .badge-list, .badge-gauge, .badge-meter, .badge-celebration, .badge-modal, .badge-anim, .badge-component, .badge-float, .badge-progress { background: #92400e22; color: #fbbf24; }
  .badge-error, .badge-divider { background: #991b1b22; color: #f87171; }
  .badge-empty, .badge-loading, .badge-skeleton, .badge-toggle { background: #1e3a5f22; color: #7dd3fc; }
  .fname { color: #cbd5e1; min-width: 85px; font-weight: 500; }
  .fnote { color: #64748b; font-size: 0.68rem; }
  .layout { margin-top: 0.6rem; padding: 0.45rem 0.6rem; background: #1a1f2a; border-radius: 7px; font-size: 0.68rem; color: #94a3b8; line-height: 1.5; }
  .layout strong { color: #e2e8f0; }
  .footer { text-align: center; color: #475569; margin-top: 3rem; font-size: 0.8rem; }
  .footer a { color: #059669; }
</style>
</head>
<body>
<h1>📱 Turbo Academy — Screen Inventory for Redesign</h1>
<p class="subtitle">15 complete screens · Every field catalogued with type + description · Ready for your design mocks</p>
<div class="section"><div class="section-title">🔐 <span>Auth Flow</span> <span class="section-badge">3 screens</span></div><div class="screens-grid">${pages.slice(0,3).map(renderPage).join('')}</div></div>
<div class="section"><div class="section-title">🎯 <span>Onboarding</span> <span class="section-badge">1 screen / 4 steps</span></div><div class="screens-grid">${renderPage(pages[3])}</div></div>
<div class="section"><div class="section-title">📑 <span>Tab Bar Screens</span> <span class="section-badge">5 screens</span></div><div class="screens-grid">${pages.slice(4,9).map(renderPage).join('')}</div></div>
<div class="section"><div class="section-title">📖 <span>Lesson Flow</span> <span class="section-badge">2 screens</span></div><div class="screens-grid">${pages.slice(9,11).map(renderPage).join('')}</div></div>
<div class="section"><div class="section-title">⚙️ <span>Secondary Screens</span> <span class="section-badge">4 screens</span></div><div class="screens-grid">${pages.slice(11).map(renderPage).join('')}</div></div>
<p class="footer">Turbo Academy · Screen Inventory v1.0 · <a href="http://46.224.213.11:8087">Live App</a> · <a href="http://46.224.213.11:8087/strategy.html">Strategy Doc</a></p>
</body>
</html>`;

fs.writeFileSync('/tmp/screen-inventory-full.html', html);
console.log('Written: ' + html.length + ' bytes');
