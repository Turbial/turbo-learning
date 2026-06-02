// ─── Home Screen — Desktop / Web — Ocean / Aqua theme ────────────────────────
// Light, "looking through water" aesthetic.
// Layout: white sidebar + scrollable main on a soft aqua background.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { spacing, radius, fontSize, fontWeight } from "../../src/theme/tokens";

// ─── Local ocean palette ──────────────────────────────────────────────────────
const o = {
  bg:      "#F0FDFF",   // screen bg — barely-there cyan
  bgTint:  "#CFFAFE",   // cyan-100 — for tracks, icon bgs
  card:    "#FFFFFF",
  deep:    "#0E7490",   // hero bg / dark accent
  mid:     "#0891B2",   // primary — cyan-600
  bright:  "#06B6D4",   // cyan-500
  teal:    "#14B8A6",
  sky:     "#0EA5E9",
  border:  "#BAE6FD",   // sky-200
  sideBar: "#FFFFFF",
  text:    "#0F172A",
  muted:   "#64748B",
  dim:     "#94A3B8",
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  initials: "AJ",
  name: "Alexandra J.",
  handle: "@alex_learns",
  level: 24,
  xp: 3692,
  xpToNextLevel: 308,
  xpForNextLevel: 4000,
  streak: 7,
  rank: 42,
  notifications: 2,
};

const MOCK_HERO = {
  tag: "Continue Learning",
  title: "Quadratic Equations",
  subtitle: "Mathematics · Chapter 4 of 8",
  timeLabel: "5–7 min",
  difficulty: "MEDIUM",
  xpReward: "250 XP",
  progress: 0.78,
  lessonId: "lesson-quadratic-1",
};

type SubjectFilter = "All" | "Math" | "Science" | "Language" | "History" | "Logic" | "Art";
const FILTERS: SubjectFilter[] = ["All", "Math", "Science", "Language", "History", "Logic", "Art"];

const SUBJECTS = [
  { id: "math",     name: "Mathematics",    emoji: "📐", count: "150+ Questions", progress: 0.79, bg: "#0891B2", glow: "#38BDF8", category: "Math"     as SubjectFilter, locked: false },
  { id: "science",  name: "Science Lab",    emoji: "🔬", count: "120+ Questions", progress: 0.45, bg: "#0D9488", glow: "#2DD4BF", category: "Science"  as SubjectFilter, locked: false },
  { id: "language", name: "Language Arts",  emoji: "📖", count: "200+ Questions", progress: 0.30, bg: "#0284C7", glow: "#38BDF8", category: "Language" as SubjectFilter, locked: false },
  { id: "history",  name: "World History",  emoji: "🏛️", count: "90+ Questions",  progress: 0.12, bg: "#0369A1", glow: "#67E8F9", category: "History"  as SubjectFilter, locked: false },
  { id: "logic",    name: "Logic & Puzzles", emoji: "🧩", count: "Coming soon",   progress: 0,    bg: "#94A3B8", glow: "#CBD5E1", category: "Logic"    as SubjectFilter, locked: true  },
  { id: "art",      name: "Creative Arts",  emoji: "🎨", count: "Coming soon",    progress: 0,    bg: "#A8A29E", glow: "#D6D3D1", category: "Art"      as SubjectFilter, locked: true  },
];

const ACTIVITY = [
  { id: "a1", emoji: "📐", name: "Calculus Integration",    chapter: "Chapter 3", subject: "Mathematics",   time: "2 hours ago", status: "done"        },
  { id: "a2", emoji: "🔬", name: "Newton's Laws of Motion", chapter: "Chapter 2", subject: "Physics",       time: "5 hours ago", status: "in-progress" },
  { id: "a3", emoji: "📝", name: "Essay Structure Basics",   chapter: "Chapter 1", subject: "Language Arts", time: "Yesterday",   status: "new"         },
];

const NAV_ITEMS = [
  { id: "home",     label: "Home",     emoji: "🏠" },
  { id: "explore",  label: "Explore",  emoji: "🔍" },
  { id: "progress", label: "Progress", emoji: "📈" },
  { id: "profile",  label: "Profile",  emoji: "👤" },
];
const NAV_MORE = [
  { id: "leaderboard", label: "Leaderboard", emoji: "🏆" },
  { id: "settings",    label: "Settings",    emoji: "⚙️"  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeNav, onNav }: { activeNav: string; onNav: (id: string) => void }) {
  const u = MOCK_USER;
  const xpPct = Math.round(Math.min(u.xp / u.xpForNextLevel, 1) * 100);

  return (
    <View style={s.sidebar}>
      {/* Brand */}
      <View style={s.brand}>
        <View style={s.brandIco}>
          <Text style={s.brandIcoTxt}>◈</Text>
        </View>
        <Text style={s.brandName}>EduApp</Text>
      </View>

      {/* User card */}
      <View style={s.userCard}>
        <View style={s.userRow}>
          <View style={s.sbAvatar}>
            <Text style={s.sbAvatarTxt}>{u.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sbName}>{u.name}</Text>
            <Text style={s.sbHandle}>{u.handle}</Text>
          </View>
        </View>

        <View style={s.lvlPill}>
          <Text style={s.lvlTxt}>⭐ Level {u.level}</Text>
        </View>

        <View style={s.xpRow}>
          <Text style={s.xpRowLbl}>XP Progress</Text>
          <Text style={s.xpRowPct}>{xpPct}%</Text>
        </View>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${xpPct}%` as any }]} />
          <View style={[s.xpShimmer, { left: `${Math.max(xpPct - 3, 0)}%` as any }]} />
        </View>
        <Text style={s.xpHint}>{u.xpToNextLevel} XP to level {u.level + 1}</Text>
      </View>

      {/* Nav */}
      <Text style={s.navSec}>MENU</Text>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.navItem, activeNav === item.id && s.navItemActive]}
          onPress={() => onNav(item.id)}
          activeOpacity={0.75}
        >
          <Text style={s.navIco}>{item.emoji}</Text>
          <Text style={[s.navLbl, activeNav === item.id && s.navLblActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      <Text style={s.navSec}>MORE</Text>
      {NAV_MORE.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.navItem, activeNav === item.id && s.navItemActive]}
          onPress={() => onNav(item.id)}
          activeOpacity={0.75}
        >
          <Text style={s.navIco}>{item.emoji}</Text>
          <Text style={[s.navLbl, activeNav === item.id && s.navLblActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Stat cards */}
      <View style={s.statsArea}>
        <View style={s.statCard}>
          <Text style={s.statVal}>🔥 {u.streak}</Text>
          <Text style={s.statLbl}>day streak</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statVal}>#{u.rank}</Text>
          <Text style={s.statLbl}>global rank</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner() {
  const h = MOCK_HERO;
  const pct = Math.round(h.progress * 100);
  return (
    <TouchableOpacity
      style={s.hero}
      activeOpacity={0.9}
      onPress={() => router.push(`/lesson/${h.lessonId}` as any)}
    >
      {/* Caustic light rings */}
      <View style={[s.caustic, s.cA]} />
      <View style={[s.caustic, s.cB]} />
      <View style={[s.caustic, s.cC]} />
      <View style={[s.caustic, s.cD]} />

      {/* Left content */}
      <View style={s.heroLeft}>
        <View>
          <View style={s.heroTag}>
            <Text style={s.heroTagTxt}>🌊  {h.tag.toUpperCase()}</Text>
          </View>
          <Text style={s.heroTitle}>{h.title}</Text>
          <Text style={s.heroSub}>{h.subtitle}</Text>
          <View style={s.heroChips}>
            {[`⏱ ${h.timeLabel}`, `● ${h.difficulty}`, `✦ ${h.xpReward}`].map((c) => (
              <View key={c} style={s.heroChip}>
                <Text style={s.heroChipTxt}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.heroBottom}>
          <View style={s.heroPTrack}>
            <View style={[s.heroPFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.heroPct}>{pct}%</Text>
          <TouchableOpacity style={s.heroCta} activeOpacity={0.85}>
            <Text style={s.heroCtaTxt}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right: decorative caustic rings only (no extra elements needed) */}
      <View style={s.heroRight} />
    </TouchableOpacity>
  );
}

// ─── Subject grid (3-col) ─────────────────────────────────────────────────────

function SubjectGrid({ filter }: { filter: SubjectFilter }) {
  const visible = filter === "All" ? SUBJECTS : SUBJECTS.filter((x) => x.category === filter);
  return (
    <View style={s.subGrid}>
      {visible.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.subCard, item.locked && { opacity: 0.55 }]}
          activeOpacity={item.locked ? 1 : 0.85}
          disabled={item.locked}
        >
          <View style={[s.subTop, { backgroundColor: item.bg }]}>
            <View style={[s.sc1, { backgroundColor: item.glow + "45" }]} />
            <View style={[s.sc2, { backgroundColor: item.glow + "28" }]} />
            <View style={s.sc3} />
            <Text style={s.subEmoji}>{item.emoji}</Text>
          </View>
          <View style={s.subBody}>
            <Text style={s.subName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.subCount}>{item.count}</Text>
            {!item.locked ? (
              <View style={s.subPTrack}>
                <View
                  style={[s.subPFill, {
                    width: `${Math.round(item.progress * 100)}%` as any,
                    backgroundColor: item.bg,
                  }]}
                />
              </View>
            ) : (
              <Text style={s.subLock}>🔒 LOCKED</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Activity table ───────────────────────────────────────────────────────────

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  done:          { bg: "#D1FAE5", color: "#065F46", label: "Done"        },
  "in-progress": { bg: "#CFFAFE", color: "#0E7490", label: "In Progress" },
  new:           { bg: "#E0F2FE", color: "#0369A1", label: "New"         },
};

function ActivityTable() {
  return (
    <View style={s.actBox}>
      <View style={s.actHead}>
        {["LESSON", "SUBJECT", "TIME", "STATUS"].map((h) => (
          <Text key={h} style={s.actHeadTxt}>{h}</Text>
        ))}
      </View>
      {ACTIVITY.map((item, i) => {
        const st = STATUS[item.status];
        return (
          <TouchableOpacity
            key={item.id}
            style={[s.actRow, i === ACTIVITY.length - 1 && { borderBottomWidth: 0 }]}
            activeOpacity={0.75}
          >
            <View style={s.actCell}>
              <View style={s.actIco}>
                <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              </View>
              <View>
                <Text style={s.actName}>{item.name}</Text>
                <Text style={s.actChapter}>{item.chapter}</Text>
              </View>
            </View>
            <Text style={s.actSubject}>{item.subject}</Text>
            <Text style={s.actTime}>{item.time}</Text>
            <View style={[s.actBadge, { backgroundColor: st.bg }]}>
              <Text style={[s.actBadgeTxt, { color: st.color }]}>{st.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeDesktopScreen() {
  const [activeNav, setActiveNav] = useState("home");
  const [filter, setFilter] = useState<SubjectFilter>("All");
  const [search, setSearch] = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View style={s.root}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <View style={s.tbIco}><Text style={s.tbIcoTxt}>◈</Text></View>
          <Text style={s.tbBrand}>EduApp</Text>
        </View>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14, opacity: 0.35 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search subjects, topics…"
            placeholderTextColor={o.dim}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={s.topRight}>
          <Text style={s.topStreak}>🔥 {MOCK_USER.streak}-day streak</Text>
          <TouchableOpacity style={s.topBell}>
            <Text style={{ fontSize: 14 }}>🔔</Text>
            {MOCK_USER.notifications > 0 && <View style={s.topBellDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Shell ── */}
      <View style={s.shell}>
        <Sidebar activeNav={activeNav} onNav={setActiveNav} />

        {/* Main */}
        <ScrollView
          style={s.main}
          contentContainerStyle={s.mainContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={s.greetRow}>
            <Text style={s.greetTitle}>{greeting}, Alexandra! 👋</Text>
            <Text style={s.greetSub}>Ready to make waves today?</Text>
          </View>

          {/* Hero */}
          <HeroBanner />

          {/* Explore */}
          <View style={s.secHdr}>
            <Text style={s.secTitle}>Explore Subjects</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[s.pill, filter === f && s.pillActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.75}
              >
                <Text style={[s.pillTxt, filter === f && s.pillTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SubjectGrid filter={filter} />

          {/* Activity */}
          <View style={[s.secHdr, { marginTop: spacing.lg }]}>
            <Text style={s.secTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          <ActivityTable />
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SIDEBAR_W = 218;

const AQUA_SHADOW = {
  shadowColor: "#06B6D4",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.14,
  shadowRadius: 14,
  elevation: 4,
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: o.bg, minHeight: "100%" as any },

  // ── Top bar
  topBar: {
    height: 52,
    backgroundColor: o.card,
    borderBottomWidth: 1,
    borderBottomColor: o.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  topLeft:  { flexDirection: "row", alignItems: "center", gap: 8, width: SIDEBAR_W - 20 },
  tbIco: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: o.mid,
    justifyContent: "center", alignItems: "center",
  },
  tbIcoTxt:  { fontSize: 14, fontWeight: fontWeight.black, color: "#FFF" },
  tbBrand:   { fontSize: 15, fontWeight: fontWeight.black, color: o.text },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: o.bg,
    borderWidth: 1.5,
    borderColor: o.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 13,
    fontWeight: fontWeight.medium,
    color: o.muted,
    flex: 1,
    outlineStyle: "none" as any,
  },
  topRight:  { flexDirection: "row", alignItems: "center", gap: 12 },
  topStreak: { fontSize: 12, fontWeight: fontWeight.bold, color: "#EA580C" },
  topBell: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: o.bg,
    borderWidth: 1.5, borderColor: o.border,
    justifyContent: "center", alignItems: "center",
  },
  topBellDot: {
    position: "absolute", top: 5, right: 5,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#F87171",
    borderWidth: 1.5, borderColor: o.card,
  },

  // ── Shell
  shell: { flex: 1, flexDirection: "row" },

  // ── Sidebar
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: o.sideBar,
    borderRightWidth: 1,
    borderRightColor: o.border,
    padding: 16,
    overflow: "hidden" as any,
  },
  brand:    { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 16 },
  brandIco: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: o.mid,
    justifyContent: "center", alignItems: "center",
  },
  brandIcoTxt: { fontSize: 13, fontWeight: fontWeight.black, color: "#FFF" },
  brandName:   { fontSize: 14, fontWeight: fontWeight.black, color: o.text },

  userCard: {
    backgroundColor: o.bg,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: o.border,
  },
  userRow:    { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  sbAvatar: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: o.mid,
    justifyContent: "center", alignItems: "center",
  },
  sbAvatarTxt: { fontSize: 12, fontWeight: fontWeight.black, color: "#FFF" },
  sbName:      { fontSize: 12, fontWeight: fontWeight.extrabold, color: o.text, lineHeight: 17 },
  sbHandle:    { fontSize: 10, color: o.muted },

  lvlPill: {
    alignSelf: "flex-start",
    backgroundColor: o.mid,
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: 8,
  },
  lvlTxt: { fontSize: 10, fontWeight: fontWeight.bold, color: "#FFF" },

  xpRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpRowLbl:{ fontSize: 10, fontWeight: fontWeight.semibold, color: o.mid },
  xpRowPct:{ fontSize: 10, color: o.muted },
  xpTrack: { height: 8, backgroundColor: o.bgTint, borderRadius: radius.pill, overflow: "hidden", position: "relative" },
  xpFill:  { height: "100%", backgroundColor: o.mid, borderRadius: radius.pill },
  xpShimmer: {
    position: "absolute",
    width: 5, height: "100%",
    backgroundColor: "rgba(255,255,255,0.50)",
    borderRadius: 3,
  },
  xpHint: { fontSize: 9, color: o.dim, marginTop: 5 },

  navSec: {
    fontSize: 9, fontWeight: fontWeight.bold, color: o.dim,
    letterSpacing: 1.5,
    textTransform: "uppercase" as any,
    paddingVertical: 9, paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: "row", alignItems: "center", gap: 9,
    paddingVertical: 7, paddingHorizontal: 10,
    borderRadius: 10, marginBottom: 1,
  },
  navItemActive: { backgroundColor: o.bgTint },
  navIco:        { fontSize: 16 },
  navLbl:        { fontSize: 13, fontWeight: fontWeight.semibold, color: o.muted },
  navLblActive:  { color: o.mid, fontWeight: fontWeight.extrabold },

  statsArea: { marginTop: "auto" as any, flexDirection: "row", gap: 7, paddingTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: o.bg,
    borderRadius: 11, padding: 10,
    borderWidth: 1, borderColor: o.border,
    alignItems: "center",
  },
  statVal: { fontSize: 15, fontWeight: fontWeight.black, color: o.text },
  statLbl: { fontSize: 9, color: o.muted, marginTop: 2 },

  // ── Main
  main:        { flex: 1 },
  mainContent: { padding: spacing.lg, gap: 20 },

  greetRow:   { gap: 3 },
  greetTitle: { fontSize: 22, fontWeight: fontWeight.black, color: o.text, letterSpacing: -0.5 },
  greetSub:   { fontSize: 13, color: o.muted },

  // ── Hero banner
  hero: {
    backgroundColor: o.deep,
    borderRadius: 22,
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 180,
    shadowColor: o.deep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  caustic: { position: "absolute", borderRadius: 9999 },
  cA: { width: 280, height: 280, top: -100, right: -80,  backgroundColor: "rgba(255,255,255,0.05)" },
  cB: { width: 160, height: 160, bottom: -60, left: -20, backgroundColor: "rgba(255,255,255,0.06)" },
  cC: { width: 90,  height: 90,  top: 20,  right: 100,   backgroundColor: "rgba(255,255,255,0.08)" },
  cD: { width: 55,  height: 55,  top: 65,  right: 55,    backgroundColor: "rgba(255,255,255,0.10)" },

  heroLeft:  { flex: 1, padding: 28, justifyContent: "space-between" },
  heroRight: { width: 120 },

  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 8,
  },
  heroTagTxt: { fontSize: 10, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.9)", letterSpacing: 0.8 },
  heroTitle:  {
    fontSize: 26, fontWeight: fontWeight.black, color: "#FFF",
    lineHeight: 31, marginBottom: 5, letterSpacing: -0.5,
  },
  heroSub:    { fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: fontWeight.medium, marginBottom: 12 },
  heroChips:  { flexDirection: "row", gap: 7, flexWrap: "wrap" as any },
  heroChip:   {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heroChipTxt: { fontSize: 11, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.9)" },
  heroBottom:  { flexDirection: "row", alignItems: "center", gap: 12 },
  heroPTrack:  { flex: 1, height: 7, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: radius.pill, overflow: "hidden" },
  heroPFill:   { height: "100%", backgroundColor: "#A5F3FC", borderRadius: radius.pill },
  heroPct:     { fontSize: 13, fontWeight: fontWeight.extrabold, color: "#FFF" },
  heroCta: {
    backgroundColor: "#FFF",
    borderRadius: 11,
    paddingVertical: 9, paddingHorizontal: 18,
  },
  heroCtaTxt: { fontSize: 12, fontWeight: fontWeight.extrabold, color: o.deep },

  // ── Section headers
  secHdr:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  secTitle: { fontSize: 16, fontWeight: fontWeight.extrabold, color: o.text, letterSpacing: -0.3 },
  seeAll:   { fontSize: 12, fontWeight: fontWeight.semibold, color: o.mid },

  // ── Filter pills
  filterRow:     { gap: 7, paddingBottom: 14 },
  pill:          { borderRadius: radius.pill, paddingHorizontal: 15, paddingVertical: 7, backgroundColor: o.card, borderWidth: 1.5, borderColor: o.border },
  pillActive:    { backgroundColor: o.mid, borderColor: o.mid },
  pillTxt:       { fontSize: 11, fontWeight: fontWeight.bold, color: o.muted },
  pillTxtActive: { color: "#FFF" },

  // ── Subject grid (3-col)
  subGrid: { flexDirection: "row", flexWrap: "wrap" as any, gap: 12 },
  subCard: {
    width: "31%" as any,
    backgroundColor: o.card,
    borderRadius: 16,
    overflow: "hidden",
    ...AQUA_SHADOW,
  },
  subTop:  { height: 80, justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden" },
  sc1: { position: "absolute", width: 80, height: 80, borderRadius: 40, top: -24, right: -20 },
  sc2: { position: "absolute", width: 46, height: 46, borderRadius: 23, bottom: -14, left: 8  },
  sc3: { position: "absolute", width: 32, height: 32, borderRadius: 16, top: 8, right: 32, backgroundColor: "rgba(255,255,255,0.10)" },
  subEmoji:  { fontSize: 30, zIndex: 1 },
  subBody:   { padding: 10 },
  subName:   { fontSize: 12, fontWeight: fontWeight.extrabold, color: o.text, marginBottom: 2 },
  subCount:  { fontSize: 10, color: o.muted, marginBottom: 7 },
  subPTrack: { height: 4, backgroundColor: o.bgTint, borderRadius: radius.pill, overflow: "hidden" },
  subPFill:  { height: "100%", borderRadius: radius.pill },
  subLock:   { fontSize: 9, fontWeight: fontWeight.bold, color: o.dim, marginTop: 4 },

  // ── Activity table
  actBox: { backgroundColor: o.card, borderRadius: 16, overflow: "hidden", ...AQUA_SHADOW },
  actHead: {
    flexDirection: "row",
    paddingVertical: 10, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: o.bg,
  },
  actHeadTxt: {
    flex: 1, fontSize: 9, fontWeight: fontWeight.bold,
    color: o.dim, letterSpacing: 1.2,
    textTransform: "uppercase" as any,
  },
  actRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: o.bg,
  },
  actCell:    { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  actIco:     { width: 34, height: 34, borderRadius: 10, backgroundColor: o.bgTint, justifyContent: "center", alignItems: "center" },
  actName:    { fontSize: 13, fontWeight: fontWeight.bold, color: o.text },
  actChapter: { fontSize: 10, color: o.muted, marginTop: 1 },
  actSubject: { flex: 1, fontSize: 12, color: o.muted, fontWeight: fontWeight.medium },
  actTime:    { flex: 1, fontSize: 11, color: o.dim },
  actBadge:   { borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  actBadgeTxt:{ fontSize: 10, fontWeight: fontWeight.bold },
});
