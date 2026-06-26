import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useLeaderboard } from '../data/useLeaderboard'
import { useMyLeague, TIER_INFO } from '../data/useLeagues'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Skeleton } from '../components/ui/Skeleton'

type Tab = 'league' | 'weekly' | 'monthly' | 'alltime'

interface LeaderboardRow {
  user_id: string
  display_name: string
  xp: number
  rank: number
}

function getMondayDate(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

function getMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function useWeeklyLeaderboard() {
  return useQuery<LeaderboardRow[]>({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: async () => {
      const mondayDate = getMondayDate()
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('user_id, xp_earned, profiles!inner(name)')
        .gte('completed_at', mondayDate)
      if (error) throw error

      const totals: Record<string, { xp: number; name: string }> = {}
      for (const row of data ?? []) {
        const name = (row.profiles as any)?.name ?? 'Learner'
        if (!totals[row.user_id]) totals[row.user_id] = { xp: 0, name }
        totals[row.user_id].xp += row.xp_earned ?? 0
      }

      return Object.entries(totals)
        .sort((a, b) => b[1].xp - a[1].xp)
        .map(([user_id, { xp, name }], i) => ({
          user_id,
          display_name: name,
          xp,
          rank: i + 1,
        }))
    },
    staleTime: 60_000,
  })
}

function useMonthlyLeaderboard() {
  return useQuery<LeaderboardRow[]>({
    queryKey: ['leaderboard', 'monthly'],
    queryFn: async () => {
      const monthStart = getMonthStart()
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('user_id, xp_earned, profiles!inner(name)')
        .gte('completed_at', monthStart)
      if (error) throw error

      const totals: Record<string, { xp: number; name: string }> = {}
      for (const row of data ?? []) {
        const name = (row.profiles as any)?.name ?? 'Learner'
        if (!totals[row.user_id]) totals[row.user_id] = { xp: 0, name }
        totals[row.user_id].xp += row.xp_earned ?? 0
      }

      return Object.entries(totals)
        .sort((a, b) => b[1].xp - a[1].xp)
        .map(([user_id, { xp, name }], i) => ({
          user_id,
          display_name: name,
          xp,
          rank: i + 1,
        }))
    },
    staleTime: 60_000,
  })
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('league')
  const [search, setSearch] = useState('')

  const { data: leagueData, isLoading: leagueLoading } = useMyLeague(user?.id)
  const { data: allTimeRows = [], isLoading: allTimeLoading } = useLeaderboard('global', 50)
  const { data: weeklyRows = [], isLoading: weeklyLoading } = useWeeklyLeaderboard()
  const { data: monthlyRows = [], isLoading: monthlyLoading } = useMonthlyLeaderboard()

  const tierInfo = leagueData?.tier ? TIER_INFO[leagueData.tier] : TIER_INFO.bronze

  const tabConfig: Record<Tab, { label: string; rows: LeaderboardRow[]; isLoading: boolean; xpLabel: string }> = {
    league: {
      label: 'My League',
      rows: leagueData?.standings.map(s => ({
        user_id: s.user_id,
        display_name: s.display_name,
        xp: s.week_xp,
        rank: s.rank,
      })) ?? [],
      isLoading: leagueLoading,
      xpLabel: 'Week XP',
    },
    weekly: {
      label: 'Weekly',
      rows: weeklyRows,
      isLoading: weeklyLoading,
      xpLabel: 'Week XP',
    },
    monthly: {
      label: 'Monthly',
      rows: monthlyRows,
      isLoading: monthlyLoading,
      xpLabel: 'Month XP',
    },
    alltime: {
      label: 'All-Time',
      rows: allTimeRows,
      isLoading: allTimeLoading,
      xpLabel: 'Total XP',
    },
  }

  const currentTabData = tabConfig[tab]

  const filteredRows = useMemo(() => {
    if (!search.trim()) return currentTabData.rows
    const q = search.toLowerCase()
    return currentTabData.rows.filter(r => r.display_name.toLowerCase().includes(q))
  }, [currentTabData.rows, search])

  const myRow = currentTabData.rows.find(r => r.user_id === user?.id)
  const myRankInTop20 = myRow ? myRow.rank <= 20 : false

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit flex-wrap">
        {(Object.keys(tabConfig) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch('') }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabConfig[t].label}
          </button>
        ))}
      </div>

      {/* League header card */}
      {tab === 'league' && leagueData && (
        <Card className="mb-4 flex items-center gap-3">
          <span className="text-3xl">{tierInfo.emoji}</span>
          <div>
            <p className="font-bold text-gray-900">{tierInfo.label} League</p>
            <p className="text-sm text-gray-500">
              Week of {new Date(leagueData.standings[0]?.week_start ?? Date.now()).toLocaleDateString()}
            </p>
          </div>
        </Card>
      )}

      {/* Your rank callout */}
      {!currentTabData.isLoading && myRow && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">
            {myRow.rank === 1 ? '🥇' : myRow.rank === 2 ? '🥈' : myRow.rank === 3 ? '🥉' : '🏅'}
          </span>
          <div>
            <p className="font-bold text-green-800 text-sm">
              You are ranked <span className="text-lg">#{myRow.rank}</span>
            </p>
            <p className="text-green-700 text-xs">{myRow.xp.toLocaleString()} XP — {currentTabData.xpLabel}</p>
          </div>
        </div>
      )}

      {/* Search box */}
      {!currentTabData.isLoading && currentTabData.rows.length > 0 && (
        <div className="mb-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {currentTabData.isLoading ? (
        <Card>
          <Skeleton lines={8} className="mb-3" />
        </Card>
      ) : tab === 'league' && !leagueData ? (
        <Card className="text-center py-12">
          <span className="text-4xl">🎖️</span>
          <p className="text-gray-500 mt-2">Joining your league...</p>
        </Card>
      ) : (
        <>
          <LeaderboardTable
            rows={filteredRows}
            currentUserId={user?.id}
            xpLabel={currentTabData.xpLabel}
            searchActive={!!search.trim()}
          />

          {/* Out-of-top-20 footer note */}
          {!myRankInTop20 && myRow && !search && (
            <div className="mt-4 text-center text-sm text-gray-500 bg-gray-50 rounded-xl py-3 border border-gray-100">
              You are ranked <span className="font-bold text-gray-700">#{myRow.rank}</span> overall with{' '}
              <span className="font-bold text-gray-700">{myRow.xp.toLocaleString()} XP</span> — keep going!
            </div>
          )}
        </>
      )}
    </div>
  )
}

function LeaderboardTable({
  rows,
  currentUserId,
  xpLabel,
  searchActive,
}: {
  rows: LeaderboardRow[]
  currentUserId?: string
  xpLabel: string
  searchActive?: boolean
}) {
  if (rows.length === 0) {
    return (
      <Card className="text-center py-12">
        <span className="text-4xl">{searchActive ? '🔍' : '🏆'}</span>
        <p className="text-gray-500 mt-2">
          {searchActive ? 'No learners match your search.' : 'No data yet. Be the first!'}
        </p>
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
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[500px] text-sm">
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
                      <span
                        className={`text-sm font-medium min-w-0 truncate ${
                          isMe ? 'text-green-700 font-bold' : 'text-gray-900'
                        }`}
                      >
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
      </div>
    </Card>
  )
}
