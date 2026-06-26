import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useProfile, useLessonProgressMap } from '../data/queries'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { usePageTitle } from '../hooks/usePageTitle'
import { RingProgress } from '../components/ui/RingProgress'
import { LineChart } from '../components/ui/LineChart'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
function xpToNextLevel(xp: number) {
  const level = xpToLevel(xp)
  return level * level * 100 - xp
}
function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 100
}

// ─── Today's completed lessons query ───
function useTodayProgress(userId?: string) {
  return useQuery({
    queryKey: ['todayProgress', userId],
    enabled: !!userId,
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count, error } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
      if (error) throw error
      return count ?? 0
    },
  })
}

// ─── Lessons completed this week query ───
function useLessonsThisWeek(userId?: string) {
  return useQuery({
    queryKey: ['lessonsThisWeek', userId],
    enabled: !!userId,
    queryFn: async () => {
      // Monday of the current week at midnight
      const now = new Date()
      const day = now.getDay() // 0 = Sun
      const diffToMon = (day + 6) % 7   // days since last Monday
      const monday = new Date(now)
      monday.setDate(now.getDate() - diffToMon)
      monday.setHours(0, 0, 0, 0)
      const { count, error } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', monday.toISOString())
      if (error) throw error
      return count ?? 0
    },
    staleTime: 60_000,
  })
}

// ─── Last 28 days active dates query ───
function useLast28Days(userId?: string) {
  return useQuery({
    queryKey: ['last28days', userId],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - 28)
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', since.toISOString())
      if (error) throw error
      const activeDates = new Set<string>()
      ;(data ?? []).forEach((row: any) => {
        if (row.completed_at) {
          activeDates.add(row.completed_at.slice(0, 10))
        }
      })
      return activeDates
    },
  })
}

// ─── Weekly XP chart data query (last 7 days, grouped by day) ───
function useWeeklyXp(userId?: string) {
  return useQuery({
    queryKey: ['weeklyXp', userId],
    enabled: !!userId,
    queryFn: async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at, xp_earned')
        .eq('user_id', userId)
        .gte('completed_at', sevenDaysAgo.toISOString())
      if (error) throw error

      // Build a map of dateStr -> totalXp for the last 7 days
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const xpByDate: Record<string, number> = {}

      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().slice(0, 10)
        xpByDate[dateStr] = 0
      }

      ;(data ?? []).forEach((row: any) => {
        if (row.completed_at) {
          const dateStr = row.completed_at.slice(0, 10)
          if (dateStr in xpByDate) {
            xpByDate[dateStr] = (xpByDate[dateStr] ?? 0) + (row.xp_earned ?? 0)
          }
        }
      })

      return Object.entries(xpByDate).map(([dateStr, value]) => {
        const d = new Date(dateStr + 'T00:00:00')
        return { label: dayLabels[d.getDay()], value }
      })
    },
    staleTime: 60_000,
  })
}

const QUICK_ACTIONS = [
  { label: 'Continue Journey', icon: '→', to: '/' },
  { label: 'Daily Challenge', icon: '⚡', to: '/challenge' },
  { label: 'Review Cards', icon: '🔁', to: '/review' },
  { label: 'My Notes', icon: '📝', to: '/notes' },
]

function getInsight(streak: number, xp: number): string {
  if (streak < 3) return '🌱 Build momentum — complete a lesson every day this week!'
  if (streak >= 7) return '🔥 Amazing streak! You\'re in the top learners.'
  if (xp < 500) return '⚡ Complete lessons to earn XP and level up faster.'
  return '🏆 You\'re doing great! Challenge yourself with harder content.'
}

export default function Dashboard() {
  usePageTitle('Dashboard')

  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: progressMap } = useLessonProgressMap(user?.id)
  const { data: todayCount, isLoading: todayLoading } = useTodayProgress(user?.id)
  const { data: activeDates, isLoading: daysLoading } = useLast28Days(user?.id)
  const { data: weeklyCount, isLoading: weeklyLoading } = useLessonsThisWeek(user?.id)
  const { data: weeklyXpData, isLoading: weeklyXpLoading } = useWeeklyXp(user?.id)

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const streak = profile?.streak ?? 0
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelProgress = xp - currentLevelXp
  const levelTotal = nextLevelXp - currentLevelXp
  const lessonsCompleted = progressMap?.size ?? 0

  // Weekly goal ring — use profile.daily_mins if available, default to 15 min/day
  const dailyMins: number = (profile as any)?.daily_mins ?? 15
  const weeklyMinsGoal = dailyMins * 7
  const weeklyMinsDone = (weeklyCount ?? 0) * 5

  // Build 28-day grid from real data
  const days28: { date: string; active: boolean }[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days28.push({ date: dateStr, active: activeDates?.has(dateStr) ?? false })
  }

  const hasActivity = (activeDates?.size ?? 0) > 0

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="text-center">
              <Skeleton className="h-8 w-20 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </Card>
          ))}
        </div>
        <Card className="mb-6">
          <Skeleton lines={3} />
        </Card>
        <Card className="mb-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-32 w-full" />
        </Card>
        <Card>
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Streak at risk banner */}
      {!todayLoading && (todayCount ?? 0) === 0 && streak > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 mb-4">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">🔥</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-orange-800 text-sm">
              Your {streak}-day streak is at risk!
            </p>
            <p className="text-orange-600 text-xs mt-0.5">
              Complete a lesson today to keep your streak alive.
            </p>
          </div>
          <Link
            to="/"
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Learn now
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{xp.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total XP</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900">Lv. {level}</p>
          <p className="text-xs text-gray-500 mt-1">Current Level</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-gray-500 mt-1">Day Streak 🔥</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{lessonsCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Lessons Done</p>
        </Card>
      </div>

      {/* Weekly XP Chart */}
      <Card className="mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Weekly XP</h2>
        {weeklyXpLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <LineChart
            data={weeklyXpData ?? []}
            label="XP Earned"
          />
        )}
      </Card>

      {/* Today's card + Weekly Goal ring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Today's card */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Today</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className="text-2xl">☀️</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              {todayLoading ? (
                <Skeleton className="h-7 w-8 mx-auto mb-1" />
              ) : (
                <p className="text-xl font-bold text-blue-600">{todayCount ?? 0}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">Lessons Today</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-600">{lessonsCompleted}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Done</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-orange-500">{streak}</p>
              <p className="text-xs text-gray-500 mt-0.5">Streak 🔥</p>
            </div>
          </div>
        </Card>

        {/* Weekly Goal ring */}
        <Card>
          <h2 className="font-bold text-gray-900 mb-3">Weekly Goal</h2>
          {weeklyLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <RingProgress
                value={weeklyMinsDone}
                max={weeklyMinsGoal}
                size={80}
                strokeWidth={8}
                label={`${weeklyMinsDone}m`}
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {weeklyMinsDone}m / {weeklyMinsGoal}m
                </p>
                <p className="text-xs text-gray-500 mt-0.5">this week</p>
                <p className="text-xs text-gray-400 mt-2">
                  {weeklyCount ?? 0} lesson{(weeklyCount ?? 0) !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions grid */}
      <Card className="mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl px-4 py-3 transition-colors group"
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">{action.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Insights panel */}
      <Card className="mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Your Insight</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {getInsight(streak, xp)}
        </p>
      </Card>

      {/* Level progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-900">Level {level}</h2>
            <p className="text-sm text-gray-500">{xpToNextLevel(xp)} XP to Level {level + 1}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="font-bold text-green-600 text-sm">L{level}</span>
          </div>
        </div>
        <ProgressBar
          value={levelProgress}
          max={levelTotal}
          label={`${levelProgress} / ${levelTotal} XP`}
          showPercent
          size="lg"
        />
      </Card>

      {/* 28-day activity grid */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">28-Day Activity</h2>
        {daysLoading ? (
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : !hasActivity ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-semibold text-gray-900 mb-1">Start your first lesson!</p>
            <p className="text-sm text-gray-500 mb-4">
              Complete lessons to build your streak and earn XP.
            </p>
            <Link
              to="/"
              className="inline-block bg-green-600 text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-green-700"
            >
              Go to Journey →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5">
              {days28.map(({ date, active }) => (
                <div
                  key={date}
                  title={date}
                  className={`aspect-square rounded ${active ? 'bg-green-400' : 'bg-gray-100'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-100" />
                <span>No activity</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-400" />
                <span>Active</span>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
