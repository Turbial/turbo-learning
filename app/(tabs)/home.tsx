// ─── Home Screen — Ocean / Aqua theme, real Supabase data ────────────────────
// Mobile: full-width feed (header → XP bar → hero → 28-day journey).
// Switches to HomeDesktopScreen on web ≥ 768 px.

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
import { spacing, radius, fontSize, fontWeight } from "../../src/theme/tokens";
import { appPalette as o } from "../../src/theme/palette";
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

// XP per level is linear — 1000 XP each.
const XP_PER_LEVEL = 1000;

// ─── Week color palette (aqua variants for ocean theme) ───────────────────────
const WEEK_COLORS = [o.mid, o.teal, o.sky, o.deep] as const;
const WEEK_TITLES = ["Foundation", "Automation", "Systems", "Launch"] as const;
const WEEK_GOALS = [
  "Understand AI and build your first workflows",
  "Build automations that run without you",
  "Create multi-tool AI systems",
  "Ship your AI workforce",
] as const;
const WEEK_EMOJIS = ["🧱", "⚙️", "🌐", "🚀"] as const;

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
      {/* Caustic light rings */}
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

      <TouchableOpacity style={s.heroCta} activeOpacity={0.85}>
        <Text style={s.heroCtaTxt}>Continue →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function AllDoneCard({ total }: { total: number }) {
  return (
    <View style={s.hero}>
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

// ─── WeeksView — 4×7 days journey ─────────────────────────────────────────────

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

  return (
    <>
      {weeks.map((week) => {
        const doneCount = week.days.filter((d) => d.status === "done").length;
        const weekPct =
          week.days.length > 0
            ? Math.round((doneCount / week.days.length) * 100)
            : 0;

        return (
          <View key={week.weekNum} style={s.weekCard}>
            {/* Left accent stripe */}
            <View style={[s.weekAccent, { backgroundColor: week.color }]} />

            <View style={s.weekInner}>
              {/* Week header */}
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

              {/* Mini progress bar */}
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

              {/* Day rows */}
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
                      <View style={s.dayInfo}>
                        <Text
                          style={[s.dayTitle, isLocked && s.dayTitleLocked]}
                          numberOfLines={1}
                        >
                          {d.title}
                        </Text>
                        {isCurrent && (
                          <Text style={[s.currentPill, { color: week.color }]}>
                            Now
                          </Text>
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
      <View style={{ padding: spacing.md, gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Skeleton width={48} height={48} rounded={14} />
          <View style={{ gap: 6 }}>
            <Skeleton width={120} height={14} rounded={8} />
            <Skeleton width={80} height={12} rounded={6} />
          </View>
        </View>
        <Skeleton height={64} rounded={16} />
        <Skeleton height={180} rounded={22} />
        <Skeleton width={140} height={16} rounded={8} />
        <Skeleton height={6} rounded={3} />
        {[1, 2].map((i) => (
          <Skeleton key={i} height={160} rounded={18} />
        ))}
      </View>
    </SafeAreaView>
  );
}

// ─── Mobile screen ────────────────────────────────────────────────────────────

function HomeScreenMobile() {
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

  // Find the first "current" unit (next up to complete)
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

  if (profileLoading || (unitsLoading && !units)) {
    return <LoadingSkeleton />;
  }

  const initials = getInitials(profile?.name, profile?.email ?? user?.email);
  const firstName = getFirstName(profile?.name, profile?.email ?? user?.email);
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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

        {/* ── XP bar ── */}
        <XPBar xp={xp} level={level} />

        {/* ── Streak-at-risk banner ── */}
        {streakRisk?.isAtRisk && (
          <StreakRiskBanner
            streakDays={streakRisk.streakDays}
            expiresInHours={streakRisk.expiresInHours}
            shieldCount={streakRisk.shieldCount}
          />
        )}

        {/* ── Hero: current lesson ── */}
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

        {/* ── Journey ── */}
        <View style={s.secHdr}>
          <Text style={s.secTitle}>Your Journey</Text>
          <Text style={s.journeyCount}>
            {completedCount}/{totalUnits} days
          </Text>
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
          <WeeksView
            units={displayUnits as any}
            completedUnitIds={allCompletedIds}
            programSlug={programSlug}
            onDayPress={handleDayPress}
          />
        ) : (
          <View style={s.emptyWrap}>
            <ActivityIndicator color={o.mid} />
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

  // Streak badge
  streakBadge: {
    backgroundColor: o.streakBg,
    borderWidth: 1.5,
    borderColor: o.streakBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: o.streakText },

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
  xpFill: { height: "100%", backgroundColor: o.mid, borderRadius: radius.pill },
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

  // ── Streak-at-risk banner
  riskBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.md,
  },
  riskIcon:  { fontSize: 20 },
  riskTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: "#92400E", marginBottom: 2 },
  riskHint:  { fontSize: fontSize.xs, color: "#B45309" },

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
  caustic: { position: "absolute", borderRadius: 9999 },
  cA: { width: 260, height: 260, top: -90,  right: -80, backgroundColor: "rgba(255,255,255,0.06)" },
  cB: { width: 150, height: 150, bottom: -55, left: -30, backgroundColor: "rgba(255,255,255,0.07)" },
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
  heroTagTxt: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: "#FFF",
    lineHeight: 32,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.65)",
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },
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
  heroPct:   { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: "#FFF" },
  heroCta: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: "center",
  },
  heroCtaTxt: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    color: o.heroCtaText,
    letterSpacing: 0.3,
  },

  // ── Section header + journey progress
  secHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  secTitle:     { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: o.text, letterSpacing: -0.3 },
  journeyCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: o.mid },

  // Overall progress bar
  overallBar: {
    height: 6,
    backgroundColor: o.bgTint,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  overallFill: {
    height: "100%",
    backgroundColor: o.mid,
    borderRadius: radius.pill,
  },

  // ── Week card
  weekCard: {
    backgroundColor: o.card,
    borderRadius: radius.xl,
    marginBottom: 14,
    overflow: "hidden",
    flexDirection: "row",
    ...AQUA_SHADOW,
  },
  weekAccent: { width: 4, borderRadius: 0 },
  weekInner:  { flex: 1, padding: 14 },

  weekHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  weekEmoji: { fontSize: 22 },
  weekLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: o.dim,
    letterSpacing: 1.5,
    textTransform: "uppercase" as any,
  },
  weekTitle: { fontSize: fontSize.md, fontWeight: fontWeight.extrabold, color: o.text, letterSpacing: -0.2 },
  weekCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  weekGoal: { fontSize: fontSize.xs, color: o.muted, marginBottom: 8 },

  weekMiniBar: {
    height: 4,
    backgroundColor: o.bgTint,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: 12,
  },
  weekMiniFill: { height: "100%", borderRadius: radius.pill },

  // ── Day rows
  daysList: { gap: 2 },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  dayRowCurrent: { backgroundColor: o.bgTint },

  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: o.border,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleDone:    { borderWidth: 0 },
  dayCircleCurrent: { borderWidth: 2 },
  dayCircleLocked:  { borderColor: o.bgTint, backgroundColor: o.bgTint },

  dayCheck:       { fontSize: 14, color: "#FFF", fontWeight: fontWeight.black },
  dayNum:         { fontSize: 12, fontWeight: fontWeight.bold, color: o.muted },
  dayNumCurrent:  { fontWeight: fontWeight.extrabold },
  dayNumLocked:   { color: o.dim },

  dayInfo:        { flex: 1 },
  dayTitle:       { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: o.text },
  dayTitleLocked: { color: o.dim },
  currentPill:    { fontSize: 10, fontWeight: fontWeight.bold, marginTop: 2 },
  lockIcon:       { fontSize: 14, opacity: 0.4 },

  // ── Empty / loading
  emptyWrap: { alignItems: "center", gap: 10, paddingVertical: spacing.xl },
  emptyTxt:  { fontSize: fontSize.sm, color: o.muted },
});
