// âââ Home Screen â Desktop / Web layout âââ
// Renders when Platform.OS === 'web' (Expo web via React Native Web).
// Layout: macOS-style title bar + fixed left sidebar + scrollable main area.
//
// Usage: In app/(tabs)/_layout.tsx (web), swap home.tsx for this file,
// or use a responsive wrapper that mounts one or the other based on
// useWindowDimensions().width >= 768.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadow,
} from "../../src/theme/tokens";

// âââ Mock data (same shapes as mobile â replace with Supabase queries in M3) ââ

const MOCK_USER = {
  initials: "AJ",
  name: "Alexandra J.",
  handle: "@alex_learns",
  coins: 4892,
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
  subtitle: "Mathematics Â· Chapter 4 of 8",
  timeLabel: "5â7 min",
  difficulty: "HARD",
  xpReward: "250 XP",
  progress: 0.78,
  lessonId: "lesson-quadratic-1",
};

type SubjectFilter = "All" | "Math" | "Science" | "Language" | "History" | "Logic" | "Art";
const FILTERS: SubjectFilter[] = ["All", "Math", "Science", "Language", "History", "Logic", "Art"];

const SUBJECTS = [
  { id: "math", name: "Mathematics", emoji: "ð", count: "150+ Questions", progress: 0.79, color: "#4A8ED4", category: "Math" as SubjectFilter, locked: false },
  { id: "science", name: "Science Lab", emoji: "ð¬", count: "120+ Questions", progress: 0.45, color: "#00C4A7", category: "Science" as SubjectFilter, locked: false },
  { id: "language", name: "Language Arts", emoji: "ð", count: "200+ Questions", progress: 0.30, color: "#FF6B6B", category: "Language" as SubjectFilter, locked: false },
  { id: "history", name: "World History", emoji: "ðï¸", count: "90+ Questions", progress: 0.12, color: "#F59E0B", category: "History" as SubjectFilter, locked: false },
  { id: "logic", name: "Logic & Puzzles", emoji: "ð§©", count: "Coming soon", progress: 0, color: "#9090B8", category: "Logic" as SubjectFilter, locked: true },
  { id: "art", name: "Creative Arts", emoji: "ð¨", count: "Coming soon", progress: 0, color: "#B0B0D0", category: "Art" as SubjectFilter, locked: true },
];

const ACTIVITY = [
  { id: "a1", emoji: "ð", name: "Calculus Integration", chapter: "Chapter 3", subject: "Mathematics", time: "2 hours ago", status: "done" },
  { id: "a2", emoji: "âï¸", name: "Newton's Laws of Motion", chapter: "Chapter 2", subject: "Physics", time: "5 hours ago", status: "in-progress" },
  { id: "a3", emoji: "ð", name: "Essay Structure Basics", chapter: "Chapter 1", subject: "Language Arts", time: "Yesterday", status: "new" },
];

const NAV_ITEMS = [
  { id: "home", label: "Home", emoji: "ð " },
  { id: "explore", label: "Explore", emoji: "ð" },
  { id: "progress", label: "Progress", emoji: "ð" },
  { id: "profile", label: "Profile", emoji: "ð¤" },
];
const NAV_MORE = [
  { id: "leaderboard", label: "Leaderboard", emoji: "ð" },
  { id: "settings", label: "Settings", emoji: "âï¸" },
];

// âââ Sidebar âââââââââââââââââââââââââââââââââââââââââââââââââââââ

function Sidebar({ activeNav, onNav }: { activeNav: string; onNav: (id: string) => void }) {
  const u = MOCK_USER;
  const xpPct = Math.round(Math.min(u.xp / u.xpForNextLevel, 1) * 100);

  return (
    <View style={s.sidebar}>
      {/* Brand */}
      <View style={s.brand}>
        <View style={s.brandIco}><Text style={s.brandIcoTxt}>â¦</Text></View>
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
          <Text style={s.lvlTxt}>â­ Level {u.level}</Text>
        </View>

        <View style={s.xpRow}>
          <Text style={s.xpRowLbl}>Experience</Text>
          <Text style={s.xpRowPct}>{xpPct}%</Text>
        </View>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${xpPct}%` as any }]} />
        </View>

        <View style={s.coinRow}>
          <View style={s.coinDot} />
          <Text style={s.coinVal}>{u.coins.toLocaleString()} XP</Text>
          <Text style={s.coinSub}>{u.xpToNextLevel} to Lvl {u.level + 1}</Text>
        </View>
      </View>

      {/* Nav */}
      <Text style={s.navSec}>Menu</Text>
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
      <Text style={s.navSec}>More</Text>
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

      {/* Quick stats */}
      <View style={s.statsArea}>
        <View style={s.statCard}>
          <View>
            <Text style={s.statLbl}>Current Streak</Text>
            <Text style={s.statSub}>Keep it up!</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.statVal}>ð¥ {MOCK_USER.streak}</Text>
            <Text style={s.statUnit}>days</Text>
          </View>
        </View>
        <View style={s.statCard}>
          <View>
            <Text style={s.statLbl}>Global Rank</Text>
            <Text style={s.statSub}>Top 5%</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.statVal}>#{MOCK_USER.rank}</Text>
            <Text style={s.statUnit}>worldwide</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// âââ Hero Banner âââââââââââââââââââââââââââââââââââââââââââââââââ

function HeroBanner() {
  const h = MOCK_HERO;
  return (
    <TouchableOpacity
      style={s.hero}
      activeOpacity={0.9}
      onPress={() => router.push(`/lesson/${h.lessonId}` as any)}
    >
      {/* Left content */}
      <View style={s.heroLeft}>
        <View>
          <Text style={s.heroTag}>ð {h.tag.toUpperCase()}</Text>
          <Text style={s.heroTitle}>{h.title}</Text>
          <Text style={s.heroSub}>{h.subtitle}</Text>
          <View style={s.heroChips}>
            {[`â± ${h.timeLabel}`, `â ${h.difficulty}`, `â¦ ${h.xpReward}`].map((c) => (
              <View key={c} style={[s.heroChip, c.includes("HARD") && s.heroChipHard]}>
                <Text style={s.heroChipTxt}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.heroBottom}>
          <View style={s.heroPTrack}>
            <View style={[s.heroPFill, { width: `${Math.round(h.progress * 100)}%` as any }]} />
          </View>
          <Text style={s.heroPct}>{Math.round(h.progress * 100)}%</Text>
          <TouchableOpacity style={s.heroCta} activeOpacity={0.85}>
            <Text style={s.heroCtaTxt}>Continue â</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right decorative area */}
      <View style={s.heroRight}>
        <View style={[s.hrc, s.hrc1]} />
        <View style={[s.hrc, s.hrc2]} />
        <View style={[s.hrc, s.hrc3]} />
        <View style={s.hrd} />
      </View>
    </TouchableOpacity>
  );
}

// âââ Subject grid (3-col) ââââââââââââââââââââââââââââââââââââââââ

function SubjectGrid({ filter }: { filter: SubjectFilter }) {
  const visible = filter === "All" ? SUBJECTS : SUBJECTS.filter((x) => x.category === filter);
  return (
    <View style={s.subGrid}>
      {visible.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.subCard, item.locked && s.subCardLocked]}
          activeOpacity={item.locked ? 1 : 0.85}
          disabled={item.locked}
        >
          <View style={[s.subTop, { backgroundColor: item.color }]}>
            <View style={[s.subC1, { backgroundColor: item.color + "55" }]} />
            <View style={[s.subC2, { backgroundColor: item.color + "33" }]} />
            <Text style={s.subEmoji}>{item.emoji}</Text>
          </View>
          <View style={s.subBody}>
            <Text style={[s.subName, item.locked && { color: colors.textMuted }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={s.subCount}>{item.count}</Text>
            {!item.locked ? (
              <View style={s.subPTrack}>
                <View style={[s.subPFill, { width: `${Math.round(item.progress * 100)}%` as any, backgroundColor: item.color }]} />
              </View>
            ) : (
              <Text style={s.lockLbl}>ð LOCKED</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// âââ Activity table âââââââââââââââââââââââââââââââââââââââââââââââ

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  done: { bg: "#D1FAE5", color: "#065F46", label: "Answered" },
  "in-progress": { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  new: { bg: "#EDE9FE", color: "#4C1D95", label: "New" },
};

const ICON_BG: Record<string, string> = {
  "ð": "#F0E8FF",
  "âï¸": "#DFF7F4",
  "ð": "#FFE8EC",
};

function ActivityTable() {
  return (
    <View style={s.actBox}>
      {/* Header */}
      <View style={s.actHead}>
        {["LESSON", "SUBJECT", "TIME", "STATUS"].map((h) => (
          <Text key={h} style={s.actHeadTxt}>{h}</Text>
        ))}
      </View>
      {/* Rows */}
      {ACTIVITY.map((item, i) => {
        const st = STATUS_STYLE[item.status];
        return (
          <TouchableOpacity key={item.id} style={[s.actRow, i === ACTIVITY.length - 1 && { borderBottomWidth: 0 }]} activeOpacity={0.75}>
            <View style={s.actCell}>
              <View style={[s.actIco, { backgroundColor: ICON_BG[item.emoji] ?? "#F0E8FF" }]}>
                <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              </View>
              <View>
                <Text style={s.actName}>{item.name}</Text>
                <Text style={s.actChapter}>{item.chapter}</Text>
              </View>
            </View>
            <Text style={s.actSubject}>{item.subject}</Text>
            <Text style={s.actTime}>{item.time}</Text>
            <View>
              <View style={[s.actBadge, { backgroundColor: st.bg }]}>
                <Text style={[s.actBadgeTxt, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// âââ Main Screen âââââââââââââââââââââââââââââââââââââââââââââââââ

export default function HomeDesktopScreen() {
  const [activeNav, setActiveNav] = useState("home");
  const [filter, setFilter] = useState<SubjectFilter>("All");
  const [search, setSearch] = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View style={s.root}>
      {/* ââ macOS title bar ââ */}
      <View style={s.titleBar}>
        <View style={s.trafficLights}>
          <View style={[s.tl, { backgroundColor: "#FF5F57" }]} />
          <View style={[s.tl, { backgroundColor: "#FFBD2E" }]} />
          <View style={[s.tl, { backgroundColor: "#28C840" }]} />
        </View>
        <View style={s.titleMid}>
          <View style={s.titleIco}><Text style={s.titleIcoTxt}>â¦</Text></View>
          <Text style={s.titleName}>EduApp Â· Home</Text>
        </View>
        <View style={s.titleRight}>
          <Text style={s.titleTime}>9:41 AM</Text>
          <TouchableOpacity style={s.titleBell}>
            <Text style={{ fontSize: 13 }}>ð</Text>
            {MOCK_USER.notifications > 0 && <View style={s.titleBellDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ââ App shell ââ */}
      <View style={s.shell}>
        <Sidebar activeNav={activeNav} onNav={setActiveNav} />

        {/* Main content */}
        <ScrollView style={s.main} contentContainerStyle={s.mainContent} showsVerticalScrollIndicator={false}>
          {/* Greeting + search */}
          <View style={s.topBar}>
            <View>
              <Text style={s.greetTitle}>{greeting}, Alexandra! ð</Text>
              <Text style={s.greetSub}>You're on a {MOCK_USER.streak}-day streak â keep going!</Text>
            </View>
            <View style={s.searchBox}>
              <Text style={{ fontSize: 14, opacity: 0.4 }}>ð</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Search subjects, topicsâ¦"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* Hero */}
          <HeroBanner />

          {/* Explore */}
          <View style={s.secHdr}>
            <Text style={s.secTitle}>Explore Subjects</Text>
            <TouchableOpacity activeOpacity={0.7}><Text style={s.seeAll}>See all â</Text></TouchableOpacity>
          </View>

          {/* Filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity key={f} style={[s.pill, filter === f && s.pillActive]} onPress={() => setFilter(f)} activeOpacity={0.75}>
                <Text style={[s.pillTxt, filter === f && s.pillTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SubjectGrid filter={filter} />

          {/* Activity */}
          <View style={[s.secHdr, { marginTop: spacing.lg }]}>
            <Text style={s.secTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}><Text style={s.seeAll}>See all â</Text></TouchableOpacity>
          </View>

          <ActivityTable />

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// âââ Styles âââââââââââââââââââââââââââââââââââââââââââââââââââââ

const SIDEBAR_W = 210;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#160D38", minHeight: "100%" as any },

  // Title bar
  titleBar: {
    height: 46,
    backgroundColor: "#1C1040",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  trafficLights: { flexDirection: "row", gap: 8 },
  tl: { width: 13, height: 13, borderRadius: 7 },
  titleMid: {
    position: "absolute" as any,
    left: "50%" as any,
    transform: [{ translateX: -60 }],
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  titleIco: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: colors.violet,
    justifyContent: "center", alignItems: "center",
  },
  titleIcoTxt: { fontSize: 13, fontWeight: fontWeight.black, color: "#FFF" },
  titleName: { fontSize: 13, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.55)" },
  titleRight: { marginLeft: "auto" as any, flexDirection: "row", alignItems: "center", gap: 14 },
  titleTime: { fontSize: 12, color: "rgba(255,255,255,0.38)", fontWeight: fontWeight.semibold },
  titleBell: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "center", alignItems: "center",
  },
  titleBellDot: {
    position: "absolute", top: 5, right: 5,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.coral,
    borderWidth: 1.5, borderColor: "#160D38",
  },

  // Shell
  shell: { flex: 1, flexDirection: "row", overflow: "hidden" },

  // Sidebar
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: "#FEFEFE",
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.07)",
    padding: 16,
    overflow: "hidden" as any,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 18 },
  brandIco: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: colors.violet,
    justifyContent: "center", alignItems: "center",
  },
  brandIcoTxt: { fontSize: 14, fontWeight: fontWeight.black, color: "#FFF" },
  brandName: { fontSize: 15, fontWeight: fontWeight.black, color: colors.textPrimary },

  // User card
  userCard: {
    backgroundColor: "#EBF4FF",
    borderRadius: radius.lg,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(108,60,225,0.12)",
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  sbAvatar: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: colors.violet,
    justifyContent: "center", alignItems: "center",
  },
  sbAvatarTxt: { fontSize: 13, fontWeight: fontWeight.black, color: "#FFF" },
  sbName: { fontSize: 13, fontWeight: fontWeight.extrabold, color: colors.textPrimary, lineHeight: 18 },
  sbHandle: { fontSize: 10, color: colors.textMuted },
  lvlPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.violet,
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: 9,
  },
  lvlTxt: { fontSize: 10, fontWeight: fontWeight.bold, color: "#FFF" },
  xpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  xpRowLbl: { fontSize: 10, fontWeight: fontWeight.semibold, color: colors.violet },
  xpRowPct: { fontSize: 10, color: colors.textMuted },
  xpTrack: { height: 7, backgroundColor: "#BDD4FF", borderRadius: radius.pill, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: colors.violet, borderRadius: radius.pill },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.goldBg,
    borderRadius: 9,
    padding: 7,
    marginTop: 9,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    gap: 6,
  },
  coinDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: colors.gold },
  coinVal: { fontSize: 11, fontWeight: fontWeight.extrabold, color: "#A05A00" },
  coinSub: { fontSize: 9, color: "#B07800", marginLeft: "auto" as any },

  // Nav
  navSec: {
    fontSize: 9, fontWeight: fontWeight.bold,
    color: colors.textDim, letterSpacing: 1.5,
    textTransform: "uppercase" as any,
    paddingVertical: 10, paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: "row", alignItems: "center", gap: 9,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 11, marginBottom: 1,
  },
  navItemActive: {
    backgroundColor: colors.violet,
  },
  navIco: { fontSize: 16 },
  navLbl: { fontSize: 13, fontWeight: fontWeight.semibold, color: "#6060A0" },
  navLblActive: { color: "#FFF" },

  // Stats
  statsArea: { marginTop: "auto" as any, gap: 7, paddingTop: 14 },
  statCard: {
    backgroundColor: "#F8F8FF",
    borderRadius: 11,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EEEEFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLbl: { fontSize: 10, color: colors.textMuted, fontWeight: fontWeight.medium },
  statSub: { fontSize: 9, color: colors.textDim },
  statVal: { fontSize: 15, fontWeight: fontWeight.black, color: colors.textPrimary, textAlign: "right" as any },
  statUnit: { fontSize: 9, color: colors.textDim, textAlign: "right" as any },

  // Main
  main: { flex: 1 },
  mainContent: {
    padding: spacing.lg,
    backgroundColor: "#EBF4FF",
    minHeight: "100%" as any,
    gap: 20,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetTitle: { fontSize: 22, fontWeight: fontWeight.black, color: colors.textPrimary, letterSpacing: -0.5 },
  greetSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#BDD4FF",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 220,
    ...shadow.sm,
  },
  searchInput: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    flex: 1,
    outlineStyle: "none" as any,
  },

  // Hero
  hero: {
    backgroundColor: "#2B6CB0",
    borderRadius: 24,
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 188,
    ...shadow.hero,
  },
  heroLeft: {
    flex: 1,
    padding: 28,
    justifyContent: "space-between",
  },
  heroTag: { fontSize: 10, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.55)", letterSpacing: 2, marginBottom: 7 },
  heroTitle: { fontSize: 26, fontWeight: fontWeight.black, color: "#FFF", lineHeight: 30, marginBottom: 5, letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: fontWeight.medium, marginBottom: 12 },
  heroChips: { flexDirection: "row", gap: 7, flexWrap: "wrap" as any },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heroChipHard: { backgroundColor: "rgba(255,90,70,0.30)" },
  heroChipTxt: { fontSize: 11, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.9)" },
  heroBottom: { flexDirection: "row", alignItems: "center", gap: 14 },
  heroPTrack: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: radius.pill, overflow: "hidden" },
  heroPFill: { height: "100%", backgroundColor: "#FFF", borderRadius: radius.pill },
  heroPct: { fontSize: 13, fontWeight: fontWeight.extrabold, color: "#FFF" },
  heroCta: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 20,
  },
  heroCtaTxt: { fontSize: 13, fontWeight: fontWeight.extrabold, color: colors.violet },
  heroRight: { width: 180, position: "relative" as any, overflow: "hidden" },
  hrc: { position: "absolute", borderRadius: 9999 },
  hrc1: { width: 220, height: 220, top: -70, right: -60, backgroundColor: "rgba(255,255,255,0.08)" },
  hrc2: { width: 120, height: 120, bottom: -40, right: 10, backgroundColor: "rgba(255,255,255,0.07)" },
  hrc3: { width: 65, height: 65, top: 28, right: 80, backgroundColor: "rgba(255,255,255,0.09)" },
  hrd: {
    position: "absolute", width: 72, height: 72,
    top: "50%" as any, left: "50%" as any,
    marginTop: -36, marginLeft: -36,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ rotate: "45deg" }], borderRadius: 12,
  },

  // Section headers
  secHdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  secTitle: { fontSize: 16, fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -0.3 },
  seeAll: { fontSize: 12, fontWeight: fontWeight.semibold, color: colors.violet },

  // Filter pills
  filterRow: { gap: 7, paddingBottom: 14 },
  pill: {
    borderRadius: radius.pill, paddingHorizontal: 15, paddingVertical: 7,
    backgroundColor: "#FFF", borderWidth: 2, borderColor: "#BDD4FF",
  },
  pillActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  pillTxt: { fontSize: 11, fontWeight: fontWeight.bold, color: colors.textMuted },
  pillTxtActive: { color: "#FFF" },

  // Subject grid (3-col)
  subGrid: { flexDirection: "row", flexWrap: "wrap" as any, gap: 12 },
  subCard: {
    width: "31%" as any,
    backgroundColor: "#FFF",
    borderRadius: 18,
    overflow: "hidden",
    ...shadow.sm,
  },
  subCardLocked: { opacity: 0.6 },
  subTop: { height: 80, justifyContent: "center", alignItems: "center", position: "relative" },
  subC1: { position: "absolute", width: 78, height: 78, borderRadius: 39, top: -22, right: -18 },
  subC2: { position: "absolute", width: 42, height: 42, borderRadius: 21, bottom: -12, left: 10 },
  subEmoji: { fontSize: 30, zIndex: 1 },
  subBody: { padding: 12 },
  subName: { fontSize: 13, fontWeight: fontWeight.extrabold, color: colors.textPrimary, marginBottom: 2 },
  subCount: { fontSize: 10, color: colors.textMuted, marginBottom: 8 },
  subPTrack: { height: 5, backgroundColor: "#F0EAFF", borderRadius: radius.pill, overflow: "hidden" },
  subPFill: { height: "100%", borderRadius: radius.pill },
  lockLbl: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.textDim, marginTop: 4 },

  // Activity table
  actBox: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    overflow: "hidden",
    ...shadow.sm,
  },
  actHead: {
    flexDirection: "row",
    paddingVertical: 11, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: "#F0F0FA",
  },
  actHeadTxt: {
    flex: 1, fontSize: 9, fontWeight: fontWeight.bold,
    color: "#B8B8D0", letterSpacing: 1.2,
    textTransform: "uppercase" as any,
  },
  actRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: "#F8F8FF",
  },
  actCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  actIco: { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  actName: { fontSize: 13, fontWeight: fontWeight.bold, color: colors.textPrimary },
  actChapter: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  actSubject: { flex: 1, fontSize: 12, color: "#6060A0", fontWeight: fontWeight.medium },
  actTime: { flex: 1, fontSize: 11, color: colors.textDim },
  actBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actBadgeTxt: { fontSize: 10, fontWeight: fontWeight.bold },
});
