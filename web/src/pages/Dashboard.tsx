import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useProfile, useLessonProgressMap } from '../data/queries'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { usePageTitle } from '../hooks/usePageTitle'

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

export default function Dashboard() {
  usePageTitle('Dashboard')

  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: progressMap } = useLessonProgressMap(user?.id)
  const { data: todayCount, isLoading: todayLoading } = useTodayProgress(user?.id)
  const { data: activeDates, isLoading: daysLoading } = useLast28Days(user?.id)

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const streak = profile?.streak ?? 0
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelProgress = xp - currentLevelXp
  const levelTotal = nextLevelXp - currentLevelXp
  const lessonsCompleted = progressMap?.size ?? 0

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

      {/* Today's card */}
      <Card className="mb-6">
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
