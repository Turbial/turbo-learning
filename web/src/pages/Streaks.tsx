import { useAuth } from '../data/useAuth'
import { useProfile } from '../data/queries'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { StatCard } from '../components/ui/StatCard'
import { HeatmapCalendar } from '../components/ui/HeatmapCalendar'
import { usePageTitle } from '../hooks/usePageTitle'

const MILESTONES = [
  { days: 3,   label: '3 days',   icon: '🌱' },
  { days: 7,   label: '1 week',   icon: '🔥' },
  { days: 14,  label: '2 weeks',  icon: '⚡' },
  { days: 30,  label: '1 month',  icon: '🏆' },
  { days: 60,  label: '2 months', icon: '💎' },
  { days: 100, label: '100 days', icon: '👑' },
]

const TIPS = [
  { icon: '⏰', tip: 'Set a daily reminder at the same time each day — consistency beats motivation.' },
  { icon: '🛡️', tip: 'Use a shield when life gets in the way so your streak stays intact.' },
  { icon: '🎯', tip: 'Even one short lesson counts. Aim for progress, not perfection.' },
]

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns the Monday for the week containing date
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Streaks() {
  usePageTitle('Streak Stats')
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()

  const { data: completedDates = [], isLoading: datesLoading } = useQuery({
    queryKey: ['lesson-progress-dates', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null)
      if (error) throw error
      return (data ?? []).map((r: { completed_at: string }) =>
        r.completed_at.slice(0, 10)
      )
    },
  })

  const activeDateSet = new Set<string>(completedDates)
  const todayISO = toISODate(new Date())
  const todayDone = activeDateSet.has(todayISO)

  // Build weekly breakdown: last 8 weeks (Mon–Sun)
  const weeklyBreakdown = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const latestMonday = getMondayOf(today)
    const weeks: { label: string; days: number; lessons: number }[] = []
    for (let w = 7; w >= 0; w--) {
      const monday = new Date(latestMonday)
      monday.setDate(monday.getDate() - w * 7)
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      const label = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      let lessons = 0
      let activeDays = 0
      for (let d = 0; d < 7; d++) {
        const day = new Date(monday)
        day.setDate(day.getDate() + d)
        if (day > today) break
        if (activeDateSet.has(toISODate(day))) {
          lessons++
          activeDays++
        }
      }
      weeks.push({ label, days: activeDays, lessons })
    }
    return weeks
  })()

  const streak = profile?.streak ?? 0
  const shields = profile?.shield_count ?? 0

  // Rough longest streak calc from active dates
  const longestStreak = (() => {
    const sorted = [...activeDateSet].sort()
    let best = 0
    let current = 0
    let prevDate: Date | null = null
    for (const iso of sorted) {
      const d = new Date(iso + 'T00:00:00')
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / 86400000
        if (diff === 1) {
          current++
        } else {
          best = Math.max(best, current)
          current = 1
        }
      } else {
        current = 1
      }
      prevDate = d
    }
    return Math.max(best, current)
  })()

  const isLoading = profileLoading || datesLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Streak Stats</h1>
        <p className="text-gray-500 mt-1">Track your daily learning habit.</p>
      </div>

      {/* Streak at risk warning */}
      {!todayDone && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="font-semibold text-orange-800 text-sm">Streak at risk!</p>
            <p className="text-orange-700 text-xs mt-0.5">
              You haven't completed a lesson today. Do one now to keep your streak alive.
            </p>
          </div>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={streak} label="Current Streak" icon="🔥" color="orange" />
        <StatCard value={longestStreak} label="Longest Streak" icon="🏆" color="green" />
        <StatCard value={completedDates.length} label="Total Days Active" icon="📅" color="blue" />
        <StatCard value={shields} label="Shields" icon="🛡️" color="purple" />
      </div>

      {/* Heatmap */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Activity — Last 3 Months</h2>
        <HeatmapCalendar activeDates={activeDateSet} weeks={13} />
        <div className="flex items-center gap-2 mt-3">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
          <span className="text-xs text-gray-400">No activity</span>
          <span className="w-3 h-3 rounded-sm bg-green-400 inline-block ml-2" />
          <span className="text-xs text-gray-400">Active</span>
        </div>
      </Card>

      {/* Milestones */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Streak Milestones</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {MILESTONES.map(m => {
            const achieved = streak >= m.days || longestStreak >= m.days
            return (
              <div
                key={m.days}
                className={`rounded-xl p-3 text-center transition-colors ${
                  achieved ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <span
                  className={`text-2xl block mb-1 ${achieved ? '' : 'grayscale opacity-40'}`}
                  aria-hidden="true"
                >
                  {m.icon}
                </span>
                <p className={`text-xs font-bold ${achieved ? 'text-orange-600' : 'text-gray-400'}`}>
                  {m.label}
                </p>
                {achieved && (
                  <p className="text-xs text-green-600 mt-0.5">Achieved</p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Weekly breakdown table */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Weekly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-2">Week of</th>
                <th className="text-right text-gray-500 font-medium pb-2">Active days</th>
                <th className="text-right text-gray-500 font-medium pb-2">Lessons done</th>
              </tr>
            </thead>
            <tbody>
              {weeklyBreakdown.map((week, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 text-gray-700">{week.label}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`font-semibold ${
                        week.days >= 5
                          ? 'text-green-600'
                          : week.days >= 3
                          ? 'text-orange-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {week.days} / 7
                    </span>
                  </td>
                  <td className="py-2 text-right text-gray-700 font-medium">{week.lessons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shield card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            🛡️
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Streak Shields</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              You have{' '}
              <span className="font-bold text-purple-600">{shields}</span> shield
              {shields !== 1 ? 's' : ''} remaining. Shields protect your streak when you miss a day.
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Tips for Maintaining Your Streak</h2>
        <div className="space-y-3">
          {TIPS.map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">{t.icon}</span>
              <p className="text-sm text-gray-600 leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
