// ─── Home Screen — mobile + platform switch ───────────────────────────────────
// All visual tokens come from src/theme/themeConfig.ts → appTheme.
// To change the look: edit themeConfig, this file never needs touching.

import React from "react";
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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { appTheme as t } from "../../src/theme/appTheme";
import { Skeleton } from "../../src/components/ui/LoadingSkeleton";

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

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ initials }: { initials: string }) {
  return (
    <View style={s.avatar}>
      <View style={s.avatarGlint} />
      <Text style={s.avatarTxt}>{initials}</Text>
    </View>
  );
}

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpInLevel = xp % XP_PER_LEVEL;
  const pct = Math.round(Math.min((xpInLevel / XP_PER_LEVEL) * 100, 100));
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  return (
    <View style={s.xpCard}>
      <View style={s.xpLeft}>
        <Text style={s.xpLevel}>⭐ Level {level}</Text>
        <Text style={s.xpSub}>{xpToNext} XP to next level</Text>
      </View>
      <View style={s.xpRight}>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${pct}%` as any }]} />
          <View style={[s.xpShimmer, { left: `${Math.max(pct - 3, 0)}%` as any }]} />
        </View>
        <Text style={s.xpPct}>{pct}%</Text>
      </View>
    </View>
  );
}

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
      <Text style={s.riskIcon}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.riskTitle}>Your {streakDays}-day streak is at risk!</Text>
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

function HeroCard({
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
      activeOpacity={0.92}
      onPress={() =>
        router.push({
          pathname: `/lesson/${unitId}` as any,
          params: { program: programSlug, day: String(dayNum) },
        })
      }
    >
      <LinearGradient colors={t.hero.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[s.caustic, s.cA]} />
      <View style={[s.caustic, s.cB]} />
      <View style={[s.caustic, s.cC]} />
      <View style={[s.caustic, s.cD]} />

      <View style={s.heroTag}>
        <Text style={s.heroTagTxt}>🌊  CONTINUE LEARNING</Text>
      </View>
      <Text style={s.heroTitle}>{title}</Text>
      <Text style={s.heroSub}>{subtitle}</Text>

      <View style={s.heroPRow}>
        <View style={s.heroPTrack}>
          <View style={[s.heroPFill, { width: `${overallPct}%` as any }]} />
        </View>
        <Text style={s.heroPct}>{overallPct}%</Text>
      </View>

      <View style={s.heroCta}>
        <Text style={s.heroCtaTxt}>Continue →</Text>
      </View>
    </TouchableOpacity>
  );
}

function AllDoneCard({ total }: { total: number }) {
  return (
    <View style={s.hero}>
      <LinearGradient colors={t.hero.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[s.caustic, s.cA]} />
      <View style={[s.caustic, s.cB]} />
      <View style={[s.caustic, s.cC]} />
      <View style={[s.caustic, s.cD]} />
      <View style={s.heroTag}>
        <Text style={s.heroTagTxt}>🎉  PROGRAM COMPLETE</Text>
      </View>
      <Text style={s.heroTitle}>You finished all {total} days!</Text>
      <Text style={s.heroSub}>Incredible work. Check back for new programs.</Text>
    </View>
  );
}

// ─── WeeksView ────────────────────────────────────────────────────────────────

type DayStatus = "done" | "current" | "locked";
type DayEntry  = { day: number; unitId: string; title: string; status: DayStatus };
type WeekEntry = { weekNum: number; title: string; goal: string; emoji: string; color: string; days: DayEntry[] };

const WEEK_TITLES = ["Foundation", "Automation", "Systems", "Launch"] as const;
const WEEK_GOALS  = [
  "Understand AI and build your first workflows",
  "Build automations that run without you",
  "Create multi-tool AI systems",
  "Ship your AI workforce",
] as const;
const WEEK_EMOJIS = ["🧱", "⚙️", "🌐", "🚀"] as const;

function WeeksView({
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
    const endDay   = Math.min(startDay + 6, 28);
    const weekUnits = units.filter((u) => u.order_num >= startDay && u.order_num <= endDay);

    weeks.push({
      weekNum: w + 1,
      title:   WEEK_TITLES[w] ?? `Week ${w + 1}`,
      goal:    WEEK_GOALS[w]  ?? "",
      emoji:   WEEK_EMOJIS[w] ?? "📅",
      color:   t.weekColors[w] ?? t.colors.accent,
      days: weekUnits.map((u) => {
        const isDone    = completedUnitIds.has(u.id);
        const prevUnit  = u.order_num > 1 ? units.find((p) => p.order_num === u.order_num - 1) : null;
        const prevDone  = u.order_num === 1 || (prevUnit != null && completedUnitIds.has(prevUnit.id));
        const isCurrent = !isDone && prevDone;
        return {
          day:    u.order_num,
          unitId: u.id,
          title:  u.title,
          status: (isDone ? "done" : isCurrent ? "current" : "locked") as DayStatus,
        };
      }),
    });
  }

  return (
    <>
      {weeks.map((week) => {
        const doneCount = week.days.filter((d) => d.status === "done").length;
        const weekPct   = week.days.length > 0 ? Math.round((doneCount / week.days.length) * 100) : 0;

        return (
          <View key={week.weekNum} style={s.weekCard}>
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
                <View style={[s.weekMiniFill, {
                  width: `${Math.max(weekPct, weekPct > 0 ? 4 : 0)}%` as any,
                  backgroundColor: week.color,
                }]} />
              </View>

              <View style={s.daysList}>
                {week.days.map((d) => {
                  const isCurrent = d.status === "current";
                  const isDone    = d.status === "done";
                  const isLocked  = d.status === "locked";
                  return (
                    <TouchableOpacity
                      key={d.day}
                      style={[s.dayRow, isCurrent && s.dayRowCurrent]}
                      onPress={() => onDayPress(d.day, d.unitId, d.status)}
                      activeOpacity={isLocked ? 1 : 0.7}
                      disabled={isLocked}
                    >
                      <View style={[
                        s.dayCircle,
                        isDone    && [s.dayCircleDone,    { backgroundColor: week.color }],
                        isCurrent && [s.dayCircleCurrent, { borderColor: week.color }],
                        isLocked  && s.dayCircleLocked,
                      ]}>
                        {isDone ? (
                          <Text style={s.dayCheck}>✓</Text>
                        ) : (
                          <Text style={[
                            s.dayNum,
                            isCurrent && [s.dayNumCurrent, { color: week.color }],
                            isLocked  && s.dayNumLocked,
                          ]}>
                            {d.day}
                          </Text>
                        )}
                      </View>
                      <View style={s.dayInfo}>
                        <Text style={[s.dayTitle, isLocked && s.dayTitleLocked]} numberOfLines={1}>
                          {d.title}
                        </Text>
                        {isCurrent && (
                          <Text style={[s.currentPill, { color: week.color }]}>Now</Text>
                        )}
                      </View>
                      {isLocked && <Text style={s.lockIcon}>🔒</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={{ padding: t.spacing.md, gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Skeleton width={48} height={48} rounded={t.radius.lg} />
          <View style={{ gap: 6 }}>
            <Skeleton width={120} height={14} rounded={8} />
            <Skeleton width={80}  height={12} rounded={6} />
          </View>
        </View>
        <Skeleton height={64}  rounded={t.radius.xl}  />
        <Skeleton height={180} rounded={t.radius.xxl} />
        <Skeleton width={140}  height={16} rounded={8} />
        <Skeleton height={6}   rounded={3} />
        {[1, 2].map((i) => <Skeleton key={i} height={160} rounded={t.radius.xl} />)}
      </View>
    </SafeAreaView>
  );
}

// ─── Mobile screen ────────────────────────────────────────────────────────────

function HomeScreenMobile() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activeSlug }  = useActiveProgramSlug();
  const programSlug           = activeSlug ?? "ai-operator";
  const { data: program }     = useProgram(programSlug);
  const { data: units, isLoading: unitsLoading } = useUnits(program?.id);
  const { data: completedUnitIds } = useLessonProgressMap(user?.id);
  const localCompletedIds          = useLocalProgressStore((s) => s.completedUnitIds);
  const { data: streakRisk }  = useStreakAtRisk(user?.id);

  const allCompletedIds = new Set<string>([
    ...(completedUnitIds ?? new Set<string>()),
    ...localCompletedIds,
  ]);
  const fallbackUnits = LOCAL_UNITS[programSlug] ?? LOCAL_UNITS["ai-operator"] ?? [];
  const displayUnits  = units ?? fallbackUnits;
  const totalUnits    = displayUnits.length || 28;
  const completedCount = allCompletedIds.size;
  const overallPct    = Math.round((completedCount / totalUnits) * 100);

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

  if (profileLoading || (unitsLoading && !units)) return <LoadingSkeleton />;

  const initials  = getInitials(profile?.name, profile?.email ?? user?.email);
  const firstName = getFirstName(profile?.name, profile?.email ?? user?.email);
  const xp        = profile?.xp ?? 0;
  const level     = profile?.level ?? 1;
  const streak    = profile?.streak ?? 0;
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={t.colors.screenBg} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.hdr}>
          <View style={s.hdrLeft}>
            <Avatar initials={initials} />
            <View>
              <Text style={s.greeting}>{greeting} 🌊</Text>
              <Text style={s.userName}>{firstName}</Text>
            </View>
          </View>
          <View style={s.hdrRight}>
            <View style={s.streakBadge}>
              <Text style={s.streakTxt}>🔥 {streak}</Text>
            </View>
          </View>
        </View>

        {/* XP bar */}
        <XPBar xp={xp} level={level} />

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
          <HeroCard
            title={currentUnit.title}
            subtitle={`${program?.title ?? "AI Operator"} · Day ${currentUnit.order_num}`}
            unitId={currentUnit.id}
            programSlug={programSlug}
            dayNum={currentUnit.order_num}
            overallPct={overallPct}
          />
        ) : displayUnits.length > 0 ? (
          <AllDoneCard total={totalUnits} />
        ) : null}

        {/* Journey section */}
        <View style={s.secHdr}>
          <Text style={s.secTitle}>Your Journey</Text>
          <Text style={s.journeyCount}>{completedCount}/{totalUnits} days</Text>
        </View>

        <View style={s.overallBar}>
          <View style={[s.overallFill, {
            width: `${Math.max(overallPct, overallPct > 0 ? 2 : 0)}%` as any,
          }]} />
        </View>

        {displayUnits.length > 0 ? (
          <WeeksView
            units={displayUnits as any}
            completedUnitIds={allCompletedIds}
            programSlug={programSlug}
            onDayPress={handleDayPress}
          />
        ) : (
          <View style={s.emptyWrap}>
            <ActivityIndicator color={t.colors.accent} />
            <Text style={s.emptyTxt}>Loading program…</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Platform switch ──────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  if (Platform.OS === "web" && width >= 768) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Desktop = require("./HomeDesktop").default;
    return <Desktop />;
  }
  return <HomeScreenMobile />;
}

// ─── Styles ── all values from appTheme (t) ───────────────────────────────────

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: t.colors.screenBg },
  scroll:  { flex: 1 },
  content: {
    paddingHorizontal: t.spacing.md,
    paddingTop: Platform.OS === "android" ? t.spacing.lg : t.spacing.sm,
  },

  // Header
  hdr:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing.md },
  hdrLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  hdrRight:{ flexDirection: "row", alignItems: "center", gap: 8 },
  greeting:{ fontSize: t.text.bodyMd, color: t.colors.textMuted, fontWeight: t.text.weightMedium },
  userName:{ fontSize: t.text.h1, color: t.colors.textPrimary, fontWeight: t.text.weightExtrabold, letterSpacing: -0.3, fontFamily: t.fonts.display },

  // Avatar
  avatar:     { width: 48, height: 48, borderRadius: t.radius.lg, backgroundColor: t.colors.accent, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarGlint:{ position: "absolute", width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)", top: -6, right: -6 },
  avatarTxt:  { fontSize: t.text.h3, fontWeight: t.text.weightBlack, color: "#FFF" },

  // Streak badge
  streakBadge:{ backgroundColor: t.colors.streakBg, borderWidth: 1.5, borderColor: t.colors.streakBorder, borderRadius: t.radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  streakTxt:  { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: t.colors.streakText },

  // XP card
  xpCard: {
    backgroundColor: t.colors.cardBg,
    borderRadius: t.radius.xl,
    padding: t.spacing.md,
    marginBottom: t.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: t.colors.border,
    ...t.cardShadow,
  },
  xpLeft:   { gap: 3 },
  xpLevel:  { fontSize: t.text.h3, fontWeight: t.text.weightExtrabold, color: t.colors.accent },
  xpSub:    { fontSize: t.text.bodyMd, color: t.colors.textMuted },
  xpRight:  { flex: 1, gap: 4 },
  xpTrack:  { height: 10, backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, overflow: "hidden", position: "relative" },
  xpFill:   { height: "100%", backgroundColor: t.colors.accent, borderRadius: t.radius.pill },
  xpShimmer:{ position: "absolute", width: 6, height: "100%", backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 3 },
  xpPct:    { fontSize: t.text.bodyMd, color: t.colors.textMuted, fontWeight: t.text.weightSemibold, textAlign: "right" },

  // Streak-at-risk
  riskBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: t.colors.warningBg, borderWidth: 1.5, borderColor: t.colors.warningBorder, borderRadius: t.radius.lg, padding: 14, marginBottom: t.spacing.md },
  riskIcon:   { fontSize: 20 },
  riskTitle:  { fontSize: t.text.bodyMd, fontWeight: t.text.weightBold, color: t.colors.warningText, marginBottom: 2 },
  riskHint:   { fontSize: t.text.caption, color: t.colors.warning },

  // Hero card
  hero: {
    backgroundColor: t.hero.bg,
    borderRadius: t.radius.xxl,
    padding: t.spacing.lg,
    marginBottom: t.spacing.lg,
    overflow: "hidden",
    ...t.heroShadow,
  },
  caustic: { position: "absolute", borderRadius: 9999 },
  cA: { width: 260, height: 260, top: -90,  right: -80, backgroundColor: "rgba(255,255,255,0.06)" },
  cB: { width: 150, height: 150, bottom: -55, left: -30, backgroundColor: "rgba(255,255,255,0.07)" },
  cC: { width: 90,  height: 90,  top: 20,   right: 60,  backgroundColor: "rgba(255,255,255,0.08)" },
  cD: { width: 50,  height: 50,  top: 70,   right: 24,  backgroundColor: "rgba(255,255,255,0.10)" },
  heroTag:    { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: t.radius.pill, paddingHorizontal: 12, paddingVertical: 4, marginBottom: t.spacing.sm },
  heroTagTxt: { fontSize: t.text.caption, fontWeight: t.text.weightBold, color: "rgba(255,255,255,0.92)", letterSpacing: 0.8 },
  heroTitle:  { fontSize: t.text.display, fontWeight: t.text.weightBlack, color: "#FFF", lineHeight: t.text.display * 1.18, marginBottom: 6, letterSpacing: -0.5, fontFamily: t.fonts.display },
  heroSub:    { fontSize: t.text.h3, color: "rgba(255,255,255,0.65)", fontWeight: t.text.weightMedium, marginBottom: t.spacing.md },
  heroPRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: t.spacing.md },
  heroPTrack: { flex: 1, height: 7, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: t.radius.pill, overflow: "hidden" },
  heroPFill:  { height: "100%", backgroundColor: t.hero.progressFill, borderRadius: t.radius.pill },
  heroPct:    { fontSize: t.text.h3, fontWeight: t.text.weightExtrabold, color: "#FFF" },
  heroCta:    { backgroundColor: t.hero.ctaBg, borderRadius: t.radius.lg, paddingVertical: 13, alignItems: "center" },
  heroCtaTxt: { fontSize: t.text.h3, fontWeight: t.text.weightExtrabold, color: t.hero.ctaText, letterSpacing: 0.3 },

  // Section header
  secHdr:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing.sm },
  secTitle:    { fontSize: t.text.h1, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, letterSpacing: -0.3, fontFamily: t.fonts.display },
  journeyCount:{ fontSize: t.text.h3, fontWeight: t.text.weightSemibold, color: t.colors.accent },

  // Overall bar
  overallBar:  { height: 6, backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, overflow: "hidden", marginBottom: t.spacing.md },
  overallFill: { height: "100%", backgroundColor: t.colors.accent, borderRadius: t.radius.pill },

  // Week card
  weekCard:    { backgroundColor: t.colors.cardBg, borderRadius: t.radius.xl, marginBottom: 14, overflow: "hidden", flexDirection: "row", ...t.cardShadow },
  weekAccent:  { width: 4 },
  weekInner:   { flex: 1, padding: 16 },
  weekHeaderRow:{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  weekEmoji:   { fontSize: 22 },
  weekLabel:   { fontSize: 11, fontWeight: t.text.weightBold, color: t.colors.textDisabled, letterSpacing: 1.5, textTransform: "uppercase" as any },
  weekTitle:   { fontSize: t.text.h2, fontWeight: t.text.weightExtrabold, color: t.colors.textPrimary, letterSpacing: -0.2, fontFamily: t.fonts.display },
  weekCount:   { fontSize: t.text.h3, fontWeight: t.text.weightBold },
  weekGoal:    { fontSize: t.text.bodyMd, color: t.colors.textMuted, marginBottom: 8 },
  weekMiniBar: { height: 4, backgroundColor: t.colors.accentTint, borderRadius: t.radius.pill, overflow: "hidden", marginBottom: 12 },
  weekMiniFill:{ height: "100%", borderRadius: t.radius.pill },

  // Day rows
  daysList:       { gap: 2 },
  dayRow:         { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 6, borderRadius: t.radius.md },
  dayRowCurrent:  { backgroundColor: t.colors.accentTint },
  dayCircle:      { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: t.colors.border, justifyContent: "center", alignItems: "center" },
  dayCircleDone:  { borderWidth: 0 },
  dayCircleCurrent:{ borderWidth: 2 },
  dayCircleLocked:{ borderColor: t.colors.accentTint, backgroundColor: t.colors.accentTint },
  dayCheck:       { fontSize: 15, color: "#FFF", fontWeight: t.text.weightBlack },
  dayNum:         { fontSize: 13, fontWeight: t.text.weightBold, color: t.colors.textMuted },
  dayNumCurrent:  { fontWeight: t.text.weightExtrabold },
  dayNumLocked:   { color: t.colors.textDisabled },
  dayInfo:        { flex: 1 },
  dayTitle:       { fontSize: t.text.body, fontWeight: t.text.weightSemibold, color: t.colors.textPrimary },
  dayTitleLocked: { color: t.colors.textDisabled },
  currentPill:    { fontSize: 12, fontWeight: t.text.weightBold, marginTop: 2 },
  lockIcon:       { fontSize: 15, opacity: 0.4 },

  // Empty / loading
  emptyWrap: { alignItems: "center", gap: 10, paddingVertical: t.spacing.xl },
  emptyTxt:  { fontSize: t.text.bodyMd, color: t.colors.textMuted },
});
