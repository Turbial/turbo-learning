import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { useLeaderboard } from '../data/useLeaderboard'
import { useMyLeague, TIER_INFO } from '../data/useLeagues'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'

export default function Leaderboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'league' | 'global'>('league')
  const { data: leagueData, isLoading: leagueLoading } = useMyLeague(user?.id)
  const { data: globalRows = [], isLoading: globalLoading } = useLeaderboard('global', 50)

  const tierInfo = leagueData?.tier ? TIER_INFO[leagueData.tier] : TIER_INFO.bronze

  const isLoading = tab === 'league' ? leagueLoading : globalLoading

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['league', 'global'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'league' ? 'My League' : 'Global'}
          </button>
        ))}
      </div>

      {/* League tab */}
      {tab === 'league' && (
        <div>
          {leagueData && (
            <Card className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{tierInfo.emoji}</span>
              <div>
                <p className="font-bold text-gray-900">{tierInfo.label} League</p>
                <p className="text-sm text-gray-500">Week of {new Date(leagueData.standings[0]?.week_start ?? Date.now()).toLocaleDateString()}</p>
              </div>
            </Card>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leagueData ? (
            <LeaderboardTable rows={leagueData.standings.map(s => ({
              user_id: s.user_id,
              display_name: s.display_name,
              xp: s.week_xp,
              rank: s.rank,
            }))} currentUserId={user?.id} xpLabel="Week XP" />
          ) : (
            <Card className="text-center py-12">
              <span className="text-4xl">🎖️</span>
              <p className="text-gray-500 mt-2">Joining your league...</p>
            </Card>
          )}
        </div>
      )}

      {/* Global tab */}
      {tab === 'global' && (
        <div>
          {globalLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <LeaderboardTable rows={globalRows} currentUserId={user?.id} xpLabel="Total XP" />
          )}
        </div>
      )}
    </div>
  )
}

function LeaderboardTable({
  rows,
  currentUserId,
  xpLabel,
}: {
  rows: { user_id: string; display_name: string; xp: number; rank: number }[]
  currentUserId?: string
  xpLabel: string
}) {
  if (rows.length === 0) {
    return (
      <Card className="text-center py-12">
        <span className="text-4xl">🏆</span>
        <p className="text-gray-500 mt-2">No data yet. Be the first!</p>
      </Card>
    )
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <Card padding="none">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Rank</th>
            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Learner</th>
            <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">{xpLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isMe = row.user_id === currentUserId
            const rankEmoji = getRankEmoji(row.rank)
            return (
              <tr
                key={row.user_id}
                className={`border-b border-gray-50 last:border-0 ${isMe ? 'bg-green-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-6 py-3 text-sm font-bold text-gray-500 w-16">
                  {rankEmoji ? <span className="text-lg">{rankEmoji}</span> : `#${row.rank}`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={row.display_name} size="sm" />
                    <span className={`text-sm font-medium ${isMe ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
                      {row.display_name}
                      {isMe && <span className="ml-1 text-xs text-green-600">(you)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="text-sm font-bold text-gray-900">{row.xp.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 ml-1">XP</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
