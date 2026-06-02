// ─── Home Screen — Desktop / Web — Ocean / Aqua theme, real Supabase data ─────
// Layout: white sidebar + scrollable main on a soft aqua background.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { spacing, radius, fontSize, fontWeight } from "../../src/theme/tokens";
import { appPalette as o } from "../../src/theme/palette";

// ─── Real data hooks ──────────────────────────────────────────────────────────
import { useAuth } from "../../src/data/useAuth";
import {
  useProfile,
  useUnits,
  useProgram,
  useLessonProgressMap,
  useActiveProgramSlug,
} from "../../src/data/queries";
import { useStreakAtRisk } from "../../src/data/useStreakAtRisk";
import { LOCAL_UNITS } from "../../src/data/useLocalUnits";
import { useLocalProgressStore } from "../../src/store/localProgressStore";

// ─── Helpers (same as mobile) ─────────────────────────────────────────────────

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
    return (parts[0]![0] ?? "?").toUpperCase();
  }
  if (email) return email[0]!.toUpperCase();
  return "?";
}

function getFirstName(name?: string | null, email?: string | null): string {
  if (name) return name.trim().split(/\s+/)[0]!;
  if (email) return email.split("@")[0]!;
  return "Learner";
}

const XP_PER_LEVEL = 1000;

// ─── Week palette ─────────────────────────────────────────────────────────────
const WEEK_COLORS = [o.mid, o.teal, o.sky, o.deep] as const;
const WEEK_TITLES = ["Foundation", "Automation", "Systems", "Launch"] as const;
const WEEK_GOALS = [
  "Understand AI and build your first workflows",
  "Build automations that run without you",
  "Create multi-tool AI systems",
  "Ship your AI workforce",
] as const;
const WEEK_EMOJIS = ["🧱", "⚙️", "🌐", "🚀"] as const;

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",     label: "Home",     emoji: "🏠" },
  { id: "explore",  label: "Explore",  emoji: "🔍" },
  { id: "progress", label: "Progress", emoji: "📈" },
  { id: "profile",  label: "Profile",  emoji: "👤" },
];
const NAV_MORE = [
  { id: "leaderboard", label: "Leaderboard", emoji: "🏆" },
  { id: "settings",    label: "Settings",    emoji: "⚙️" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  activeNav,
  onNav,
  initials,
  name,
  handle,
  level,
  xp,
  streak,
}: {
  activeNav: string;
  onNav: (id: string) => void;
  initials: string;
  name: string;
  handle: string;
  level: number;
  xp: number;
  streak: number;
}) {
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct = Math.round(Math.min((xpInLevel / XP_PER_LEVEL) * 100, 100));
  const xpToNext = XP_PER_LEVEL - xpInLevel;

  return (
    <View style={s.sidebar}>
      {/* Brand */}
      <View style={s.brand}>
        <View style={s.brandIco}>
          <Text style={s.brandIcoTxt}>◈</Text>
        </View>
        <Text style={s.brandName}>Turbo Learning</Text>
      </View>

      {/* User card */}
      <View style={s.userCard}>
        <View style={s.userRow}>
          <View style={s.sbAvatar}>
            <Text style={s.sbAvatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sbName}>{name}</Text>
            <Text style={s.sbHandle}>{handle}</Text>
          </View>
        </View>

        <View style={s.lvlPill}>
          <Text style={s.lvlTxt}>⭐ Level {level}</Text>
        </View>

        <View style={s.xpRow}>
          <Text style={s.xpRowLbl}>XP Progress</Text>
          <Text style={s.xpRowPct}>{xpPct}%</Text>
        </View>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${xpPct}%` as any }]} />
          <View style={[s.xpShimmer, { left: `${Math.max(xpPct - 3, 0)}%` as any }]} />
        </View>
        <Text style={s.xpHint}>{xpToNext} XP to level {level + 1}</Text>
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
          <Text style={[s.navLbl, activeNav === item.id && s.navLblActive]}>
            {item.label}
          </Text>
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
          <Text style={[s.navLbl, activeNav === item.id && s.navLblActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Stat cards */}
      <View style={s.statsArea}>
        <View style={s.statCard}>
          <Text style={s.statVal}>🔥 {streak}</Text>
          <Text style={s.statLbl}>day streak</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statVal}>{xp}</Text>
          <Text style={s.statLbl}>total XP</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Hero banner ──────────────────────────────────────────────────────────────

function HeroBanner({
  title,
  subtitle,
  unitId,
  programSlug,
  dayNum,
  overallPct,
}: {
  title: string;
  subtitle: string;
  unitId: string;
  programSlug: string;
  dayNum: number;
  overallPct: number;
}) {
  return (
    <TouchableOpacity
      style={s.hero}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: `/lesson/${unitId}` as any,
          params: { program: programSlug, day: String(dayNum) },
        })
      }
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
            <Text style={s.heroTagTxt}>🌊  CONTINUE LEARNING</Text>
          </View>
          <Text style={s.heroTitle}>{title}</Text>
          <Text style={s.heroSub}>{subtitle}</Text>
        </View>
        <View style={s.heroBottom}>
          <View style={s.heroPTrack}>
            <View style={[s.heroPFill, { width: `${overallPct}%` as any }]} />
          </View>
          <Text style={s.heroPct}>{overallPct}%</Text>
          <TouchableOpacity style={s.heroCta} activeOpacity={0.85}>
            <Text style={s.heroCtaTxt}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.heroRight} />
    </TouchableOpacity>
  );
}

function AllDoneBanner({ total }: { total: number }) {
  return (
    <View style={s.hero}>
      <View style={[s.caustic, s.cA]} />
      <View style={[s.caustic, s.cB]} />
      <View style={[s.caustic, s.cC]} />
      <View style={[s.caustic, s.cD]} />
      <View style={s.heroLeft}>
        <View>
          <View style={s.heroTag}>
            <Text style={s.heroTagTxt}>🎉  PROGRAM COMPLETE</Text>
          </View>
          <Text style={s.heroTitle}>You finished all {total} days!</Text>
          <Text style={s.heroSub}>Incredible work. Check back for new programs.</Text>
        </View>
      </View>
    </View>
  );
}

// ─── WeeksView — desktop (same logic, slightly wider cards) ───────────────────

type DayStatus = "done" | "current" | "locked";
type DayEntry = { day: number; unitId: string; title: string; status: DayStatus };
type WeekEntry = {
  weekNum: number;
  title: string;
  goal: string;
  emoji: string;
  color: string;
  days: DayEntry[];
};

function WeeksGrid({
  units,
  completedUnitIds,
  programSlug,
  onDayPress,
}: {
  units: Array<{ id: string; order_num: number; label: string; title: string; program_id: string }>;
  completedUnitIds: Set<string>;
  programSlug: string;
  onDayPress: (day: number, unitId: string, status: DayStatus) => void;
}) {
  const weeks: WeekEntry[] = [];

  for (let w = 0; w < 4; w++) {
    const startDay = w * 7 + 1;
    const endDay = Math.min(startDay + 6, 28);
    const weekUnits = units.filter(
      (u) => u.order_num >= startDay && u.order_num <= endDay
    );

    weeks.push({
      weekNum: w + 1,
      title: WEEK_TITLES[w] ?? `Week ${w + 1}`,
      goal: WEEK_GOALS[w] ?? "",
      emoji: WEEK_EMOJIS[w] ?? "📅",
      color: WEEK_COLORS[w] ?? o.mid,
      days: weekUnits.map((u) => {
        const isDone = completedUnitIds.has(u.id);
        const prevUnit =
          u.order_num > 1
            ? units.find((pu) => pu.order_num === u.order_num - 1)
            : null;
        const prevDone =
          u.order_num === 1 ||
          (prevUnit != null && completedUnitIds.has(prevUnit.id));
        const isCurrent = !isDone && prevDone;
        return {
          day: u.order_num,
          unitId: u.id,
          title: u.title,
          status: (isDone ? "done" : isCurrent ? "current" : "locked") as DayStatus,
        };
      }),
    });
  }

  // 2-column grid of week cards
  const rows: [WeekEntry, WeekEntry | null][] = [
    [weeks[0]!, weeks[1] ?? null],
    [weeks[2]!, weeks[3] ?? null],
  ];

  return (
    <View style={s.weeksGrid}>
      {rows.map((row, ri) => (
        <View key={ri} style={s.weeksRow}>
          {row.map((week, ci) =>
            week ? (
              <WeekCard
                key={week.weekNum}
                week={week}
                onDayPress={onDayPress}
              />
            ) : (
              <View key={`empty-${ci}`} style={s.weekCardEmpty} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

function WeekCard({
  week,
  onDayPress,
}: {
  week: WeekEntry;
  onDayPress: (day: number, unitId: string, status: DayStatus) => void;
}) {
  const doneCount = week.days.filter((d) => d.status === "done").length;
  const weekPct =
    week.days.length > 0
      ? Math.round((doneCount / week.days.length) * 100)
      : 0;

  return (
    <View style={s.weekCard}>
      <View style={[s.weekAccent, { backgroundColor: week.color }]} />
      <View style={s.weekInner}>
        <View style={s.weekHeaderRow}>
          <Text style={s.weekEmoji}>{week.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.weekLabel}>WEEK {week.weekNum}</Text>
            <Text style={s.weekTitle}>{week.title}</Text>
          </View>
          <Text style={[s.weekCount, { color: week.color }]}>
            {doneCount}/{week.days.length}
          </Text>
        </View>
        <Text style={s.weekGoal}>{week.goal}</Text>
        <View style={s.weekMiniBar}>
          <View
            style={[
              s.weekMiniFill,
              {
                width: `${Math.max(weekPct, weekPct > 0 ? 4 : 0)}%` as any,
                backgroundColor: week.color,
              },
            ]}
          />
        </View>
        <View style={s.daysList}>
          {week.days.map((d) => {
            const isCurrent = d.status === "current";
            const isDone = d.status === "done";
            const isLocked = d.status === "locked";
            return (
              <TouchableOpacity
                key={d.day}
                style={[s.dayRow, isCurrent && s.dayRowCurrent]}
                onPress={() => onDayPress(d.day, d.unitId, d.status)}
                activeOpacity={isLocked ? 1 : 0.7}
                disabled={isLocked}
              >
                <View
                  style={[
                    s.dayCircle,
                    isDone && [s.dayCircleDone, { backgroundColor: week.color }],
                    isCurrent && [s.dayCircleCurrent, { borderColor: week.color }],
                    isLocked && s.dayCircleLocked,
                  ]}
                >
                  {isDone ? (
                    <Text style={s.dayCheck}>✓</Text>
                  ) : (
                    <Text
                      style={[
                        s.dayNum,
                        isCurrent && [s.dayNumCurrent, { color: week.color }],
                        isLocked && s.dayNumLocked,
                      ]}
                    >
                      {d.day}
                    </Text>
                  )}
                </View>
                <Text
                  style={[s.dayTitle, isLocked && s.dayTitleLocked]}
                  numberOfLines={1}
                >
                  {d.title}
                </Text>
                {isCurrent && (
                  <Text style={[s.currentPill, { color: week.color }]}>Now</Text>
                )}
                {isLocked && <Text style={s.lockIcon}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Streak-at-risk banner ────────────────────────────────────────────────────

function StreakRiskBanner({
  streakDays,
  expiresInHours,
  shieldCount,
}: {
  streakDays: number;
  expiresInHours: number;
  shieldCount: number;
}) {
  return (
    <View style={s.riskBanner}>
      <Text>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.riskTitle}>
          Your {streakDays}-day streak is at risk!
        </Text>
        <Text style={s.riskHint}>
          Complete a lesson in the next {expiresInHours}h.
          {shieldCount > 0
            ? ` ${shieldCount} shield${shieldCount !== 1 ? "s" : ""} ready.`
            : ""}
        </Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeDesktopScreen() {
  const [activeNav, setActiveNav] = useState("home");
  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activeSlug } = useActiveProgramSlug();
  const programSlug = activeSlug ?? "ai-operator";
  const { data: program } = useProgram(programSlug);
  const { data: units, isLoading: unitsLoading } = useUnits(program?.id);
  const { data: completedUnitIds } = useLessonProgressMap(user?.id);
  const localCompletedIds = useLocalProgressStore((s) => s.completedUnitIds);
  const { data: streakRisk } = useStreakAtRisk(user?.id);

  const allCompletedIds = new Set<string>([
    ...(completedUnitIds ?? new Set<string>()),
    ...localCompletedIds,
  ]);

  const fallbackUnits =
    LOCAL_UNITS[programSlug] ?? LOCAL_UNITS["ai-operator"] ?? [];
  const displayUnits = units ?? fallbackUnits;
  const completedCount = allCompletedIds.size;
  const totalUnits = displayUnits.length || 28;
  const overallPct = Math.round((completedCount / totalUnits) * 100);

  const currentUnit = displayUnits.find((u, i) => {
    if (allCompletedIds.has(u.id)) return false;
    if (i === 0) return true;
    const prev = displayUnits[i - 1];
    return prev != null && allCompletedIds.has(prev.id);
  });

  const handleDayPress = (day: number, unitId: string, status: DayStatus) => {
    if (status === "locked") return;
    router.push({
      pathname: `/lesson/${unitId}` as any,
      params: { program: programSlug, day: String(day) },
    });
  };

  const initials = getInitials(profile?.name, profile?.email ?? user?.email);
  const firstName = getFirstName(profile?.name, profile?.email ?? user?.email);
  const fullName = profile?.name ?? firstName;
  const handle = profile?.email ? `@${profile.email.split("@")[0]}` : "";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View style={s.root}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <View style={s.tbIco}>
            <Text style={s.tbIcoTxt}>◈</Text>
          </View>
          <Text style={s.tbBrand}>Turbo Learning</Text>
        </View>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14, opacity: 0.35 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search lessons, topics…"
            placeholderTextColor={o.dim}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={s.topRight}>
          {streak > 0 && (
            <Text style={s.topStreak}>🔥 {streak}-day streak</Text>
          )}
        </View>
      </View>

      {/* ── Shell ── */}
      <View style={s.shell}>
        {/* Sidebar */}
        {profileLoading ? (
          <View style={[s.sidebar, { justifyContent: "center", alignItems: "center" }]}>
            <ActivityIndicator color={o.mid} />
          </View>
        ) : (
          <Sidebar
            activeNav={activeNav}
            onNav={setActiveNav}
            initials={initials}
            name={fullName}
            handle={handle}
            level={level}
            xp={xp}
            streak={streak}
          />
        )}

        {/* Main */}
        <ScrollView
          style={s.main}
          contentContainerStyle={s.mainContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={s.greetRow}>
            <Text style={s.greetTitle}>{greeting}, {firstName}! 👋</Text>
            <Text style={s.greetSub}>
              {program?.title ?? "AI Operator"} · {completedCount}/{totalUnits} days complete
            </Text>
          </View>

          {/* Streak-at-risk */}
          {streakRisk?.isAtRisk && (
            <StreakRiskBanner
              streakDays={streakRisk.streakDays}
              expiresInHours={streakRisk.expiresInHours}
              shieldCount={streakRisk.shieldCount}
            />
          )}

          {/* Hero */}
          {currentUnit ? (
            <HeroBanner
              title={currentUnit.title}
              subtitle={`${program?.title ?? "AI Operator"} · Day ${currentUnit.order_num}`}
              unitId={currentUnit.id}
              programSlug={programSlug}
              dayNum={currentUnit.order_num}
              overallPct={overallPct}
            />
          ) : displayUnits.length > 0 ? (
            <AllDoneBanner total={totalUnits} />
          ) : null}

          {/* Journey */}
          <View style={s.secHdr}>
            <Text style={s.secTitle}>Your Journey</Text>
            <Text style={s.journeyCount}>{completedCount}/{totalUnits} days</Text>
          </View>

          {/* Overall progress bar */}
          <View style={s.overallBar}>
            <View
              style={[
                s.overallFill,
                { width: `${Math.max(overallPct, overallPct > 0 ? 2 : 0)}%` as any },
              ]}
            />
          </View>

          {displayUnits.length > 0 ? (
            <WeeksGrid
              units={displayUnits as any}
              completedUnitIds={allCompletedIds}
              programSlug={programSlug}
              onDayPress={handleDayPress}
            />
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 10 }}>
              <ActivityIndicator color={o.mid} />
              <Text style={{ fontSize: 13, color: o.muted }}>Loading program…</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SIDEBAR_W = 230;

const AQUA_SHADOW = {
  shadowColor: o.bright,
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
  topLeft: { flexDirection: "row", alignItems: "center", gap: 8, width: SIDEBAR_W - 20 },
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
  topStreak: { fontSize: 12, fontWeight: fontWeight.bold, color: o.streakText },

  // ── Shell
  shell: { flex: 1, flexDirection: "row" },

  // ── Sidebar
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: o.card,
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

  xpRow:    { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpRowLbl: { fontSize: 10, fontWeight: fontWeight.semibold, color: o.mid },
  xpRowPct: { fontSize: 10, color: o.muted },
  xpTrack: {
    height: 8,
    backgroundColor: o.bgTint,
    borderRadius: radius.pill,
    overflow: "hidden",
    position: "relative",
  },
  xpFill:   { height: "100%", backgroundColor: o.mid, borderRadius: radius.pill },
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
  statVal: { fontSize: 14, fontWeight: fontWeight.black, color: o.text },
  statLbl: { fontSize: 9, color: o.muted, marginTop: 2 },

  // ── Main
  main:        { flex: 1 },
  mainContent: { padding: spacing.lg, gap: 18 },

  greetRow:   { gap: 3 },
  greetTitle: { fontSize: 22, fontWeight: fontWeight.black, color: o.text, letterSpacing: -0.5 },
  greetSub:   { fontSize: 13, color: o.muted },

  // ── Streak-at-risk
  riskBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    borderRadius: radius.lg,
    padding: 14,
  },
  riskTitle: { fontSize: 13, fontWeight: fontWeight.bold, color: "#92400E", marginBottom: 2 },
  riskHint:  { fontSize: 11, color: "#B45309" },

  // ── Hero banner
  hero: {
    backgroundColor: o.deep,
    borderRadius: 22,
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 170,
    shadowColor: o.deep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  caustic: { position: "absolute", borderRadius: 9999 },
  cA: { width: 280, height: 280, top: -100, right: -80,  backgroundColor: "rgba(255,255,255,0.05)" },
  cB: { width: 160, height: 160, bottom: -60, left: -20, backgroundColor: "rgba(255,255,255,0.06)" },
  cC: { width: 90,  height: 90,  top: 20, right: 100,    backgroundColor: "rgba(255,255,255,0.08)" },
  cD: { width: 55,  height: 55,  top: 65, right: 55,     backgroundColor: "rgba(255,255,255,0.10)" },

  heroLeft:  { flex: 1, padding: 28, justifyContent: "space-between" },
  heroRight: { width: 100 },

  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 8,
  },
  heroTagTxt: { fontSize: 10, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.9)", letterSpacing: 0.8 },
  heroTitle:  {
    fontSize: 24, fontWeight: fontWeight.black, color: "#FFF",
    lineHeight: 29, marginBottom: 5, letterSpacing: -0.5,
  },
  heroSub:    { fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: fontWeight.medium, marginBottom: 12 },
  heroBottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroPTrack: { flex: 1, height: 7, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: radius.pill, overflow: "hidden" },
  heroPFill:  { height: "100%", backgroundColor: o.heroProgressFill, borderRadius: radius.pill },
  heroPct:    { fontSize: 13, fontWeight: fontWeight.extrabold, color: "#FFF" },
  heroCta: {
    backgroundColor: "#FFF",
    borderRadius: 11,
    paddingVertical: 9, paddingHorizontal: 18,
  },
  heroCtaTxt: { fontSize: 12, fontWeight: fontWeight.extrabold, color: o.heroCtaText },

  // ── Section header
  secHdr:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  secTitle:     { fontSize: 16, fontWeight: fontWeight.extrabold, color: o.text, letterSpacing: -0.3 },
  journeyCount: { fontSize: 13, fontWeight: fontWeight.semibold, color: o.mid },

  // Overall progress bar
  overallBar:  { height: 6, backgroundColor: o.bgTint, borderRadius: radius.pill, overflow: "hidden" },
  overallFill: { height: "100%", backgroundColor: o.mid, borderRadius: radius.pill },

  // ── Weeks grid (2-col)
  weeksGrid: { gap: 14 },
  weeksRow:  { flexDirection: "row", gap: 14 },
  weekCardEmpty: { flex: 1 },

  weekCard: {
    flex: 1,
    backgroundColor: o.card,
    borderRadius: radius.xl,
    overflow: "hidden",
    flexDirection: "row",
    ...AQUA_SHADOW,
  },
  weekAccent: { width: 4 },
  weekInner:  { flex: 1, padding: 14 },

  weekHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 4,
  },
  weekEmoji: { fontSize: 20 },
  weekLabel: {
    fontSize: 8, fontWeight: fontWeight.bold, color: o.dim,
    letterSpacing: 1.5,
    textTransform: "uppercase" as any,
  },
  weekTitle: { fontSize: 13, fontWeight: fontWeight.extrabold, color: o.text },
  weekCount: { fontSize: 12, fontWeight: fontWeight.bold },

  weekGoal: { fontSize: 11, color: o.muted, marginBottom: 8 },

  weekMiniBar: {
    height: 4,
    backgroundColor: o.bgTint,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: 10,
  },
  weekMiniFill: { height: "100%", borderRadius: radius.pill },

  // ── Day rows
  daysList: { gap: 1 },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 9,
  },
  dayRowCurrent: { backgroundColor: o.bgTint },

  dayCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: o.border,
    justifyContent: "center", alignItems: "center",
  },
  dayCircleDone:    { borderWidth: 0 },
  dayCircleCurrent: { borderWidth: 2 },
  dayCircleLocked:  { borderColor: o.bgTint, backgroundColor: o.bgTint },

  dayCheck:       { fontSize: 12, color: "#FFF", fontWeight: fontWeight.black },
  dayNum:         { fontSize: 10, fontWeight: fontWeight.bold, color: o.muted },
  dayNumCurrent:  { fontWeight: fontWeight.extrabold },
  dayNumLocked:   { color: o.dim },

  dayTitle:       { flex: 1, fontSize: 11, fontWeight: fontWeight.semibold, color: o.text },
  dayTitleLocked: { color: o.dim },
  currentPill:    { fontSize: 9, fontWeight: fontWeight.bold },
  lockIcon:       { fontSize: 12, opacity: 0.4 },
});
