import { useAuth } from '../data/useAuth'
import { useProfile, useLessonProgressMap } from '../data/queries'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'

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

// Generate last 28 days of activity mock (in real app would come from DB)
function getLast28Days(progressMap?: Set<string>) {
  const days: { date: string; active: boolean }[] = []
  const count = progressMap?.size ?? 0
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    // Show activity for recent days based on progress
    const active = i < count
    days.push({ date: dateStr, active })
  }
  return days
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: progressMap } = useLessonProgressMap(user?.id)

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const streak = profile?.streak ?? 0
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelProgress = xp - currentLevelXp
  const levelTotal = nextLevelXp - currentLevelXp
  const lessonsCompleted = progressMap?.size ?? 0

  const days28 = getLast28Days(progressMap)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
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
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">0</p>
            <p className="text-xs text-gray-500 mt-0.5">XP Today</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-500 mt-0.5">Lessons Today</p>
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
        <div className="grid grid-cols-7 gap-1.5">
          {days28.map(({ date, active }) => (
            <div
              key={date}
              title={date}
              className={`aspect-square rounded ${
                active ? 'bg-green-400' : 'bg-gray-100'
              }`}
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
      </Card>
    </div>
  )
}
