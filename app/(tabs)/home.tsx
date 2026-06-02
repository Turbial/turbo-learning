// ─── Home Screen — Ocean / Aqua theme, feed layout ───────────────────────
// Light, fluid, "looking through water" aesthetic.
// Mobile: full-width stacked subject cards (feed), caustic-light overlays.
// Switches to HomeDesktopScreen on web ≥ 768 px.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { spacing, radius, fontSize, fontWeight } from "../../src/theme/tokens";
import { appPalette as o } from "../../src/theme/palette";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  initials: "JD",
  name: "Jordan",
  level: 24,
  xp: 3692,
  xpToNextLevel: 308,
  xpForNextLevel: 4000,
  streak: 7,
  notifications: 2,
};

const MOCK_HERO = {
  tag: "Continue Learning",
  title: "Quadratic\nEquations",
  subtitle: "Mathematics · Chapter 4 of 8",
  timeLabel: "5–7 min",
  difficulty: "Medium",
  xpReward: "+250 XP",
  progress: 0.78,
  lessonId: "lesson-quadratic-1",
};

type SubjectFilter = "All" | "Math" | "Science" | "Language" | "History" | "Logic";
const FILTERS: SubjectFilter[] = ["All", "Math", "Science", "Language", "History", "Logic"];

const SUBJECTS = [
  { id: "math",     name: "Mathematics",    emoji: "📐", count: "150+ Questions", progress: 0.62, ...o.subjects[0], category: "Math"     as SubjectFilter, locked: false },
  { id: "science",  name: "Science Lab",    emoji: "🔬", count: "120+ Questions", progress: 0.35, ...o.subjects[1], category: "Science"  as SubjectFilter, locked: false },
  { id: "language", name: "Language Arts",  emoji: "📖", count: "200+ Questions", progress: 0.48, ...o.subjects[2], category: "Language" as SubjectFilter, locked: false },
  { id: "history",  name: "World History",  emoji: "🏛️", count: "90+ Questions",  progress: 0.12, ...o.subjects[3], category: "History"  as SubjectFilter, locked: false },
  { id: "logic",    name: "Logic & Puzzles", emoji: "🧩", count: "Coming soon",   progress: 0,    ...o.subjects[4], category: "Logic"    as SubjectFilter, locked: true  },
];

const ACTIVITY = [
  { id: "a1", emoji: "📐", name: "Linear Equations",  subject: "Mathematics",   time: "2h ago",    status: "done"        },
  { id: "a2", emoji: "🔬", name: "Cell Biology",       subject: "Science Lab",   time: "5h ago",    status: "in-progress" },
  { id: "a3", emoji: "📖", name: "Essay Structure",    subject: "Language Arts", time: "Yesterday", status: "done"        },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ initials }: { initials: string }) {
  return (
    <View style={s.avatar}>
      {/* glint circle — simulates light catching water surface */}
      <View style={s.avatarGlint} />
      <Text style={s.avatarTxt}>{initials}</Text>
    </View>
  );
}

function XPBar() {
  const u = MOCK_USER;
  const pct = Math.round(Math.min(u.xp / u.xpForNextLevel, 1) * 100);
  return (
    <View style={s.xpCard}>
      <View style={s.xpLeft}>
        <Text style={s.xpLevel}>⭐ Level {u.level}</Text>
        <Text style={s.xpSub}>{u.xpToNextLevel} XP to next level</Text>
      </View>
      <View style={s.xpRight}>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${pct}%` as any }]} />
          {/* water-surface shimmer at fill edge */}
          <View style={[s.xpShimmer, { left: `${Math.max(pct - 3, 0)}%` as any }]} />
        </View>
        <Text style={s.xpPct}>{pct}%</Text>
      </View>
    </View>
  );
}

function HeroCard() {
  const h = MOCK_HERO;
  const pct = Math.round(h.progress * 100);
  return (
    <TouchableOpacity
      style={s.hero}
      activeOpacity={0.92}
      onPress={() => router.push(`/lesson/${h.lessonId}` as any)}
    >
      {/* Caustic light rings — the underwater refraction effect */}
      <View style={[s.caustic, s.cA]} />
      <View style={[s.caustic, s.cB]} />
      <View style={[s.caustic, s.cC]} />
      <View style={[s.caustic, s.cD]} />

      {/* Content */}
      <View style={s.heroTag}>
        <Text style={s.heroTagTxt}>🌊  {h.tag.toUpperCase()}</Text>
      </View>

      <Text style={s.heroTitle}>{h.title}</Text>
      <Text style={s.heroSub}>{h.subtitle}</Text>

      <View style={s.heroChips}>
        {[`⏱ ${h.timeLabel}`, `📊 ${h.difficulty}`, `⭐ ${h.xpReward}`].map((c) => (
          <View key={c} style={s.heroChip}>
            <Text style={s.heroChipTxt}>{c}</Text>
          </View>
        ))}
      </View>

      <View style={s.heroPRow}>
        <View style={s.heroPTrack}>
          <View style={[s.heroPFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={s.heroPct}>{pct}%</Text>
      </View>

      <TouchableOpacity style={s.heroCta} activeOpacity={0.85}>
        <Text style={s.heroCtaTxt}>Continue →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function SubjectCard({ item }: { item: (typeof SUBJECTS)[0] }) {
  return (
    <TouchableOpacity
      style={[s.subCard, item.locked && s.subCardLocked]}
      activeOpacity={item.locked ? 1 : 0.88}
      disabled={item.locked}
    >
      {/* Coloured top panel with caustics */}
      <View style={[s.subTop, { backgroundColor: item.bg }]}>
        <View style={[s.sc1, { backgroundColor: item.glow + "45" }]} />
        <View style={[s.sc2, { backgroundColor: item.glow + "28" }]} />
        <View style={s.sc3} />
        <Text style={s.subEmoji}>{item.emoji}</Text>
        {!item.locked && (
          <View style={s.subXpChip}>
            <Text style={s.subXpTxt}>+XP</Text>
          </View>
        )}
        {item.locked && (
          <View style={s.subLockOverlay}>
            <Text style={{ fontSize: 20 }}>🔒</Text>
            <Text style={s.subLockedTxt}>LOCKED</Text>
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={s.subBody}>
        <View style={{ flex: 1 }}>
          <Text style={s.subName}>{item.name}</Text>
          <Text style={s.subCount}>{item.count}</Text>
        </View>
        {!item.locked ? (
          <View style={s.subMeta}>
            <View style={s.subPTrack}>
              <View
                style={[s.subPFill, {
                  width: `${Math.round(item.progress * 100)}%` as any,
                  backgroundColor: item.bg,
                }]}
              />
            </View>
            <Text style={[s.subPct, { color: item.bg }]}>
              {Math.round(item.progress * 100)}%
            </Text>
            <Text style={[s.subArrow, { color: item.bg }]}>→</Text>
          </View>
        ) : (
          <Text style={s.subLockLabel}>COMING SOON</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ActivityRow({ item }: { item: (typeof ACTIVITY)[0] }) {
  const done = item.status === "done";
  return (
    <View style={s.actCard}>
      <View style={s.actIcon}>
        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
      </View>
      <View style={s.actInfo}>
        <Text style={s.actName}>{item.name}</Text>
        <Text style={s.actSub}>{item.subject} · {item.time}</Text>
      </View>
      <View style={[s.actBadge, done ? s.badgeDone : s.badgeProg]}>
        <Text style={[s.actBadgeTxt, done ? s.badgeDoneTxt : s.badgeProgTxt]}>
          {done ? "✓ Done" : "In Progress"}
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<SubjectFilter>("All");

  // Swap to desktop layout on web
  if (Platform.OS === "web" && width >= 768) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Desktop = require("./HomeDesktop").default;
    return <Desktop />;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const visible = filter === "All" ? SUBJECTS : SUBJECTS.filter((x) => x.category === filter);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={o.bg} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.hdr}>
          <View style={s.hdrLeft}>
            <Avatar initials={MOCK_USER.initials} />
            <View>
              <Text style={s.greeting}>{greeting} 🌊</Text>
              <Text style={s.userName}>{MOCK_USER.name}</Text>
            </View>
          </View>
          <View style={s.hdrRight}>
            <View style={s.streakBadge}>
              <Text style={s.streakTxt}>🔥 {MOCK_USER.streak}</Text>
            </View>
            <TouchableOpacity style={s.bell} activeOpacity={0.75}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
              {MOCK_USER.notifications > 0 && <View style={s.bellDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── XP bar ── */}
        <XPBar />

        {/* ── Hero card ── */}
        <HeroCard />

        {/* ── Explore ── */}
        <View style={s.secHdr}>
          <Text style={s.secTitle}>Explore Subjects</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
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

        {/* Subject feed */}
        <View style={s.feedList}>
          {visible.map((item) => (
            <SubjectCard key={item.id} item={item} />
          ))}
        </View>

        {/* ── Activity ── */}
        <View style={[s.secHdr, { marginTop: spacing.lg }]}>
          <Text style={s.secTitle}>Recent Activity</Text>
        </View>
        <View style={s.actList}>
          {ACTIVITY.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const AQUA_SHADOW = {
  shadowColor: o.bright,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.14,
  shadowRadius: 14,
  elevation: 4,
};

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: o.bg },
  scroll:  { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "android" ? spacing.lg : spacing.sm,
  },

  // ── Header
  hdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  hdrLeft:  { flexDirection: "row", alignItems: "center", gap: 12 },
  hdrRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  greeting: { fontSize: fontSize.xs, color: o.muted, fontWeight: fontWeight.medium },
  userName: {
    fontSize: fontSize.lg,
    color: o.text,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: o.mid,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarGlint: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    top: -6,
    right: -6,
  },
  avatarTxt: { fontSize: fontSize.md, fontWeight: fontWeight.black, color: "#FFF" },

  // Streak + bell
  streakBadge: {
    backgroundColor: o.streakBg,
    borderWidth: 1.5,
    borderColor: o.streakBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: o.streakText },

  bell: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: o.card,
    justifyContent: "center",
    alignItems: "center",
    ...AQUA_SHADOW,
  },
  bellDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F87171",
    borderWidth: 1.5,
    borderColor: o.card,
  },

  // ── XP bar card
  xpCard: {
    backgroundColor: o.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: o.border,
    ...AQUA_SHADOW,
  },
  xpLeft:  { gap: 2 },
  xpLevel: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: o.mid },
  xpSub:   { fontSize: fontSize.xs, color: o.muted },
  xpRight: { flex: 1, gap: 4 },
  xpTrack: {
    height: 10,
    backgroundColor: o.bgTint,
    borderRadius: radius.pill,
    overflow: "hidden",
    position: "relative",
  },
  xpFill: {
    height: "100%",
    backgroundColor: o.mid,
    borderRadius: radius.pill,
  },
  xpShimmer: {
    position: "absolute",
    width: 6,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 3,
  },
  xpPct: {
    fontSize: fontSize.xs,
    color: o.muted,
    fontWeight: fontWeight.semibold,
    textAlign: "right",
  },

  // ── Hero card
  hero: {
    backgroundColor: o.deep,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: "hidden",
    shadowColor: o.deep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 8,
  },
  // Caustic light rings (the "underwater" refraction effect)
  caustic: { position: "absolute", borderRadius: 9999 },
  cA: { width: 260, height: 260, top: -90,  right: -80, backgroundColor: "rgba(255,255,255,0.06)" },
  cB: { width: 150, height: 150, bottom: -55, left: -30,  backgroundColor: "rgba(255,255,255,0.07)" },
  cC: { width: 90,  height: 90,  top: 20,   right: 60,  backgroundColor: "rgba(255,255,255,0.08)" },
  cD: { width: 50,  height: 50,  top: 70,   right: 24,  backgroundColor: "rgba(255,255,255,0.10)" },

  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  heroTagTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.92)", letterSpacing: 0.8 },

  heroTitle: {
    fontSize: 30,
    fontWeight: fontWeight.black,
    color: "#FFF",
    lineHeight: 36,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.65)",
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },

  heroChips: { flexDirection: "row", gap: 8, marginBottom: spacing.md, flexWrap: "wrap" },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroChipTxt: { fontSize: fontSize.xs, color: "rgba(255,255,255,0.9)", fontWeight: fontWeight.semibold },

  heroPRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.md,
  },
  heroPTrack: {
    flex: 1,
    height: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  heroPFill: { height: "100%", backgroundColor: o.heroProgressFill, borderRadius: radius.pill },
  heroPct: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: "#FFF" },

  heroCta: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: "center",
  },
  heroCtaTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: o.heroCtaText, letterSpacing: 0.3 },

  // ── Section headers
  secHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  secTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: o.text, letterSpacing: -0.3 },
  seeAll:   { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: o.mid },

  // ── Filter pills
  filterRow: { gap: 8, paddingBottom: spacing.md },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: o.card,
    borderWidth: 1.5,
    borderColor: o.border,
  },
  pillActive:    { backgroundColor: o.mid, borderColor: o.mid },
  pillTxt:       { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: o.muted },
  pillTxtActive: { color: "#FFF" },

  // ── Subject feed
  feedList: { gap: 12, marginBottom: spacing.sm },

  subCard: {
    backgroundColor: o.card,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...AQUA_SHADOW,
  },
  subCardLocked: { opacity: 0.60 },

  // Gradient panel (top portion of card)
  subTop: {
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  // Caustic decorations inside subject card
  sc1: { position: "absolute", width: 160, height: 160, borderRadius: 80,  top: -50, right: -40 },
  sc2: { position: "absolute", width: 90,  height: 90,  borderRadius: 45,  bottom: -30, left: 8  },
  sc3: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 28,
    top: 12,
    right: 56,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  subEmoji:  { fontSize: 48, zIndex: 1 },
  subXpChip: {
    position: "absolute",
    top: 10,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  subXpTxt: { fontSize: 10, fontWeight: fontWeight.bold, color: "#FFF" },

  subLockOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  } as any,
  subLockedTxt: { fontSize: 10, fontWeight: fontWeight.black, color: "rgba(255,255,255,0.8)", letterSpacing: 1.5 },

  subBody: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subName:  { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: o.text, marginBottom: 2 },
  subCount: { fontSize: fontSize.xs, color: o.muted },
  subMeta:  { alignItems: "flex-end", gap: 4 },
  subPTrack: {
    width: 72,
    height: 5,
    backgroundColor: o.bgTint,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  subPFill: { height: "100%", borderRadius: radius.pill },
  subPct:   { fontSize: 10, fontWeight: fontWeight.bold },
  subArrow: { fontSize: 16, fontWeight: fontWeight.black, marginTop: -2 },
  subLockLabel: { fontSize: 10, fontWeight: fontWeight.bold, color: o.dim, letterSpacing: 1 },

  // ── Activity
  actList: { gap: 10 },
  actCard: {
    backgroundColor: o.card,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: o.border,
  },
  actIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: o.bgTint,
    justifyContent: "center",
    alignItems: "center",
  },
  actInfo:    { flex: 1 },
  actName:    { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: o.text, marginBottom: 2 },
  actSub:     { fontSize: fontSize.xs, color: o.muted },
  actBadge:   { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  actBadgeTxt:{ fontSize: 11, fontWeight: fontWeight.bold },
  badgeDone:    { backgroundColor: "#D1FAE5" },
  badgeDoneTxt: { color: "#065F46" },
  badgeProg:    { backgroundColor: o.bgTint },
  badgeProgTxt: { color: o.mid },
});
