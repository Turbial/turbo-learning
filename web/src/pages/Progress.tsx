import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useProfile, useBadges } from '../data/queries'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { StatCard } from '../components/ui/StatCard'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'
import { RadarChart } from '../components/ui/RadarChart'
import { LineChart } from '../components/ui/LineChart'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 100
}

// ─── Last 14 days XP grouped by day ───
function useXpHistory14Days(userId?: string) {
  return useQuery({
    queryKey: ['xpHistory14', userId],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - 13)
      since.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at, xp_earned')
        .eq('user_id', userId)
        .gte('completed_at', since.toISOString())
      if (error) throw error

      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const xpByDate: Record<string, number> = {}

      for (let i = 13; i >= 0; i--) {
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

// ─── First lesson date (for completion speed calculation) ───
function useFirstLessonDate(userId?: string) {
  return useQuery({
    queryKey: ['firstLesson', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true })
        .limit(1)
      if (error) throw error
      if (!data || data.length === 0) return null
      return data[0].completed_at as string
    },
    staleTime: 300_000,
  })
}

// ─── Total lessons completed count ───
function useTotalLessonsCount(userId?: string) {
  return useQuery({
    queryKey: ['totalLessons', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      if (error) throw error
      return count ?? 0
    },
    staleTime: 60_000,
  })
}

export default function Progress() {
  usePageTitle('Progress')
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: userBadges = [] } = useBadges(user?.id)
  const { data: xpHistory, isLoading: xpHistoryLoading } = useXpHistory14Days(user?.id)
  const { data: firstLessonDate } = useFirstLessonDate(user?.id)
  const { data: totalLessons = 0 } = useTotalLessonsCount(user?.id)

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const streak = profile?.streak ?? 0
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelProgress = xp - currentLevelXp
  const levelTotal = nextLevelXp - currentLevelXp
  const levelProgressPercent = Math.round((levelProgress / Math.max(levelTotal, 1)) * 100)
  const lessonsCompleted = totalLessons

  // ─── Skill radar dimensions ───
  const skills = [
    { label: 'Consistency', value: Math.min(100, streak * 10) },
    { label: 'Speed', value: Math.min(100, Math.round(xp / 20)) },
    { label: 'Breadth', value: Math.min(100, lessonsCompleted * 4) },
    { label: 'Depth', value: Math.min(100, level * 15) },
    { label: 'Recall', value: Math.min(100, userBadges.length * 20) },
    { label: 'Mastery', value: Math.min(100, Math.round(xp / 50)) },
  ]

  // ─── Completion speed ───
  let lessonsPerWeek: number | null = null
  if (firstLessonDate && lessonsCompleted > 0) {
    const firstDate = new Date(firstLessonDate)
    const now = new Date()
    const msElapsed = now.getTime() - firstDate.getTime()
    const weeksElapsed = Math.max(1, msElapsed / (7 * 24 * 60 * 60 * 1000))
    lessonsPerWeek = Math.round((lessonsCompleted / weeksElapsed) * 10) / 10
  }

  // ─── Next milestone ───
  const xpNeeded = levelTotal - levelProgress
  const recentXpPerDay = (() => {
    if (!xpHistory || xpHistory.length === 0) return 0
    const totalRecentXp = xpHistory.reduce((sum, d) => sum + d.value, 0)
    return totalRecentXp / xpHistory.length
  })()
  const daysEstimate = recentXpPerDay > 0
    ? Math.ceil(xpNeeded / recentXpPerDay)
    : null

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard value={xp.toLocaleString()} label="Total XP" icon="⚡" color="green" />
        <StatCard value={streak} label="Day Streak" icon="🔥" color="orange" />
        <StatCard value={level} label="Level" icon="🏅" color="blue" />
        <StatCard value={userBadges.length} label="Badges" icon="🎖️" color="purple" />
      </div>

      {/* XP & Level */}
      <Card className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-green-600">L{level}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Level {level}</h2>
            <p className="text-gray-500 text-sm">{xp.toLocaleString()} total XP earned</p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-valuenow={levelProgressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="XP progress to next level"
        >
          <ProgressBar
            value={levelProgress}
            max={levelTotal}
            label={`Level ${level} → ${level + 1}`}
            showPercent
            size="lg"
            className="mb-1"
          />
        </div>
        <p className="text-sm text-gray-500">
          {levelTotal - levelProgress} XP needed for Level {level + 1}
        </p>
      </Card>

      {/* Next Milestone card */}
      <Card className="mb-4">
        <h2 className="font-bold text-gray-900 mb-2">Next Milestone</h2>
        <p className="text-sm text-gray-700">
          You need{' '}
          <span className="font-semibold text-green-600">{xpNeeded.toLocaleString()} more XP</span>{' '}
          for Level {level + 1}.
          {daysEstimate !== null ? (
            <span className="text-gray-500"> At your current pace, roughly{' '}
              <span className="font-semibold text-gray-700">{daysEstimate} day{daysEstimate !== 1 ? 's' : ''}</span> away.
            </span>
          ) : (
            <span className="text-gray-400"> Complete more lessons to estimate your pace.</span>
          )}
        </p>
        <div className="mt-3">
          <ProgressBar
            value={levelProgress}
            max={levelTotal}
            size="sm"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
        </div>
      </Card>

      {/* Skill Radar Chart */}
      <Card className="mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Skill Profile</h2>
        <RadarChart data={skills} />
      </Card>

      {/* XP History Line Chart (14 days) */}
      <Card className="mb-4">
        <h2 className="font-bold text-gray-900 mb-4">XP Earned (Last 14 Days)</h2>
        {xpHistoryLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <LineChart
            data={xpHistory ?? []}
            label="XP Earned"
          />
        )}
      </Card>

      {/* Completion Speed card */}
      <Card className="mb-4">
        <h2 className="font-bold text-gray-900 mb-2">Completion Speed</h2>
        {lessonsPerWeek !== null ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">{lessonsPerWeek}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                You average <span className="text-blue-600">{lessonsPerWeek} lessons per week</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Based on {lessonsCompleted} lesson{lessonsCompleted !== 1 ? 's' : ''} since you started
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Complete your first lesson to see your pace.</p>
        )}
      </Card>

      {/* Streak */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Current Streak</h2>
            <p className="text-gray-500 text-sm">Keep it going — learn every day!</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-orange-500">{streak}</p>
            <p className="text-sm text-gray-500">days <span aria-hidden="true">🔥</span></p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[3, 7, 14, 30].map((milestone) => (
            <div
              key={milestone}
              className={`rounded-xl p-2 text-center ${
                streak >= milestone ? 'bg-orange-100' : 'bg-gray-50'
              }`}
            >
              <p className={`text-xl ${streak >= milestone ? '🔥' : '💤'}`} aria-hidden="true">{streak >= milestone ? '🔥' : '💤'}</p>
              <p className={`text-xs font-semibold mt-1 ${streak >= milestone ? 'text-orange-600' : 'text-gray-400'}`}>
                {milestone}d
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Badges earned */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">
          Badges Earned{' '}
          <span className="text-gray-400 font-normal text-sm">({userBadges.length})</span>
        </h2>
        {userBadges.length === 0 ? (
          <EmptyState
            icon="🏅"
            title="No badges yet"
            description="Complete lessons to earn your first badge!"
          />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {userBadges.map((ub: any) => {
              const badge = Array.isArray(ub.badges) ? ub.badges[0] : ub.badges
              return (
                <div key={ub.badge_id} className="bg-yellow-50 rounded-2xl p-3 text-center">
                  <span className="text-3xl" aria-hidden="true">{badge?.icon ?? '🏅'}</span>
                  <p className="text-xs font-medium text-gray-700 mt-1 leading-tight">{badge?.name ?? 'Badge'}</p>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
