import { useAuth } from '../data/useAuth'
import { useProfile, useBadges } from '../data/queries'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { StatCard } from '../components/ui/StatCard'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 100
}

export default function Progress() {
  usePageTitle('Progress')
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: userBadges = [] } = useBadges(user?.id)

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const streak = profile?.streak ?? 0
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelProgress = xp - currentLevelXp
  const levelTotal = nextLevelXp - currentLevelXp
  const levelProgressPercent = Math.round((levelProgress / Math.max(levelTotal, 1)) * 100)

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
