import { useAuth } from '../data/useAuth'
import { useProfile, useBadges } from '../data/queries'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 100
}

export default function Progress() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h1>

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
        <ProgressBar
          value={levelProgress}
          max={levelTotal}
          label={`Level ${level} → ${level + 1}`}
          showPercent
          size="lg"
          className="mb-1"
        />
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
            <p className="text-sm text-gray-500">days 🔥</p>
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
              <p className={`text-xl ${streak >= milestone ? '🔥' : '💤'}`}>{streak >= milestone ? '🔥' : '💤'}</p>
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
          <div className="text-center py-8">
            <span className="text-4xl">🏅</span>
            <p className="text-gray-500 mt-2 text-sm">Complete lessons to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {userBadges.map((ub: any) => {
              const badge = Array.isArray(ub.badges) ? ub.badges[0] : ub.badges
              return (
                <div key={ub.badge_id} className="bg-yellow-50 rounded-2xl p-3 text-center">
                  <span className="text-3xl">{badge?.icon ?? '🏅'}</span>
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
