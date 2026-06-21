import { useAuth } from '../data/useAuth'
import { useMyLeague, TIER_INFO } from '../data/useLeagues'
import { Card } from '../components/ui/Card'

const TIER_ORDER = ['bronze', 'silver', 'gold', 'diamond', 'master']

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="text-sm font-bold text-gray-500 w-6 text-center">#{rank}</span>
}

function getNextReset(): string {
  const now = new Date()
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7))
  nextMonday.setHours(0, 0, 0, 0)
  const diff = nextMonday.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export default function Leagues() {
  const { user } = useAuth()
  const { data: league, isLoading, error } = useMyLeague(user?.id)

  const tier = league?.tier ?? 'bronze'
  const tierInfo = TIER_INFO[tier] ?? TIER_INFO.bronze
  const standings = league?.standings ?? []
  const myStanding = standings.find(s => s.user_id === user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <p className="text-gray-500 text-center">Could not load league data. Please try again later.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My League</h1>

      {/* Tier card */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${tierInfo.color}dd, ${tierInfo.color}99)` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Current Tier</p>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {tierInfo.emoji} {tierInfo.label} League
            </h2>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-1">Resets in</p>
            <p className="font-bold text-lg">{getNextReset()}</p>
          </div>
        </div>

        {myStanding && (
          <div className="bg-white/20 rounded-xl p-3 flex justify-between">
            <div>
              <p className="text-xs text-white/70">Your rank</p>
              <p className="font-bold text-xl">#{myStanding.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">This week</p>
              <p className="font-bold text-xl">{myStanding.week_xp} XP</p>
            </div>
          </div>
        )}
      </div>

      {/* Tier ladder */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Tier Ladder</h2>
        <div className="space-y-2">
          {[...TIER_ORDER].reverse().map(t => {
            const info = TIER_INFO[t]
            const isCurrentTier = t === tier
            return (
              <div
                key={t}
                className={`flex items-center gap-3 p-3 rounded-xl ${isCurrentTier ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
              >
                <span className="text-xl">{info.emoji}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isCurrentTier ? 'text-green-700' : 'text-gray-700'}`}>
                    {info.label}
                    {isCurrentTier && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">You're here</span>}
                  </p>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Standings */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">
          {tierInfo.emoji} {tierInfo.label} Standings
        </h2>
        {standings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No standings yet this week.</p>
        ) : (
          <div className="space-y-1">
            {standings.map(s => {
              const isMe = s.user_id === user?.id
              return (
                <div
                  key={s.user_id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isMe ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    <RankBadge rank={s.rank} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-green-700' : 'text-gray-800'}`}>
                      {s.display_name} {isMe && '(you)'}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${isMe ? 'text-green-600' : 'text-gray-700'}`}>
                    {s.week_xp} XP
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
