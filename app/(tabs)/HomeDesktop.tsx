// ─── Home Screen — Desktop / Web layout ───
// Renders when Platform.OS === 'web' && window.innerWidth >= 768.
// Same real data as the mobile view, but a desktop-optimized layout.

import React, { useState, useMemo } from "react";
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
import { useAuth } from "../../src/data/useAuth";
import {
  useProfile,
  useProgram,
  useUnits,
  useLessonProgressMap,
  useActiveProgramSlug,
} from "../../src/data/queries";
import { LOCAL_UNITS } from "../../src/data/useLocalUnits";
import { useStreakAtRisk } from "../../src/data/useStreakAtRisk";
import { useLocalProgressStore } from "../../src/store/localProgressStore";
import { colors } from "../../src/theme/tokens";

// ─── Types ──────────────────────────────────────────────────────────────────
type SubjectFilter = "All" | "Math" | "Science" | "Language" | "History" | "Logic" | "Art";

// ─── Data helpers ───────────────────────────────────────────────────────────
function getDayStatus(
  orderNum: number,
  completedSet: Set<string>,
  currentDay: number,
): "done" | "current" | "locked" {
  const id = `ai-${String(orderNum).padStart(2, "0")}`;
  if (completedSet.has(id)) return "done";
  if (orderNum === currentDay) return "current";
  if (orderNum <= currentDay) return "done"; // past but not in completed set — treat as done (side-loaded)
  return "locked";
}

// ─── SVG path for decorative blobs ─────────────────────────────────────────
const blobPaths = [
  "M0,0 C40,20 60,60 30,100 C0,80 -20,40 0,0Z",
  "M0,0 C30,30 50,80 20,120 C-10,90 -30,50 0,0Z",
  "M0,0 C50,10 70,50 40,90 C10,70 -20,30 0,0Z",
];

// ─── Sidebar ────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeNav: string;
  onNav: (id: string) => void;
  profile: any;
  streak: number;
  xp: number;
  level: number;
}

const NAV_MAIN = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "explore", label: "Explore", emoji: "🔍" },
  { id: "progress", label: "Progress", emoji: "📈" },
  { id: "profile", label: "Profile", emoji: "👤" },
];

const NAV_MORE = [
  { id: "leaderboard", label: "Leaderboard", emoji: "🏆" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

function Sidebar({ activeNav, onNav, profile, streak, xp, level }: SidebarProps) {
  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "TL";

  // XP for next level (simple formula)
  const xpForNext = (level || 1) * 500;
  const xpPct = Math.min(Math.round((xp || 0) / xpForNext * 100), 100);

  return (
    <View style={s.sidebar}>
      {/* Brand */}
      <View style={s.brand}>
        <View style={s.brandIco}><Text style={s.brandIcoTxt}>✦</Text></View>
        <Text style={s.brandName}>Turbo Academy</Text>
      </View>

      {/* User card */}
      <View style={s.userCard}>
        <View style={s.userRow}>
          <View style={s.sbAvatar}>
            <Text style={s.sbAvatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sbName}>{profile?.name || "Learner"}</Text>
            <Text style={s.sbHandle}>@{profile?.email?.split("@")[0] || "user"}</Text>
          </View>
        </View>

        <View style={s.lvlPill}>
          <Text style={s.lvlTxt}>⭐ Level {level || 1}</Text>
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
          <Text style={s.coinVal}>{(xp || 0).toLocaleString()} XP</Text>
          <Text style={s.coinSub}>{xpForNext - (xp || 0)} to Lvl {(level || 1) + 1}</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={s.navSection}>
        <Text style={s.navSec}>Menu</Text>
        {NAV_MAIN.map((item) => (
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
      </View>

      {/* Quick stats */}
      <View style={s.statsArea}>
        <View style={s.statCard}>
          <View>
            <Text style={s.statLbl}>Current Streak</Text>
            <Text style={s.statSub}>Keep it up!</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.statVal}>🔥 {streak}</Text>
            <Text style={s.statUnit}>days</Text>
          </View>
        </View>
        <View style={s.statCard}>
          <View>
            <Text style={s.statLbl}>Global Rank</Text>
            <Text style={s.statSub}>Top learner</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.statVal}>#{level || 1}</Text>
            <Text style={s.statUnit}>level</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Hero (Continue Learning) ───────────────────────────────────────────────

function HeroBanner({
  label,
  title,
  subtitle,
  progress,
  timeLabel,
  difficulty,
  xpReward,
  onPress,
}: {
  label: string;
  title?: string;
  subtitle?: string;
  progress: number;
  timeLabel: string;
  difficulty: string;
  xpReward: string;
  onPress: () => void;
}) {
  const blob = blobPaths[Math.floor(Math.random() * blobPaths.length)];
  return (
    <TouchableOpacity style={s.hero} activeOpacity={0.9} onPress={onPress}>
      <View style={s.heroLeft}>
        <View style={{ flex: 1 }}>
          <Text style={s.heroTag}>📚 {label.toUpperCase()}</Text>
          <Text style={s.heroTitle}>{title || "Start your first lesson"}</Text>
          <Text style={s.heroSub}>{subtitle || "AI Operator · 28-Day Program"}</Text>
        </View>
        <View style={s.heroChips}>
          {[timeLabel, difficulty, xpReward].map((c, i) => (
            <View key={i} style={[s.heroChip, difficulty.includes("HARD") && s.heroChipHard]}>
              <Text style={s.heroChipTxt}>{c}</Text>
            </View>
          ))}
        </View>
        <View style={s.heroBottom}>
          <View style={s.heroPTrack}>
            <View style={[s.heroPFill, { width: `${Math.min(Math.round(progress * 100), 100)}%` as any }]} />
          </View>
          <Text style={s.heroPct}>{Math.round(progress * 100)}%</Text>
          <TouchableOpacity style={s.heroCta} activeOpacity={0.85} onPress={onPress}>
            <Text style={s.heroCtaTxt}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.heroRight}>
        <View style={[s.hrc, s.hrc1]} />
        <View style={[s.hrc, s.hrc2]} />
        <View style={[s.hrc, s.hrc3]} />
        <View style={s.hrd} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Day Cards (replaces mock SubjectGrid) ──────────────────────────────────

function DayCards({
  days,
  onPressDay,
}: {
  days: Array<{ day: number; unitId: string; title: string; status: string }>;
  onPressDay: (unitId: string, day: number) => void;
}) {
  const currentIdx = days.findIndex((d) => d.status === "current");
  const nextUp = currentIdx >= 0 && currentIdx < days.length - 1 ? days[currentIdx + 1] : null;

  return (
    <View style={s.daysGrid}>
      {days.slice(0, 28).map((d) => (
        <TouchableOpacity
          key={d.day}
          style={[
            s.dayCard,
            d.status === "current" && s.dayCardCurrent,
            d.status === "locked" && s.dayCardLocked,
            d.status === "done" && s.dayCardDone,
          ]}
          activeOpacity={d.status === "locked" ? 1 : 0.7}
          disabled={d.status === "locked"}
          onPress={() => onPressDay(d.unitId, d.day)}
        >
          <View style={[s.dayCircle, d.status === "done" && s.dayCircleDone, d.status === "current" && s.dayCircleCurrent]}>
            {d.status === "done" ? (
              <Text style={s.dayCheck}>✓</Text>
            ) : (
              <Text style={[s.dayNum, d.status === "current" && s.dayNumCurrent, d.status === "locked" && s.dayNumLocked]}>
                {d.day}
              </Text>
            )}
          </View>
          <Text style={[s.dayCardTitle, d.status === "locked" && { color: "#b0a8c0" }]} numberOfLines={2}>
            {d.title}
          </Text>
          {d.status === "current" && <Text style={s.currentPill}>▶ CURRENT</Text>}
          {d.status === "locked" && <Text style={s.lockPill}>🔒</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Activity table ─────────────────────────────────────────────────────────

const ACTIVITY = [
  { emoji: "📐", name: "Day 1: What AI Is", chapter: "Start here", subject: "AI Operator", time: "Today", status: "in-progress" },
  { emoji: "⚗️", name: "Day 2: Prompting", chapter: "Foundation", subject: "AI Operator", time: "Today", status: "new" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  done: { bg: "#D1FAE5", color: "#065F46", label: "Done" },
  "in-progress": { bg: "#FEF3C7", color: "#92400E", label: "In Progress" },
  new: { bg: "#EDE9FE", color: "#4C1D95", label: "New" },
};

function ActivityTable({ completedCount, totalDays }: { completedCount: number; totalDays: number }) {
  return (
    <View>
      <View style={s.actHeader}>
        <Text style={s.actHdrCell}>LESSON</Text>
        <Text style={s.actHdrCell}>PROGRAM</Text>
        <Text style={s.actHdrCell}>TIME</Text>
        <Text style={s.actHdrCell}>STATUS</Text>
      </View>
      <View style={s.actRow}>
        <View style={s.actCell}>
          <View style={[s.actIconBg, { backgroundColor: "#EEF2FF" }]}>
            <Text>🎯</Text>
          </View>
          <View>
            <Text style={s.actName}>AI Operator Program</Text>
            <Text style={s.actChap}>{completedCount}/{totalDays} days completed</Text>
          </View>
        </View>
        <Text style={s.actCell}>AI Operator</Text>
        <Text style={s.actCell}>Active</Text>
        <View style={s.actCell}>
          <View style={s.actStatus}>
            <Text style={s.actStatusTxt}>
              {completedCount === totalDays ? "🎉 Complete" : `${totalDays - completedCount} remaining`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function HomeDesktopScreen() {
  const [activeNav, setActiveNav] = useState("home");
  const [filter] = useState<SubjectFilter>("All");
  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activeSlug } = useActiveProgramSlug();
  const programSlug = activeSlug || "ai-operator";
  const { data: program } = useProgram(programSlug);
  const { data: units, isLoading: unitsLoading } = useUnits(program?.id);
  const { data: completedUnitIds } = useLessonProgressMap(user?.id);
  const { data: streakRisk } = useStreakAtRisk(user?.id);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completedSet = useMemo(() => {
    const s = new Set<string>();
    if (completedUnitIds) completedUnitIds.forEach((id: string) => s.add(id));
    return s;
  }, [completedUnitIds]);

  const localCompletedIds = useLocalProgressStore((st) => st.completedLessons);

  const fallbackUnits = LOCAL_UNITS[programSlug] ?? LOCAL_UNITS["ai-operator"];
  const resolvedUnits = (units?.length ? units : fallbackUnits).sort(
    (a: any, b: any) => (a.order_num || a.day || 0) - (b.order_num || b.day || 0),
  );

  const currentDayNum = useMemo(() => {
    let dayIdx = 1;
    for (const u of resolvedUnits) {
      const unitId = u.id || `ai-${String(dayIdx).padStart(2, "0")}`;
      if (!completedSet.has(unitId) && !localCompletedIds.has(unitId)) break;
      dayIdx++;
    }
    return dayIdx;
  }, [resolvedUnits, completedSet, localCompletedIds]);

  const days = useMemo(() => {
    return resolvedUnits.map((u: any, i: number) => {
      const day = i + 1;
      const unitId = u.id || `ai-${String(day).padStart(2, "0")}`;
      const status = getDayStatus(day, completedSet, currentDayNum);
      return { day, unitId, title: u.title || u.label || `Day ${day}`, status };
    });
  }, [resolvedUnits, completedSet, currentDayNum]);

  const completedCount = days.filter((d) => d.status === "done").length;
  const totalDays = days.length;

  const currentDay = days.find((d) => d.status === "current");
  const nextUp = days.find((d) => d.status === "locked");

  const handlePressDay = (unitId: string, day: number) => {
    if (day <= currentDayNum) {
      router.push({ pathname: `/lesson/${unitId}`, params: { program: programSlug, day: String(day) } });
    }
  };

  const handleMessenger = () => {
    router.push("/messenger/ai-operator-day1");
  };

  const profileName = profile?.name || user?.email?.split("@")[0] || "Learner";
  const streak = streakRisk?.streakDays ?? profile?.streak ?? 0;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;

  return (
    <View style={s.root}>
      {/* Title bar */}
      <View style={s.titleBar}>
        <View style={s.trafficLights}>
          <View style={[s.tl, { backgroundColor: "#FF5F57" }]} />
          <View style={[s.tl, { backgroundColor: "#FFBD2E" }]} />
          <View style={[s.tl, { backgroundColor: "#28C840" }]} />
        </View>
        <View style={s.titleMid}>
          <View style={s.titleIco}><Text style={s.titleIcoTxt}>✦</Text></View>
          <Text style={s.titleName}>Turbo Academy · Home</Text>
        </View>
        <View style={s.titleRight}>
          <Text style={s.titleTime}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          <TouchableOpacity style={s.titleBell}>
            <Text style={{ fontSize: 13 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App shell */}
      <View style={s.shell}>
        <Sidebar activeNav={activeNav} onNav={setActiveNav} profile={profile} streak={streak} xp={xp} level={level} />

        {/* Main content */}
        <ScrollView style={s.main} contentContainerStyle={s.mainContent} showsVerticalScrollIndicator={false}>
          {/* Greeting + search */}
          <View style={s.topBar}>
            <View>
              <Text style={s.greetTitle}>{greeting}, {profileName}! 👋</Text>
              <Text style={s.greetSub}>
                {streak > 0
                  ? `You're on a ${streak}-day streak — keep going!`
                  : "Complete a lesson to start your streak!"}
              </Text>
            </View>
            <View style={s.searchBox}>
              <Text style={{ fontSize: 14, opacity: 0.4 }}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Search subjects, topics…"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* Hero */}
          {currentDay ? (
            <HeroBanner
              label="Continue Learning"
              title={currentDay.title}
              subtitle={`Day ${currentDay.day} of ${totalDays} · ${program?.title || "AI Operator"}`}
              progress={completedCount / totalDays}
              timeLabel="~10–15 min"
              difficulty=""
              xpReward={`${completedCount}/${totalDays}`}
              onPress={() => handlePressDay(currentDay.unitId, currentDay.day)}
            />
          ) : nextUp ? (
            <HeroBanner
              label="AI Operator"
              title="28-Day Program"
              subtitle={`${completedCount}/${totalDays} completed`}
              progress={completedCount / totalDays}
              timeLabel="~10–15 min"
              difficulty=""
              xpReward={`${completedCount}/${totalDays}`}
              onPress={() => handlePressDay(nextUp.unitId, nextUp.day)}
            />
          ) : (
            <HeroBanner
              label={program?.title || "AI Operator"}
              title={`${completedCount}/${totalDays} completed`}
              subtitle="28-Day Program"
              progress={completedCount / totalDays}
              timeLabel="~10–15 min"
              difficulty={completedCount === totalDays ? "🎉" : ""}
              xpReward={`${completedCount}/${totalDays}`}
              onPress={() => {}}
            />
          )}

          {/* AI Tutor (beta) */}
          {currentDay && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleMessenger}
              style={s.tutorBanner}
            >
              <Text style={{ fontSize: 28 }}>💬</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.tutorTitle}>
                  Try the AI Tutor (beta)
                </Text>
                <Text style={s.tutorSub}>
                  Days 1–3 as a chat — tap through, or ask your own question.
                </Text>
              </View>
              <Text style={s.tutorArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Day Cards */}
          <View style={s.secHdr}>
            <Text style={s.secTitle}>AI Operator · 28-Day Program</Text>
            <Text style={s.journeyProgress}>{completedCount}/{totalDays} days</Text>
          </View>

          {profileLoading || unitsLoading ? (
            <Text style={{ color: "#b0a8c0", padding: 20 }}>Loading program…</Text>
          ) : (
            <DayCards days={days} onPressDay={handlePressDay} />
          )}

          {/* Activity */}
          <View style={[s.secHdr, { marginTop: 32 }]}>
            <Text style={s.secTitle}>Recent Activity</Text>
          </View>

          <ActivityTable completedCount={completedCount} totalDays={totalDays} />

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

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
    paddingHorizontal: 12,
    gap: 12,
  },
  trafficLights: { flexDirection: "row", gap: 6, width: 60 },
  tl: { width: 12, height: 12, borderRadius: 6 },
  titleMid: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  titleIco: { width: 18, height: 18, borderRadius: 6, backgroundColor: "#6565E6", justifyContent: "center", alignItems: "center" },
  titleIcoTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  titleName: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500" },
  titleRight: { width: 60, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  titleTime: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  titleBell: { padding: 2 },

  // Shell
  shell: { flex: 1, flexDirection: "row" },

  // Sidebar
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: "#1C1040",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.06)",
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24, paddingHorizontal: 4 },
  brandIco: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#6565E6", justifyContent: "center", alignItems: "center" },
  brandIcoTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  brandName: { color: "#fff", fontSize: 15, fontWeight: "700" },

  userCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sbAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#6565E6", justifyContent: "center", alignItems: "center" },
  sbAvatarTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  sbName: { color: "#fff", fontSize: 13, fontWeight: "600" },
  sbHandle: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  lvlPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10,
    alignSelf: "flex-start", marginBottom: 10,
  },
  lvlTxt: { color: "#B8ACE0", fontSize: 11, fontWeight: "600" },
  xpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpRowLbl: { color: "rgba(255,255,255,0.4)", fontSize: 10 },
  xpRowPct: { color: "rgba(255,255,255,0.5)", fontSize: 10 },
  xpTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 8 },
  xpFill: { height: 4, backgroundColor: "#6565E6", borderRadius: 2 },
  coinRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  coinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FCD34D" },
  coinVal: { color: "#fff", fontSize: 12, fontWeight: "700" },
  coinSub: { color: "rgba(255,255,255,0.4)", fontSize: 10, marginLeft: 4 },

  navSection: {},
  navSec: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginTop: 12, marginBottom: 4, paddingHorizontal: 4 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8 },
  navItemActive: { backgroundColor: "rgba(101, 101, 230, 0.15)" },
  navIco: { fontSize: 16, width: 24, textAlign: "center" },
  navLbl: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: "500" },
  navLblActive: { color: "#fff", fontWeight: "600" },

  statsArea: { marginTop: "auto", paddingTop: 16, gap: 8 },
  statCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10,
  },
  statLbl: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  statSub: { color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 1 },
  statVal: { color: "#fff", fontSize: 16, fontWeight: "700" },
  statUnit: { color: "rgba(255,255,255,0.4)", fontSize: 10 },

  // Main content
  main: { flex: 1, backgroundColor: "#0D0A1A" },
  mainContent: { padding: 24, maxWidth: 900 },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greetTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  greetSub: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10,
    paddingHorizontal: 12, height: 40, width: 240, gap: 8,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 13, outlineStyle: "none" as any, outlineWidth: 0 },

  // Hero
  hero: {
    backgroundColor: "#1C1040", borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row", marginBottom: 20,
  },
  heroLeft: { flex: 1, padding: 20 },
  heroTag: { color: "#6565E6", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  heroSub: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  heroChips: { flexDirection: "row", gap: 6, marginTop: 12 },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heroChipHard: { backgroundColor: "rgba(239,68,68,0.15)" },
  heroChipTxt: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  heroBottom: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  heroPTrack: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3 },
  heroPFill: { height: 6, backgroundColor: "#6565E6", borderRadius: 3 },
  heroPct: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", width: 36, textAlign: "right" },
  heroCta: {
    backgroundColor: "#6565E6", borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  heroCtaTxt: { color: "#fff", fontSize: 13, fontWeight: "600" },
  heroRight: { width: 100, position: "relative", overflow: "hidden" },
  hrc: { position: "absolute", width: 100, height: 20, borderRadius: 10, opacity: 0.1 },
  hrc1: { top: 10, right: -20, width: 120, height: 120, backgroundColor: "#6565E6", borderRadius: 60 },
  hrc2: { bottom: 30, right: -30, width: 100, height: 100, backgroundColor: "#8B5CF6", borderRadius: 50 },
  hrc3: { bottom: -10, right: -10, width: 80, height: 80, backgroundColor: "#EC4899", borderRadius: 40 },
  hrd: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(101,101,230,0.05)" },

  // Tutor banner
  tutorBanner: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tutorTitle: { fontSize: 16, fontWeight: "700", color: "#047857" },
  tutorSub: { fontSize: 13, color: "#5A4E40", marginTop: 2 },
  tutorArrow: { fontSize: 20, color: "#047857" },

  // Section header
  secHdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  secTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  journeyProgress: { color: "rgba(255,255,255,0.5)", fontSize: 12 },

  // Day cards
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayCard: {
    width: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dayCardCurrent: { borderColor: "#6565E6", backgroundColor: "rgba(101,101,230,0.1)" },
  dayCardDone: { borderColor: "rgba(5,150,105,0.3)", backgroundColor: "rgba(5,150,105,0.08)" },
  dayCardLocked: { opacity: 0.5 },
  dayCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 6,
  },
  dayCircleDone: { backgroundColor: "#059669" },
  dayCircleCurrent: { backgroundColor: "#6565E6" },
  dayCheck: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dayNum: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  dayNumCurrent: { color: "#fff" },
  dayNumLocked: { color: "rgba(255,255,255,0.3)" },
  dayCardTitle: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 14 },
  currentPill: { fontSize: 9, fontWeight: "700", color: "#6565E6", marginTop: 4, letterSpacing: 1 },
  lockPill: { fontSize: 12, marginTop: 4 },

  // Activity
  actHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 4 },
  actHdrCell: { flex: 1, color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  actRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  actCell: { flex: 1 },
  actIconBg: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  actName: { color: "#fff", fontSize: 13, fontWeight: "600" },
  actChap: { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 },
  actStatus: { backgroundColor: "rgba(101,101,230,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  actStatusTxt: { color: "#B8ACE0", fontSize: 11, fontWeight: "500" },
});
