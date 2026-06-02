// ─── Home Screen — Turbo Learning design spec ───
// Implements the mobile home dashboard:
//   • Header (avatar / greeting / coins / level / bell)
//   • XP progress strip
//   • Hero "Continue Learning" card
//   • Explore Subjects (filter pills + 2-col grid)
//   • Recent Activity list
//
// Data is hardcoded (mock shapes). Supabase integration → M3+.

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

// ─── Mock data ──────────────────────────────────────────────────

const MOCK_USER = {
  initials: "JD",
  name: "Jordan",
  coins: 4892,
  level: 24,
  xp: 3692,
  xpToNextLevel: 308,
  xpForNextLevel: 4000,
  notifications: 2,
};

const MOCK_HERO = {
  tag: "Continue Learning",
  title: "Quadratic\nEquations",
  subtitle: "Mathematics · Chapter 4 of 8",
  timeLabel: "12 min",
  difficulty: "Medium",
  xpReward: "+45 XP",
  progress: 0.78,
  lessonId: "lesson-quadratic-1",
};

type SubjectFilter = "All" | "Math" | "Science" | "Language" | "History" | "Logic";
const FILTERS: SubjectFilter[] = ["All", "Math", "Science", "Language", "History", "Logic"];

const SUBJECTS = [
  {
    id: "math",
    name: "Mathematics",
    emoji: "📐",
    count: "24 lessons",
    progress: 0.62,
    color: "#6C3CE1",
    category: "Math" as SubjectFilter,
    locked: false,
  },
  {
    id: "science",
    name: "Science Lab",
    emoji: "🔬",
    count: "18 lessons",
    progress: 0.35,
    color: "#00C4A7",
    category: "Science" as SubjectFilter,
    locked: false,
  },
  {
    id: "language",
    name: "Language Arts",
    emoji: "📖",
    count: "20 lessons",
    progress: 0.5,
    color: "#FF6B6B",
    category: "Language" as SubjectFilter,
    locked: false,
  },
  {
    id: "history",
    name: "World History",
    emoji: "🏛️",
    count: "Coming soon",
    progress: 0,
    color: "#F59E0B",
    category: "History" as SubjectFilter,
    locked: true,
  },
];

const ACTIVITY = [
  { id: "a1", emoji: "📐", name: "Linear Equations",   subject: "Mathematics",  status: "done",        bg: "#EDE0FF" },
  { id: "a2", emoji: "🔬", name: "Cell Biology",        subject: "Science Lab",  status: "in-progress", bg: "#CCFAF4" },
  { id: "a3", emoji: "📖", name: "Essay Structure",     subject: "Language Arts",status: "done",        bg: "#FFE4E4" },
];

// ─── Sub-components ─────────────────────────────────────────────

function Avatar({ initials }: { initials: string }) {
  return (
    <View style={s.avatar}>
      <Text style={s.avatarText}>{initials}</Text>
    </View>
  );
}

function CoinBadge({ count }: { count: number }) {
  return (
    <View style={s.coinBadge}>
      <View style={s.coinDot} />
      <Text style={s.coinText}>{count.toLocaleString()}</Text>
    </View>
  );
}

function LevelPill({ level }: { level: number }) {
  return (
    <View style={s.levelPill}>
      <Text style={s.levelText}>Lvl {level}</Text>
    </View>
  );
}

function BellButton({ count }: { count: number }) {
  return (
    <TouchableOpacity style={s.bell} activeOpacity={0.75}>
      <Text style={{ fontSize: 16 }}>🔔</Text>
      {count > 0 && <View style={s.bellDot} />}
    </TouchableOpacity>
  );
}

function XPStrip({
  xp,
  xpToNextLevel,
  level,
  xpForNextLevel,
}: {
  xp: number;
  xpToNextLevel: number;
  level: number;
  xpForNextLevel: number;
}) {
  const pct = `${Math.round(Math.min(xp / xpForNextLevel, 1) * 100)}%`;
  return (
    <View style={s.xpCard}>
      <View style={s.xpRow}>
        <Text style={s.xpLabel}>⭐ Experience Points</Text>
        <Text style={s.xpMuted}>{xpToNextLevel} XP to Level {level + 1}</Text>
      </View>
      <View style={s.xpTrack}>
        <View style={[s.xpFill, { width: pct as any }]} />
      </View>
    </View>
  );
}

function HeroCard() {
  const h = MOCK_HERO;
  const pct = `${Math.round(h.progress * 100)}%`;
  return (
    <TouchableOpacity
      style={s.hero}
      activeOpacity={0.9}
      onPress={() => router.push(`/lesson/${h.lessonId}` as any)}
    >
      <View style={s.heroTagWrap}>
        <Text style={s.heroTagText}>📚 {h.tag}</Text>
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

      <View style={s.heroPTrack}>
        <View style={[s.heroPFill, { width: pct as any }]} />
      </View>
      <Text style={s.heroPLabel}>{pct} complete</Text>

      <View style={s.heroCta}>
        <Text style={s.heroCtaTxt}>Continue →</Text>
      </View>
    </TouchableOpacity>
  );
}

function FilterPills({
  active,
  onSelect,
}: {
  active: SubjectFilter;
  onSelect: (f: SubjectFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f}
          style={[s.pill, active === f && s.pillActive]}
          onPress={() => onSelect(f)}
          activeOpacity={0.75}
        >
          <Text style={[s.pillTxt, active === f && s.pillTxtActive]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function SubjectCard({ item }: { item: (typeof SUBJECTS)[0] }) {
  return (
    <TouchableOpacity
      style={[s.subCard, item.locked && s.subCardLocked]}
      activeOpacity={item.locked ? 1 : 0.85}
      disabled={item.locked}
    >
      <View style={[s.subTop, { backgroundColor: item.color }]}>
        <View style={[s.subCircle1, { backgroundColor: item.color + "66" }]} />
        <View style={[s.subCircle2, { backgroundColor: item.color + "44" }]} />
        <Text style={s.subEmoji}>{item.emoji}</Text>
        {item.locked && (
          <View style={s.lockBadge}>
            <Text style={{ fontSize: 10 }}>🔒</Text>
          </View>
        )}
      </View>
      <View style={s.subBody}>
        <Text style={[s.subName, item.locked && { color: colors.textMuted }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.subCount}>{item.count}</Text>
        {!item.locked && (
          <View style={s.subPTrack}>
            <View
              style={[
                s.subPFill,
                { width: `${Math.round(item.progress * 100)}%` as any, backgroundColor: item.color },
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ActivityRow({ item }: { item: (typeof ACTIVITY)[0] }) {
  const done = item.status === "done";
  return (
    <View style={s.actCard}>
      <View style={[s.actIcon, { backgroundColor: item.bg }]}>
        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
      </View>
      <View style={s.actInfo}>
        <Text style={s.actName}>{item.name}</Text>
        <Text style={s.actSub}>{item.subject}</Text>
      </View>
      <View style={[s.actBadge, done ? s.badgeDone : s.badgeProgress]}>
        <Text style={[s.actBadgeTxt, done ? s.badgeDoneTxt : s.badgeProgressTxt]}>
          {done ? "✓ Done" : "In Progress"}
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────

export default function HomeScreen() {
  const [filter, setFilter] = useState<SubjectFilter>("All");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const visible =
    filter === "All" ? SUBJECTS : SUBJECTS.filter((x) => x.category === filter);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.screenBg} />
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
              <Text style={s.greeting}>{greeting} 👋</Text>
              <Text style={s.userName}>{MOCK_USER.name}</Text>
            </View>
          </View>
          <View style={s.hdrRight}>
            <CoinBadge count={MOCK_USER.coins} />
            <LevelPill level={MOCK_USER.level} />
            <BellButton count={MOCK_USER.notifications} />
          </View>
        </View>

        {/* ── XP ── */}
        <XPStrip
          xp={MOCK_USER.xp}
          xpToNextLevel={MOCK_USER.xpToNextLevel}
          level={MOCK_USER.level}
          xpForNextLevel={MOCK_USER.xpForNextLevel}
        />

        {/* ── Hero ── */}
        <HeroCard />

        {/* ── Explore ── */}
        <View style={s.secHdr}>
          <Text style={s.secTitle}>Explore Subjects</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <FilterPills active={filter} onSelect={setFilter} />

        <View style={s.subGrid}>
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

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "android" ? spacing.lg : spacing.sm,
  },

  // Header
  hdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  hdrLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  hdrRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  greeting: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: fontWeight.medium },
  userName: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },

  // Avatar
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.avatar,
    backgroundColor: colors.violet,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: "#FFF",
    letterSpacing: 0.5,
  },

  // Coin badge
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.goldBg,
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  coinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  coinText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: "#92400e" },

  // Level pill
  levelPill: {
    backgroundColor: colors.violet,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: "#FFF" },

  // Bell
  bell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.sm,
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.coral,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },

  // XP strip
  xpCard: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  xpLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.violet },
  xpMuted: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: fontWeight.medium },
  xpTrack: { height: 9, backgroundColor: "#EDE0FF", borderRadius: radius.pill, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: colors.violet, borderRadius: radius.pill },

  // Hero card
  hero: {
    backgroundColor: "#4A12CE",
    borderRadius: radius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.hero,
  },
  heroTagWrap: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  heroTagText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: "#FFF", letterSpacing: 0.5 },
  heroTitle: {
    fontSize: 28,
    fontWeight: fontWeight.black,
    color: "#FFF",
    lineHeight: 34,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.72)",
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },
  heroChips: { flexDirection: "row", gap: 8, marginBottom: spacing.md, flexWrap: "wrap" },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroChipTxt: { fontSize: fontSize.xs, color: "rgba(255,255,255,0.9)", fontWeight: fontWeight.semibold },
  heroPTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: 6,
  },
  heroPFill: { height: "100%", backgroundColor: "#FFF", borderRadius: radius.pill },
  heroPLabel: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.55)",
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },
  heroCta: { backgroundColor: "#FFF", borderRadius: radius.lg, paddingVertical: 12, alignItems: "center" },
  heroCtaTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.violet, letterSpacing: 0.3 },

  // Section headers
  secHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  secTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAll: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.violet },

  // Filter pills
  filterRow: { gap: 8, paddingBottom: spacing.md },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  pillActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  pillTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted },
  pillTxtActive: { color: "#FFF" },

  // Subject grid
  subGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: spacing.md },
  subCard: {
    width: "47.5%",
    backgroundColor: "#FFF",
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadow.md,
  },
  subCardLocked: { opacity: 0.65 },
  subTop: { height: 90, justifyContent: "center", alignItems: "center", position: "relative" },
  subCircle1: { position: "absolute", width: 80, height: 80, borderRadius: 40, top: -20, right: -20 },
  subCircle2: { position: "absolute", width: 50, height: 50, borderRadius: 25, bottom: -15, left: -10 },
  subEmoji: { fontSize: 32, zIndex: 1 },
  lockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  subBody: { padding: 12 },
  subName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 2 },
  subCount: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 8 },
  subPTrack: { height: 4, backgroundColor: "#EDE0FF", borderRadius: radius.pill, overflow: "hidden" },
  subPFill: { height: "100%", borderRadius: radius.pill },

  // Activity
  actList: { gap: 10 },
  actCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow.sm,
  },
  actIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  actInfo: { flex: 1 },
  actName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 2 },
  actSub: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: fontWeight.medium },
  actBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  actBadgeTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  badgeDone: { backgroundColor: "#CCFAF4" },
  badgeDoneTxt: { color: "#065F46" },
  badgeProgress: { backgroundColor: "#EDE0FF" },
  badgeProgressTxt: { color: colors.violet },
});
