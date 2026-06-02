// ─── Home Screen — Desktop / Web ─────────────────────────────────────────────
// All visual tokens come from src/theme/themeConfig.ts → appTheme.
// To change the look: edit themeConfig, this file never needs touching.

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
import { LinearGradient } from "expo-linear-gradient";
import { appTheme as t } from "../../src/theme/appTheme";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Week config ──────────────────────────────────────────────────────────────

const WEEK_TITLES = ["Foundation", "Automation", "Systems", "Launch"] as const;
const WEEK_GOALS  = [
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
  activeNav, onNav, initials, name, handle, level, xp, streak,
}: {
  activeNav: string; onNav: (id: string) => void;
  initials: string; name: string; handle: string;
  level: number; xp: number; streak: number;
}) {
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct     = Math.round(Math.min((xpInLevel / XP_PER_LEVEL) * 100, 100));
  const xpToNext  = XP_PER_LEVEL - xpInLevel;

  return (
    <View style={s.sidebar}>
      <View style={s.brand}>
        <View style={s.brandIco}><Text style={s.brandIcoTxt}>◈</Text></View>
        <Text style={s.brandName}>Turbo Learning</Text>
      </View>

      <View style={s.userCard}>
        <View style={s.userRow}>
          <View style={s.sbAvatar}><Text style={s.sbAvatarTxt}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.sbName}>{name}</Text>
            <Text style={s.sbHandle}>{handle}</Text>
          </View>
        </View>
        <View style={s.lvlPill}><Text style={s.lvlTxt}>⭐ Level {level}</Text></View>
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

      <Text style={s.navSec}>MENU</Text>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity key={item.id} style={[s.navItem, activeNav === item.id && s.navItemActive]} onPress={() => onNav(item.id)} activeOpacity={0.75}>
          <Text style={s.navIco}>{item.emoji}</Text>
          <Text style={[s.navLbl, activeNav === item.id && s.navLblActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      <Text style={s.navSec}>MORE</Text>
      {NAV_MORE.map((item) => (
        <TouchableOpacity key={item.id} style={[s.navItem, activeNav === item.id && s.navItemActive]} onPress={() => onNav(item.id)} activeOpacity={0.75}>
          <Text style={s.navIco}>{item.emoji}</Text>
          <Text style={[s.navLbl, activeNav === item.id && s.navLblActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}

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
  title, subtitle, unitId, programSlug, dayNum, overallPct,
}: {
  title: string; subtitle: string; unitId: string;
  programSlug: string; dayNum: number; overallPct: number;
}) {
  return (
    <TouchableOpacity style={s.hero} activeOpacity={0.9}
      onPress={() => router.push({ pathname: `/lesson/${unitId}` as any, params: { program: programSlug, day: String(dayNum) } })}>
      <LinearGradient colors={t.hero.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[s.caustic, s.cA]} />
      <View style={[s.caustic, s.cB]} />
      <View style={[s.caustic, s.cC]} />
      <View style={[s.caustic, s.cD]} />
      <View style={s.heroLeft}>
        <View>
          <View style={s.heroTag}><Text style={s.heroTagTxt}>🌊  CONTINUE LEARNING</Text></View>
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
      <LinearGradient colors={t.hero.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[s.caustic, s.cA]} /><View style={[s.caustic, s.cB]} />
      <View style={s.heroLeft}>
        <View>
          <View style={s.heroTag}><Text style={s.heroTagTxt}>🎉  PROGRAM COMPLETE</Text></View>
          <Text style={s.heroTitle}>You finished all {total} days!</Text>
          <Text style={s.heroSub}>Incredible work. Check back for new programs.</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Streak-at-risk banner ────────────────────────────────────────────────────

function StreakRiskBanner({ streakDays, expiresInHours, shieldCount }: { streakDays: number; expiresInHours: number; shieldCount: number }) {
  return (
    <View style={s.riskBanner}>
      <Text>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.riskTitle}>Your {streakDays}-day streak is at risk!</Text>
        <Text style={s.riskHint}>
          Complete a lesson in the next {expiresInHours}h.
          {shieldCount > 0 ? ` ${shieldCount} shield${shieldCount !== 1 ? "s" : ""} ready.` : ""}
        </Text>
      </View>
    </View>
  );
}

// ─── Weeks grid (2-col desktop) ───────────────────────────────────────────────

type DayStatus = "done" | "current" | "locked";
type DayEntry  = { day: number; unitId: string; title: string; status: DayStatus };
type WeekEntry = { weekNum: number; title: string; goal: string; emoji: string; color: string; days: DayEntry[] };

function buildWeeks(
  units: Array<{ id: string; order_num: number; label: string; title: string; program_id: string }>,
  completedUnitIds: Set<string>,
): WeekEntry[] {
  return Array.from({ length: 4 }, (_, w) => {
    const startDay = w * 7 + 1;
    const endDay   = Math.min(startDay + 6, 28);
    const weekUnits = units.filter((u) => u.order_num >= startDay && u.order_num <= endDay);
    return {
      weekNum: w + 1,
      title:   WEEK_TITLES[w] ?? `Week ${w + 1}`,
      goal:    WEEK_GOALS[w]  ?? "",
      emoji:   WEEK_EMOJIS[w] ?? "📅",
      color:   t.weekColors[w] ?? t.colors.accent,
      days: weekUnits.map((u) => {
        const isDone    = completedUnitIds.has(u.id);
        const prevUnit  = u.order_num > 1 ? units.find((p) => p.order_num === u.order_num - 1) : null;
        const prevDone  = u.order_num === 1 || (prevUnit != null && completedUnitIds.has(prevUnit.id));
        return {
          day: u.order_num, unitId: u.id, title: u.title,
          status: (isDone ? "done" : (!isDone && prevDone) ? "current" : "locked") as DayStatus,
        };
      }),
    };
  });
}

function WeekCard({ week, onDayPress }: { week: WeekEntry; onDayPress: (day: number, unitId: string, status: DayStatus) => void }) {
  const doneCount = week.days.filter((d) => d.status === "done").length;
  const weekPct   = week.days.length > 0 ? Math.round((doneCount / week.days.length) * 100) : 0;

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
          <Text style={[s.weekCount, { color: week.color }]}>{doneCount}/{week.days.length}</Text>
        </View>
        <Text style={s.weekGoal}>{week.goal}</Text>
        <View style={s.weekMiniBar}>
          <View style={[s.weekMiniFill, { width: `${Math.max(weekPct, weekPct > 0 ? 4 : 0)}%` as any, backgroundColor: week.color }]} />
        </View>
        <View style={s.daysList}>
          {week.days.map((d) => {
            const isCurrent = d.status === "current";
            const isDone    = d.status === "done";
            const isLocked  = d.status === "locked";
            return (
              <TouchableOpacity key={d.day}
                style={[s.dayRow, isCurrent && s.dayRowCurrent]}
                onPress={() => onDayPress(d.day, d.unitId, d.status)}
                activeOpacity={isLocked ? 1 : 0.7} disabled={isLocked}>
                <View style={[
                  s.dayCircle,
                  isDone    && [s.dayCircleDone,     { backgroundColor: week.color }],
                  isCurrent && [s.dayCircleCurrent,  { borderColor: week.color }],
                  isLocked  && s.dayCircleLocked,
                ]}>
                  {isDone
                    ? <Text style={s.dayCheck}>✓</Text>
                    : <Text style={[s.dayNum, isCurrent && [s.dayNumCurrent, { color: week.color }], isLocked && s.dayNumLocked]}>{d.day}</Text>
                  }
                </View>
                <Text style={[s.dayTitle, isLocked && s.dayTitleLocked]} numberOfLines={1}>{d.title}</Text>
                {isCurrent && <Text style={[s.currentPill, { color: week.color }]}>Now</Text>}
                {isLocked  && <Text style={s.lockIcon}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
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
  const { data: activeSlug }  = useActiveProgramSlug();
  const programSlug           = activeSlug ?? "ai-operator";
  const { data: program }     = useProgram(programSlug);
  const { data: units }       = useUnits(program?.id);
  const { data: completedUnitIds } = useLessonProgressMap(user?.id);
  const localCompletedIds          = useLocalProgressStore((st) => st.completedUnitIds);
  const { data: streakRisk }  = useStreakAtRisk(user?.id);

  const allCompletedIds = new Set<string>([
    ...(completedUnitIds ?? new Set<string>()),
    ...localCompletedIds,
  ]);
  const fallbackUnits  = LOCAL_UNITS[programSlug] ?? LOCAL_UNITS["ai-operator"] ?? [];
  const displayUnits   = units ?? fallbackUnits;
  const totalUnits     = displayUnits.length || 28;
  const completedCount = allCompletedIds.size;
  const overallPct     = Math.round((completedCount / totalUnits) * 100);

  const currentUnit = displayUnits.find((u, i) => {
    if (allCompletedIds.has(u.id)) return false;
    if (i === 0) return true;
    const prev = displayUnits[i - 1];
    return prev != null && allCompletedIds.has(prev.id);
  });

  const handleDayPress = (day: number, unitId: string, status: DayStatus) => {
    if (status === "locked") return;
    router.push({ pathname: `/lesson/${unitId}` as any, params: { program: programSlug, day: String(day) } });
  };

  const initials  = getInitials(profile?.name, profile?.email ?? user?.email);
  const firstName = getFirstName(profile?.name, profile?.email ?? user?.email);
  const fullName  = profile?.name ?? firstName;
  const handle    = profile?.email ? `@${profile.email.split("@")[0]}` : "";
  const xp        = profile?.xp ?? 0;
  const level     = profile?.level ?? 1;
  const streak    = profile?.streak ?? 0;
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const weeks = buildWeeks(displayUnits as any, allCompletedIds);

  return (
    <View style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <View style={s.tbIco}><Text style={s.tbIcoTxt}>◈</Text></View>
          <Text style={s.tbBrand}>Turbo Learning</Text>
        </View>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14, opacity: 0.35 }}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Search lessons, topics…" placeholderTextColor={t.colors.textDisabled} value={search} onChangeText={setSearch} />
        </View>
        <View style={s.topRight}>
          {streak > 0 && <Text style={s.topStreak}>🔥 {streak}-day streak</Text>}
        </View>
      </View>

      {/* Shell */}
      <View style={s.shell}>
        {profileLoading
          ? <View style={[s.sidebar, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={t.colors.accent} /></View>
          : <Sidebar activeNav={activeNav} onNav={setActiveNav} initials={initials} name={fullName} handle={handle} level={level} xp={xp} streak={streak} />
        }

        <ScrollView style={s.main} contentContainerStyle={s.mainContent} showsVerticalScrollIndicator={false}>
          {/* Greeting */}
          <View style={s.greetRow}>
            <Text style={s.greetTitle}>{greeting}, {firstName}! 👋</Text>
            <Text style={s.greetSub}>{program?.title ?? "AI Operator"} · {completedCount}/{totalUnits} days complete</Text>
          </View>

          {/* Streak-at-risk */}
          {streakRisk?.isAtRisk && <StreakRiskBanner streakDays={streakRisk.streakDays} expiresInHours={streakRisk.expiresInHours} shieldCount={streakRisk.shieldCount} />}

          {/* Hero */}
          {currentUnit
            ? <HeroBanner title={currentUnit.title} subtitle={`${program?.title ?? "AI Operator"} · Day ${currentUnit.order_num}`} unitId={currentUnit.id} programSlug={programSlug} dayNum={currentUnit.order_num} overallPct={overallPct} />
            : displayUnits.length > 0 ? <AllDoneBanner total={totalUnits} /> : null
          }

          {/* Journey */}
          <View style={s.secHdr}>
            <Text style={s.secTitle}>Your Journey</Text>
            <Text style={s.journeyCount}>{completedCount}/{totalUnits} days</Text>
          </View>
          <View style={s.overallBar}>
            <View style={[s.overallFill, { width: `${Math.max(overallPct, overallPct > 0 ? 2 : 0)}%` as any }]} />
          </View>

          {displayUnits.length > 0 ? (
            <View style={s.weeksGrid}>
              {[0, 2].map((rowStart) => (
                <View key={rowStart} style={s.weeksRow}>
                  {[rowStart, rowStart + 1].map((wi) =>
                    weeks[wi]
                      ? <WeekCard key={wi} week={weeks[wi]!} onDayPress={handleDayPress} />
                      : <View key={wi} style={s.weekCardEmpty} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 10 }}>
              <ActivityIndicator color={t.colors.accent} />
              <Text style={{ fontSize: t.text.bodyMd, color: t.colors.textMuted }}>Loading program…</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ── all values from appTheme (t) ───────────────────────────────────

const SIDEBAR_W = 230;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.colors.screenBg, minHeight: "100%" as any },

  // Top bar
  topBar: { height: 52, backgroundColor: t.colors.cardBg, borderBottomWidth: 1, borderBottomColor: t.colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 16 },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 8, width: SIDEBAR_W - 20 },
  tbIco:   { width: 26, height: 26, borderRadius: t.radius.sm, backgroundColor: t.colors.accent, justifyContent: "center", alignItems: "center" },
  tbIcoTxt:{ fontSize: 14, fontWeight: t.text.weightBlack, color: "#FFF" },
  tbBrand: { fontSize: t.text.bodyMd, fontWeight: t.text.weightBlack, color: t.colors.textPrimary },
  searchBox:{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: t.colors.inputBg, borderWidth: 1.5, borderColor: t.colors.border, borderRadius: t.radius.md, paddingHorizontal: 13, paddingVertical: 8 },
  searchInput:{ fontSize: 13, fontWeight: t.text.weightMedium, color: t.colors.textMuted, flex: 1, outlineStyle: "none" as any },
  topRight:{ flexDirection: "row", alignItems: "center", gap: 12 },
  topStreak:{ fontSize: 12, fontWeight: t.text.weightBold, color: t.colors.streakText },

  // Shell
  shell: { flex: 1, flexDirection: "row" },

  // Sidebar
  sidebar: { width: SIDEBAR_W, backgroundColor: t.colors.cardBg, borderRightWidth: 1, borderRightColor: t.colors.border, padding: 16, overflow: "hidden" as any },
  brand:   { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 16 },
  brandIco:{ width: 28, height: 28, borderRadius: t.radius.sm, backgroundColor: t.colors.accent, justifyContent: "center", alignItems: "center" },
  brandIcoTxt: { fontSize: 13, fontWeight: t.text.weightBlack, color: "#FFF" },
  brandName:   { fontSize: 14, fontWeight: t.text.weightBlack, color: t.colors.textPrimary },
  userCard:    { backgroundColor: t.colors.cardBg, borderRadius: t.radius.lg, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: t.colors.border },
  userRow:     { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  sbAvatar:    { width: 36, height: 36, borderRadius: t.radius.md, backgroundColor: t.colors.accent, justifyContent: "center", alignItems: "center" },
  sbAvatarTxt: { fontSize: 12, fontWeight: t.text.weightBlack, color: "#FFF" },
  sbName:      { fontSize: 12, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, lineHeight: 17 },
  sbHandle:    { fontSize: 10, color: t.colors.textMuted },
  lvlPill:     { alignSelf: "flex-start", backgroundColor: t.colors.accent, borderRadius: t.radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  lvlTxt:      { fontSize: 10, fontWeight: t.text.weightBold, color: "#FFF" },
  xpRow:    { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpRowLbl: { fontSize: 10, fontWeight: t.text.weightSemibold, color: t.colors.accent },
  xpRowPct: { fontSize: 10, color: t.colors.textMuted },
  xpTrack:  { height: 8, backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, overflow: "hidden", position: "relative" },
  xpFill:   { height: "100%", backgroundColor: t.colors.accent, borderRadius: t.radius.pill },
  xpShimmer:{ position: "absolute", width: 5, height: "100%", backgroundColor: "rgba(255,255,255,0.50)", borderRadius: 3 },
  xpHint:   { fontSize: 9, color: t.colors.textDisabled, marginTop: 5 },
  navSec:   { fontSize: 9, fontWeight: t.text.weightBold, color: t.colors.textDisabled, letterSpacing: 1.5, textTransform: "uppercase" as any, paddingVertical: 9, paddingHorizontal: 8 },
  navItem:  { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10, marginBottom: 1 },
  navItemActive: { backgroundColor: t.colors.accentTint },
  navIco:   { fontSize: 16 },
  navLbl:   { fontSize: 13, fontWeight: t.text.weightSemibold, color: t.colors.textMuted },
  navLblActive: { color: t.colors.accent, fontWeight: t.text.weightExtrabold },
  statsArea:{ marginTop: "auto" as any, flexDirection: "row", gap: 7, paddingTop: 14 },
  statCard: { flex: 1, backgroundColor: t.colors.screenBg, borderRadius: 11, padding: 10, borderWidth: 1, borderColor: t.colors.border, alignItems: "center" },
  statVal:  { fontSize: 14, fontWeight: t.text.weightBlack, color: t.colors.textPrimary },
  statLbl:  { fontSize: 9, color: t.colors.textMuted, marginTop: 2 },

  // Main
  main:        { flex: 1 },
  mainContent: { padding: t.spacing.lg, gap: 18 },
  greetRow:    { gap: 3 },
  greetTitle:  { fontSize: t.text.h1, fontWeight: t.text.weightBlack, color: t.colors.textPrimary, letterSpacing: -0.5, fontFamily: t.fonts.display },
  greetSub:    { fontSize: 13, color: t.colors.textMuted },

  // Streak-at-risk
  riskBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: t.colors.warningBg, borderWidth: 1.5, borderColor: t.colors.warningBorder, borderRadius: t.radius.lg, padding: 14 },
  riskTitle:  { fontSize: 13, fontWeight: t.text.weightBold, color: t.colors.warningText, marginBottom: 2 },
  riskHint:   { fontSize: 11, color: t.colors.warning },

  // Hero
  hero: { backgroundColor: t.hero.bg, borderRadius: t.radius.xxl, flexDirection: "row", overflow: "hidden", minHeight: 170, ...t.heroShadow },
  caustic: { position: "absolute", borderRadius: 9999 },
  cA: { width: 280, height: 280, top: -100, right: -80,  backgroundColor: "rgba(255,255,255,0.05)" },
  cB: { width: 160, height: 160, bottom: -60, left: -20, backgroundColor: "rgba(255,255,255,0.06)" },
  cC: { width: 90,  height: 90,  top: 20, right: 100,    backgroundColor: "rgba(255,255,255,0.08)" },
  cD: { width: 55,  height: 55,  top: 65, right: 55,     backgroundColor: "rgba(255,255,255,0.10)" },
  heroLeft:  { flex: 1, padding: 28, justifyContent: "space-between" },
  heroRight: { width: 100 },
  heroTag:    { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: t.radius.pill, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  heroTagTxt: { fontSize: 10, fontWeight: t.text.weightBold, color: "rgba(255,255,255,0.9)", letterSpacing: 0.8 },
  heroTitle:  { fontSize: t.text.h1, fontWeight: t.text.weightBlack, color: "#FFF", lineHeight: t.text.h1 * 1.25, marginBottom: 5, letterSpacing: -0.5, fontFamily: t.fonts.display },
  heroSub:    { fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: t.text.weightMedium, marginBottom: 12 },
  heroBottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroPTrack: { flex: 1, height: 7, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: t.radius.pill, overflow: "hidden" },
  heroPFill:  { height: "100%", backgroundColor: t.hero.progressFill, borderRadius: t.radius.pill },
  heroPct:    { fontSize: 13, fontWeight: t.text.weightExtrabold, color: "#FFF" },
  heroCta:    { backgroundColor: t.hero.ctaBg, borderRadius: t.radius.md, paddingVertical: 9, paddingHorizontal: 18 },
  heroCtaTxt: { fontSize: 12, fontWeight: t.text.weightExtrabold, color: t.hero.ctaText },

  // Section header
  secHdr:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  secTitle:    { fontSize: t.text.h2, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, letterSpacing: -0.3 },
  journeyCount:{ fontSize: 13, fontWeight: t.text.weightSemibold, color: t.colors.accent },
  overallBar:  { height: 6, backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, overflow: "hidden" },
  overallFill: { height: "100%", backgroundColor: t.colors.accent, borderRadius: t.radius.pill },

  // Weeks 2-col grid
  weeksGrid:    { gap: 14 },
  weeksRow:     { flexDirection: "row", gap: 14 },
  weekCardEmpty:{ flex: 1 },
  weekCard:     { flex: 1, backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, overflow: "hidden", flexDirection: "row", ...t.cardShadow },
  weekAccent:   { width: 4 },
  weekInner:    { flex: 1, padding: 14 },
  weekHeaderRow:{ flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 4 },
  weekEmoji:    { fontSize: 20 },
  weekLabel:    { fontSize: 8, fontWeight: t.text.weightBold, color: t.colors.textDisabled, letterSpacing: 1.5, textTransform: "uppercase" as any },
  weekTitle:    { fontSize: 13, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary },
  weekCount:    { fontSize: 12, fontWeight: t.text.weightBold },
  weekGoal:     { fontSize: 11, color: t.colors.textMuted, marginBottom: 8 },
  weekMiniBar:  { height: 4, backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, overflow: "hidden", marginBottom: 10 },
  weekMiniFill: { height: "100%", borderRadius: t.radius.pill },
  daysList:     { gap: 1 },
  dayRow:       { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, paddingHorizontal: 4, borderRadius: 9 },
  dayRowCurrent:{ backgroundColor: t.colors.accentTint },
  dayCircle:    { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: t.colors.border, justifyContent: "center", alignItems: "center" },
  dayCircleDone:    { borderWidth: 0 },
  dayCircleCurrent: { borderWidth: 2 },
  dayCircleLocked:  { borderColor: t.colors.accentTint, backgroundColor: t.colors.accentTint },
  dayCheck:     { fontSize: 12, color: "#FFF", fontWeight: t.text.weightBlack },
  dayNum:       { fontSize: 10, fontWeight: t.text.weightBold, color: t.colors.textMuted },
  dayNumCurrent:{ fontWeight: t.text.weightExtrabold },
  dayNumLocked: { color: t.colors.textDisabled },
  dayTitle:     { flex: 1, fontSize: 11, fontWeight: t.text.weightSemibold, color: t.colors.textPrimary },
  dayTitleLocked:{ color: t.colors.textDisabled },
  currentPill:  { fontSize: 9, fontWeight: t.text.weightBold },
  lockIcon:     { fontSize: 12, opacity: 0.4 },
});
