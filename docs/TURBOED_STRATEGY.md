# TurboEd — The Complete Product Strategy

*Compiled from CEO working session — June 1, 2026*
*Turbo CEO + Marcus*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What We Have Built](#2-what-we-have-built)
3. [Business Model A: TurboEd Create (Creator Economy)](#3-business-model-a-turboed-create)
4. [Business Model B: TurboEd School (K-12 Education)](#4-business-model-b-turboed-school)
5. [Technical Architecture](#5-technical-architecture)
6. [Release Roadmap](#6-release-roadmap)
7. [Competitive Landscape](#7-competitive-landscape)
8. [Revenue Model](#8-revenue-model)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Immediate Next Actions](#10-immediate-next-actions)
11. [Conversation Record](#11-conversation-record)

---

## 1. Executive Summary

TurboEd is an education operating system built on a product-agnostic step engine that powers interactive, gamified, AI-enhanced learning experiences. What began as an AI Operator training course has evolved into a general-purpose platform that can teach any subject, serve any audience, and operate across two distinct business models:

- **TurboEd Create** — A creator economy platform where individual educators and coaches build and sell interactive courses
- **TurboEd School** — A K-12 curriculum platform serving homeschool families, microschools, private schools, and eventually school districts

One engine. Two markets. Zero duplication.

The eLearning market is $325 billion. The K-12 education market is $800 billion+ in the US alone. Homeschool enrollment has doubled post-pandemic to 3.4-4.3 million students. 30+ states have Education Savings Account (ESA) programs that give parents $4,000-$8,000 per child per year — funds that can be spent on qualified educational platforms.

**TurboEd sits at the intersection of AI content generation, social learning, mobile-first microlearning, and ESA-funded education. Nobody owns this intersection.**

---

## 2. What We Have Built

### The Engine (the moat)

The Turbo Learning engine is product-agnostic. The same codebase runs:

| Program | Type | Status |
|---------|------|--------|
| **AI Operator (TurboMax)** | 11-day program: how to use AI | ✅ Built (days 1-11) |
| **Duo (TurboDuo)** | 7-day program: relationship coaching | ✅ Built (days 1-7) |
| **AI for Everyone** | 8-day program: AI literacy | ✅ Built (days 8-14) |
| **FilmAssist** | Theme defined, content pending | 🔜 Future |
| **Any future program** | Any subject, any format | 🔜 Platform feature |

### Core Capabilities

| Capability | Status | Details |
|-----------|--------|---------|
| **Step Engine** | ✅ Built | 20 interactive step types (info, mc, tf, fillblank, match, highlight, scenario, reflection, builder, chat, quiz, completion, and more) |
| **Gamification** | ✅ Built | XP system, streak tracking, badge system, leaderboard, level-up celebrations, combo multipliers |
| **Multi-Program** | ✅ Built | One codebase runs all programs. Theme-per-program via `src/theme/themes.ts` |
| **Content Ingestion** | ✅ Built | Markdown-to-JSON converter at `tools/ingest/convert.ts`. Template at `tools/ingest/template.md` |
| **HD Audio Narration** | ✅ Built | Pre-generated MP3 via OpenAI TTS (`tts-1-hd`, voice `nova`). TTS fallback. Script at `tools/generate-audio-v2.ts` |
| **Auth** | ✅ Built | Supabase email/password auth |
| **Payments** | ⚠️ Scaffolded | Stripe + PayPal checkout flows exist (`app/checkout/[plan].tsx`, `app/pricing.tsx`). Needs hardening for production |
| **Mobile App** | ✅ Built | Expo (React Native). iOS, Android, Web from single codebase |
| **Offline Support** | ⚠️ Partial | Local progress store exists. Full offline sync in M6 |
| **Push Notifications** | 🔜 M6 | Push server exists at `infrastructure/push-server.js` |
| **Web Dashboard** | 🔜 Needed | Teacher/admin views need a React web dashboard (uses same Supabase backend) |

---

## 3. Business Model A: TurboEd Create

**The Creator Economy Platform**

### Target Customer
Individual educators, coaches, experts, influencers who want to create and sell interactive courses.

### Value Proposition
- **Build a course in hours, not months** — AI generates complete lesson drafts from a topic description
- **20 interactive step types** — Not just video. Quizzes, reflections, scenarios, AI chat, fill-in-blank, match pairs
- **Gamified by default** — Every course automatically gets XP, streaks, badges, leaderboards
- **Mobile-first** — Students learn on their phones in 15-minute daily sessions (Duolingo model)
- **HD audio narration** — Every lesson auto-narrated with natural AI voice
- **Social layers** — Cohorts, discussion threads, peer review

### Revenue Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 1 program, up to 50 students |
| **Pro** | $49/mo | Unlimited programs, 500 students, basic analytics |
| **Business** | $149/mo | Unlimited students, cohorts, social features, priority support |
| **Enterprise** | Custom | White-label, SSO, API access |

**Platform fee on course sales:** 10% (creators keep 90%)

### Competitive Position

| Feature | Kajabi | Teachable | Skool | Duolingo | **TurboEd** |
|---------|--------|-----------|-------|----------|-------------|
| Course hosting | ✅ | ✅ | ✅ | ❌ | ✅ |
| Community | ❌ | ❌ | ✅ | ❌ | ✅ |
| AI content gen | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Gamification | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mobile-first | ❌ | ❌ | ❌ | ✅ | ✅ |
| Creator marketplace | ✅ | ✅ | ✅ | ❌ | ✅ |
| Interactive steps | ❌ | ⚠️ | ❌ | ✅ | ✅ (20 types) |
| HD audio narration | ❌ | ❌ | ❌ | ❌ | ✅ |
| **All 8 boxes** | ❌ | ❌ | ❌ | ❌ | **✅** |

---

## 4. Business Model B: TurboEd School

**The K-12 Education Platform**

### Target Customer
Homeschool families, microschools (125K+ in the US), private schools, and eventually public school districts.

### The ESA Opportunity

| Metric | Value |
|--------|-------|
| Homeschool students (US, 2026) | 3.4 - 4.3 million |
| ESA states with programs | 30+ states |
| ESA states where homeschoolers qualify | ~12 states (Florida, Arizona, Utah, Indiana, West Virginia, Iowa, and more) |
| ESA funding per child/year | $4,000 - $8,000 |
| Total ESA market size | $15-25 billion annually |
| ESA-eligible spending | Online courses, curriculum, tutoring, educational software |

**Key insight:** The government money is already allocated. Parents have ESA accounts with funds sitting in them. They need qualified platforms to spend that money on. TurboEd can become an ESA-approved vendor and capture a portion of those funds.

### School Model Features

#### For Teachers/Parents:
- **Create a school** — Branded space with logo, colors, student roster
- **Assign programs** — Students enrolled in specific curricula with scheduling
- **Track progress** — Per-student dashboards, attendance, completion rates, assessment scores
- **Grade and give feedback** — Review reflections, grade quizzes, leave comments
- **Communicate** — Announcements, DMs with students/parents, group discussions
- **Generate transcripts** — Auto-generated progress reports for state compliance
- **Accept ESA payments** — Become an approved vendor. Parents pay with ESA funds

#### For Students:
- **Daily learning path** — Like Duolingo but for school subjects (Math, Science, History, English, and electives like AI Operator)
- **Gamified across ALL subjects** — Unified XP, streaks, badges (not per-app)
- **Social** — Study groups, class discussions, peer feedback
- **Interactive** — AI chat steps for questions, reflections, projects
- **Portfolio** — Everything they create is saved, organized, shareable
- **Mobile-first** — Learn on the bus, at home, anywhere

### Revenue Model

| Tier | Price | Includes |
|------|-------|----------|
| **Starter** | Free | 1 teacher, up to 5 students, basic features |
| **Family** | $29/mo | 1 teacher, up to 10 students, all features |
| **Classroom** | $79/mo | Up to 30 students, gradebook, assignments |
| **School** | $249/mo | Unlimited teachers, unlimited students, admin dashboard, ESA integration |
| **District** | Custom | White-label, SSO, SIS integration, dedicated support |

### ESA Revenue Path
- Parents pay with ESA funds (state deposits → ClassWallet/Odyssey → TurboEd subscription)
- $299-599/student/year for full curriculum access
- **3.4M students × 10% market penetration × $399 = $135M ARR potential**

---

## 5. Technical Architecture

### Current Stack

```
┌─────────────────────────────────────────────┐
│                  EXPO APP                    │
│  React Native (iOS + Android + Web)          │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Step Engine  │  │  Gamification Engine │  │
│  │  20 types    │  │  XP/Streak/Badges    │  │
│  └─────────────┘  └──────────────────────┘  │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Narration    │  │  Content (JSON)      │  │
│  │ TTS + HD MP3 │  │  Per-program files   │  │
│  └─────────────┘  └──────────────────────┘  │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │           Supabase Backend            │   │
│  │  Auth / DB / Storage / Edge Functions │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Future Architecture (TurboEd School)

```
┌──────────────────────────────────────────────────────────────┐
│                     TURBOED PLATFORM                          │
│                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Mobile App      │  │  Web App      │  │  Creator       │  │
│  │  (Expo RN)       │  │  (React SPA)  │  │  Dashboard     │  │
│  │  Student-facing  │  │  Student Web  │  │  (React SPA)   │  │
│  └────────┬────────┘  └──────┬───────┘  └───────┬────────┘  │
│           │                  │                   │            │
│  ┌────────┴──────────────────┴───────────────────┴────────┐  │
│  │                    SUPABASE                            │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Auth     │ │ Programs │ │ Progress │ │ Gamify   │  │  │
│  │  │ Users    │ │ Content  │ │ Tracking │ │ XP/Badge │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Schools  │ │ Classes  │ │ Payments │ │ Messages │  │  │
│  │  │ Roster   │ │ Gradebook│ │ ESA/Sub  │ │ Comms    │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   EXTERNAL SERVICES                     │  │
│  │  OpenAI TTS  │  OpenAI GPT  │  Stripe  │  ClassWallet   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### New Data Models Needed (School)

```
School
  id, name, branding, owner_id, settings

Class
  id, school_id, name, teacher_id, student_ids[]

Enrollment
  id, student_id, program_id, class_id, status

Assignment
  id, class_id, program_id, due_date, instructions

Grade
  id, assignment_id, student_id, score, feedback, graded_by

ESA_Payment
  id, student_id, amount, state, transaction_id, receipt_url

Message
  id, sender_id, recipient_id, content, read_at

Announcement
  id, school_id, class_id, title, body, sent_at
```

---

## 6. Release Roadmap

### Phase 0: Foundation (Current — June 2026)

**What exists today:**
- ✅ Step engine with 20 types
- ✅ Gamification (XP, streaks, badges, leaderboard)
- ✅ AI Operator program (11 days, complete)
- ✅ Duo program (7 days, complete)
- ✅ AI for Everyone program (8 days)
- ✅ Content ingestion pipeline (markdown → JSON)
- ✅ HD audio narration pipeline (OpenAI TTS)
- ✅ Multi-program theming
- ✅ Auth (Supabase)
- ⚠️ Payment flows (scaffolded, needs hardening)

**Release 1: AI Operator + Duo (Target: June 2026)**
- Ship the two flagship programs as a live product
- Polish the app (text centering done, audio pipeline built, ingestion tools ready)
- Deploy web version to Netlify/Cloudflare
- Submit mobile app to App Store / Play Store (Expo build)
- Set up production Supabase project
- Enable Stripe payments for subscriptions
- Landing page explaining the programs

### Phase 1: Stable Product (Q3 2026)

- Hardening: error handling, loading states, edge cases
- Full test coverage for step engine
- Production monitoring and crash reporting
- Push notifications for streak reminders (M6)
- Offline support (M6)
- Analytics dashboard for student progress
- Admin panel for content management

### Phase 2: Creator Studio (Q4 2026)

- Web dashboard for creators
- AI-assisted course generation ("I want a 14-day course on negotiation")
- Course editor (drag-and-drop step arrangement)
- Preview mode (test as student)
- Creator analytics (enrollments, completion rates, revenue)
- Stripe Connect for creator payouts
- Creator marketplace / program discovery

### Phase 3: Social Layer (Q1 2027)

- Cohorts (groups learning together)
- Discussion threads per step
- Peer review system
- Activity feed ("Sarah completed Day 7")
- Direct messages
- Profiles as learning portfolios

### Phase 4: TurboEd School Launch (Q2 2027)

- School/roster system
- Teacher role and dashboard
- Assignment and grading
- Parent portal and progress reports
- ESA vendor certification (start with Florida + Arizona)
- ClassWallet / Odyssey payment integration
- Compliance reporting (attendance, transcripts)

### Phase 5: Scale (2027+)

- Microschool network partnerships
- School district pilots
- Standardized test prep integration
- White-label for enterprise
- International expansion (non-US ESA equivalents)
- Live classroom features (integrated video)

---

## 7. Competitive Landscape

### TurboEd Create vs. Creator Platforms

| Feature | Kajabi | Teachable | Thinkific | Skool | Podia | **TurboEd** |
|---------|--------|-----------|-----------|-------|-------|-------------|
| Course hosting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Community | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| AI content generation | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gamification | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Mobile-first learning | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Interactive steps | ❌ | ⚠️ quizzes | ⚠️ quizzes | ❌ | ⚠️ quizzes | ✅ (20 types) |
| HD audio narration | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Free tier | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Price (starting) | $55/mo | $39/mo | $36/mo | $99/mo | $39/mo | **Free** |

### TurboEd School vs. K-12 Platforms

| Feature | Google Classroom | Canvas | Outschool | Khan Academy | IXL | **TurboEd School** |
|---------|-----------------|--------|-----------|--------------|-----|-------------------|
| Assignments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Gamification | ❌ | ❌ | ❌ | ⚠️ basic | ⚠️ basic | ✅ (full) |
| AI content gen | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI tutor | ❌ | ❌ | ❌ | ⚠️ Khanmigo | ❌ | ✅ (built-in) |
| Social learning | ❌ | ⚠️ discussions | ❌ | ❌ | ❌ | ✅ |
| Live classes | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ planned |
| ESA payment | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (target) |
| Mobile-first | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| HD audio narration | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Interactive steps | ❌ | ⚠️ quizzes | ❌ | ✅ | ✅ | ✅ (20 types) |
| Creator marketplace | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Homeschool compliance | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Price | Free | Paid | Per class | Free | $9.95/mo | Free+Paid |

---

## 8. Revenue Model

### TurboEd Create

| Stream | Model | Projection |
|--------|-------|------------|
| Creator subscriptions | $0-149/mo tiered SaaS | Primary revenue |
| Course sales commission | 10% platform fee | Secondary |
| Premium features | AI content gen credits, advanced analytics | Add-on |

### TurboEd School

| Stream | Model | Projection |
|--------|-------|------------|
| Per-student licensing | $299-599/year | Primary revenue |
| School subscriptions | $29-249/mo tiers | Secondary |
| ESA payment processing | 3-5% transaction fee | Add-on |
| District contracts | Custom pricing | Enterprise |

### Target Economics (5-year horizon)

| Metric | Conservative | Ambitious |
|--------|-------------|-----------|
| Homeschool students | 340,000 (10%) | 680,000 (20%) |
| ARR (School) | $135M | $270M |
| Creators | 10,000 | 50,000 |
| ARR (Create) | $6M | $30M |
| **Total ARR** | **$141M** | **$300M** |

---

## 9. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **ESA policy reversal** — state cancels program | HIGH | Diversify across 12+ states. No state >20% of revenue. Lobby for policy stability |
| **FERPA/COPPA compliance** — student privacy laws | HIGH | Hire compliance consultant before school launch. Build data controls from day 1 |
| **Google adds gamification** — Classroom ships streaks | MEDIUM | Google ships slowly. Compete on engagement UX, not utility. 20 step types are deep differentiation |
| **Content quality at scale** — AI-generated courses mediocre | MEDIUM | Creator verification badges. Community reviews. "TurboEd Certified" quality seal |
| **Creator retention** — creators leave for higher rev share | MEDIUM | Community features create switching costs. Students stay → creators stay. 90% rev share is competitive |
| **Long district sales cycles** | MEDIUM | Start with homeschool (individual purchases). Only go upstream after traction |
| **Parent AI skepticism** — "I don't want AI teaching my kids" | LOW | Position AI as teacher's assistant, not replacement. Humans curate and teach |
| **Chicken-and-egg** — need creators + students simultaneously | MEDIUM | Launch with 3-5 flagship programs we build. Recruit 10 beta creators. Target AI Operator graduates as first creators |

---

## 10. Immediate Next Actions

### This Week

1. **Name decision** — TurboEd. Buy `turboed.com` (or `turbo.education` / `turbo.at`)
2. **Domain + landing page** — Simple page explaining the two programs. Email signup
3. **Production Supabase** — Set up separate project from development
4. **Ship AI Operator + Duo** — Deploy web version, submit to app stores

### This Month

5. **Web dashboard foundation** — React app on Netlify, Supabase backend. Teacher/admin views
6. **Creator beta outreach** — Identify 5-10 potential creators
7. **ESA vendor research** — Start with Florida ESA program requirements
8. **School data model** — Design and migrate schools/classes/assignments/gradebook schema
9. **Stripe Connect** — Enable creator payouts
10. **Third program** — Choose a vertical to prove the platform (coding? fitness? finance?)

### This Quarter

11. **AI content generation** — OpenAI prompt → complete lesson JSON
12. **Cohort system** — Groups, shared progress, cohort leaderboards
13. **Creator Studio MVP** — Course builder web app
14. **FERPA/COPPA compliance review** — Legal consultation
15. **App Store launch** — iOS and Android

---

## 11. Conversation Record

*This document captures the strategic conversation on June 1, 2026.*

**Participants:** Turbo CEO, Marcus (U0B36NZPM7A)

**Key Decisions:**
- Product name: **TurboEd** (pending final approval)
- First release: AI Operator (TurboMax) + Duo programs
- Two business models: Create (creator economy) + School (K-12)
- Revenue: SaaS tiers + course commissions + per-student licensing
- Go-to-market: Homeschool wedge → microschools → districts
- ESA vendor certification is a key strategic priority
- Platform expansion: Creator Studio (Q4 2026) → Social Layer (Q1 2027) → School Launch (Q2 2027)
- AI positions as teacher assistant, not replacement
- Engine remains product-agnostic; all programs run from same codebase

**Technical Assets Delivered Today:**
- Content ingestion system (`tools/ingest/`) — markdown → lesson JSON converter
- HD audio narration pipeline (`tools/generate-audio-v2.ts`) — OpenAI TTS with CDN upload
- Text centering improvements across all 17 app pages
- Audio URL support in InfoStep and HighlightStep components (pre-generated MP3 with TTS fallback)
- Fixed invalid `backdropFilter` CSS property

**Repository:** `Turbial/turbo-learning`
**Backend:** Supabase (`afgmlkduuapquqkcqdsk`)
**Server:** 178.105.166.126 (Hetzner)

---

*End of strategy document. To be updated as decisions are made and milestones are reached.*
