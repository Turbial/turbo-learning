// ─── Admin API — Student Progress Dashboard ───
// Serves data for the admin dashboard at docs/admin-dashboard.html
// Uses service_role key to bypass RLS for admin view.
// Compatible with plain http module (no Express dependency).

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

let sb;
function getClient() {
  if (!sb) {
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing SUPABASE_SERVICE_KEY or EXPO_PUBLIC_SUPABASE_URL');
    }
    sb = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return sb;
}

// ─── Summary stats for dashboard header ───
async function getSummary() {
  const client = getClient();

  const { count: totalStudents } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { data: xpData } = await client
    .from('profiles')
    .select('xp, level');

  const avgXp = xpData?.length > 0
    ? Math.round(xpData.reduce((s, p) => s + (p.xp || 0), 0) / xpData.length)
    : 0;

  const avgLevel = xpData?.length > 0
    ? Math.round(xpData.reduce((s, p) => s + (p.level || 1), 0) / xpData.length * 10) / 10
    : 1;

  const today = new Date().toISOString().split('T')[0];
  const { count: activeToday } = await client
    .from('streak_log')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);

  const { count: totalCompletions } = await client
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: newStudents } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  return {
    totalStudents: totalStudents ?? 0,
    activeToday: activeToday ?? 0,
    avgXp,
    avgLevel,
    totalCompletions: totalCompletions ?? 0,
    newStudentsThisWeek: newStudents ?? 0,
  };
}

// ─── All students with progress ───
async function getAllStudents() {
  const client = getClient();

  const { data: profiles } = await client
    .from('profiles')
    .select('*')
    .order('xp', { ascending: false });

  if (!profiles || profiles.length === 0) return [];

  const { data: allProgress } = await client
    .from('lesson_progress')
    .select('user_id, lesson_id, completed_at, xp_earned, score');

  const { data: enrollments } = await client
    .from('enrollments')
    .select('user_id, program_id, started_at');

  const { data: programs } = await client
    .from('programs')
    .select('id, slug, title');

  const programMap = new Map(programs?.map(p => [p.id, p]) ?? []);
  const enrollMap = new Map();
  enrollments?.forEach(e => {
    if (!enrollMap.has(e.user_id)) {
      enrollMap.set(e.user_id, {
        program: programMap.get(e.program_id),
        started_at: e.started_at,
      });
    }
  });

  const progressMap = new Map();
  allProgress?.forEach(p => {
    if (!progressMap.has(p.user_id)) progressMap.set(p.user_id, []);
    progressMap.get(p.user_id).push(p);
  });

  const { count: totalLessons } = await client
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: streakData } = await client
    .from('streak_log')
    .select('user_id, date')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

  const streakMap = new Map();
  streakData?.forEach(s => {
    if (!streakMap.has(s.user_id)) streakMap.set(s.user_id, []);
    streakMap.get(s.user_id).push(s.date);
  });

  const students = profiles.map(profile => {
    const progress = progressMap.get(profile.id) ?? [];
    const streakLog = streakMap.get(profile.id) ?? [];
    const daysCompleted = new Set(progress.map(p => p.lesson_id)).size;
    const recentDate = progress.length > 0 ? progress[0].completed_at : null;

    let streak = 0;
    if (streakLog.length > 0) {
      const dates = [...new Set(streakLog.map((s) => s.date))].sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      let checkDate = new Date(today);
      for (const d of dates) {
        const expected = checkDate.toISOString().split('T')[0];
        if (d === expected) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
        else break;
      }
    }

    const enrollment = enrollMap.get(profile.id);

    return {
      id: profile.id,
      name: profile.name || 'Anonymous',
      email: profile.email || '',
      xp: profile.xp || 0,
      level: profile.level || 1,
      streak: streak || profile.streak || 0,
      daysCompleted,
      totalLessons: totalLessons ?? 0,
      lastActive: recentDate,
      onboarded: profile.onboarded ?? false,
      program: enrollment?.program?.title ?? enrollment?.program?.slug ?? 'None',
      enrolledAt: enrollment?.started_at ?? null,
      createdAt: profile.created_at,
    };
  });

  return students;
}

// ─── Per-day completion data ───
async function getCompletionByDay() {
  const client = getClient();

  const { data: units } = await client
    .from('units')
    .select('id, order_num, title, program_id')
    .order('order_num');

  if (!units || units.length === 0) return [];

  const { data: lessons } = await client
    .from('lessons')
    .select('id, unit_id');

  const lessonToUnit = new Map();
  lessons?.forEach(l => lessonToUnit.set(l.id, l.unit_id));

  const { data: completions } = await client
    .from('lesson_progress')
    .select('lesson_id, user_id');

  const completionByUnit = new Map();
  units.forEach(u => completionByUnit.set(u.id, { unit: u, completions: new Set() }));

  completions?.forEach(c => {
    const unitId = lessonToUnit.get(c.lesson_id);
    if (unitId && completionByUnit.has(unitId)) {
      completionByUnit.get(unitId).completions.add(c.user_id);
    }
  });

  const { count: totalStudents } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const result = [];
  for (const [, data] of completionByUnit) {
    result.push({
      day: data.unit.order_num,
      title: data.unit.title || `Day ${data.unit.order_num}`,
      completions: data.completions.size,
      totalStudents: totalStudents ?? 1,
      completionRate: totalStudents > 0
        ? Math.round((data.completions.size / totalStudents) * 100)
        : 0,
    });
  }

  return result.sort((a, b) => a.day - b.day);
}

// ─── HTTP route handler ───
// Returns { ok, data } or { ok: false, error }
async function handleAdminRoute(url) {
  if (url === '/api/admin/summary') return { ok: true, data: await getSummary() };
  if (url === '/api/admin/students') return { ok: true, data: await getAllStudents() };
  if (url === '/api/admin/completion-by-day') return { ok: true, data: await getCompletionByDay() };
  return null; // not an admin route
}

module.exports = { handleAdminRoute };
