import { useMemo } from 'react'
import { useAuth } from '../data/useAuth'
import { useMyLeague, TIER_INFO } from '../data/useLeagues'
import { useProfile } from '../data/queries'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { ProgressBar } from '../components/ui/ProgressBar'
import { usePageTitle } from '../hooks/usePageTitle'

const TIER_ORDER = ['bronze', 'silver', 'gold', 'diamond', 'master']

// Weekly XP thresholds to reach each tier
const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0,
  silver: 200,
  gold: 500,
  diamond: 1000,
  master: 2000,
}

const TIER_BENEFITS: Record<string, string> = {
  bronze: 'Basic league access + weekly rankings',
  silver: 'Silver badge + 1.1× XP multiplier on lessons',
  gold: 'Gold badge + 1.25× XP multiplier + priority leaderboard position',
  diamond: 'Diamond badge + 1.5× XP multiplier + exclusive content preview',
  master: 'Master badge + 2× XP multiplier + direct challenge to top learners',
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl" role="img" aria-label="Gold medal">🥇</span>
  if (rank === 2) return <span className="text-xl" role="img" aria-label="Silver medal">🥈</span>
  if (rank === 3) return <span className="text-xl" role="img" aria-label="Bronze medal">🥉</span>
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

function getWeekStart(offset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7) - offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface WeekRow {
  label: string
  xp: number
}

export default function Leagues() {
  usePageTitle('My League')
  const { user } = useAuth()
  const { data: league, isLoading, error } = useMyLeague(user?.id)
  const { data: profile } = useProfile()

  // Weekly XP history query — groups lesson_progress rows by ISO week
  const { data: weeklyHistory } = useQuery({
    queryKey: ['weekly-xp-history', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<WeekRow[]> => {
      const fourWeeksAgo = getWeekStart(4)
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('xp_earned, completed_at')
        .eq('user_id', user!.id)
        .gte('completed_at', fourWeeksAgo.toISOString())
      if (error) throw error

      // Build 4-week buckets (most recent first)
      const buckets: WeekRow[] = Array.from({ length: 4 }, (_, i) => {
        const weekStart = getWeekStart(i)
        return { label: formatWeekLabel(weekStart), xp: 0 }
      })

      ;(data ?? []).forEach(row => {
        const rowDate = new Date(row.completed_at)
        for (let i = 0; i < 4; i++) {
          const ws = getWeekStart(i)
          const we = new Date(ws)
          we.setDate(we.getDate() + 7)
          if (rowDate >= ws && rowDate < we) {
            buckets[i].xp += row.xp_earned ?? 0
            break
          }
        }
      })

      return buckets
    },
  })

  const tier = league?.tier ?? 'bronze'
  const tierInfo = TIER_INFO[tier] ?? TIER_INFO.bronze
  const standings = league?.standings ?? []
  const myStanding = standings.find(s => s.user_id === user?.id)

  const totalStandings = standings.length
  const PROMOTION_CUTOFF = 3
  const DEMOTION_CUTOFF = totalStandings - 3

  // Next tier progress
  const nextTier = useMemo(() => {
    const idx = TIER_ORDER.indexOf(tier)
    if (idx === TIER_ORDER.length - 1) return null
    return TIER_ORDER[idx + 1]
  }, [tier])

  const currentWeekXp = myStanding?.week_xp ?? 0
  const nextTierThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : TIER_THRESHOLDS.master
  const xpNeeded = Math.max(0, nextTierThreshold - currentWeekXp)
  const progressToNextTier = nextTier
    ? Math.min(100, Math.round((currentWeekXp / nextTierThreshold) * 100))
    : 100

  // Max XP in history for bar scaling
  const maxHistoryXp = useMemo(
    () => Math.max(1, ...(weeklyHistory ?? []).map(w => w.xp)),
    [weeklyHistory]
  )

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
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
              <span aria-hidden="true">{tierInfo.emoji}</span> {tierInfo.label} League
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

      {/* Progress toward next tier */}
      {nextTier && (
        <Card>
          <h2 className="font-bold text-gray-900 mb-3">Progress to {TIER_INFO[nextTier]?.label ?? nextTier} Tier</h2>
          <ProgressBar
            value={currentWeekXp}
            max={nextTierThreshold}
            label={`${currentWeekXp} / ${nextTierThreshold} weekly XP`}
            showPercent
          />
          {xpNeeded > 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              Earn <span className="font-semibold text-gray-700">{xpNeeded} more XP</span> this week to reach {TIER_INFO[nextTier]?.label ?? nextTier}.
            </p>
          ) : (
            <p className="text-sm text-green-600 font-medium mt-2">You've hit the threshold! Keep it up to promote.</p>
          )}
        </Card>
      )}

      {/* Weekly XP History */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Weekly XP History</h2>
        {(weeklyHistory ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No history yet. Complete lessons to earn XP.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Week of</th>
                  <th className="pb-2 font-medium text-right">XP Earned</th>
                  <th className="pb-2 font-medium pl-4 w-40">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(weeklyHistory ?? []).map((row, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-gray-700 font-medium">{row.label}</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{row.xp} XP</td>
                    <td className="py-2.5 pl-4">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-green-500 transition-all"
                            style={{ width: `${Math.round((row.xp / maxHistoryXp) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {Math.round((row.xp / maxHistoryXp) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Standings with promotion / demotion zones */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">
            <span aria-hidden="true">{tierInfo.emoji}</span> {tierInfo.label} Standings
          </h2>
        </div>

        {/* Zone legend */}
        {totalStandings > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <span className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 font-medium">
              <span>↑</span> Promotion zone (top 3)
            </span>
            <span className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 font-medium">
              <span>↓</span> Danger zone (bottom 3)
            </span>
          </div>
        )}

        {standings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No standings yet this week.</p>
        ) : (
          <div className="space-y-1" role="list">
            {standings.map(s => {
              const isMe = s.user_id === user?.id
              const isPromotion = s.rank <= PROMOTION_CUTOFF
              const isDemotion = totalStandings > 6 && s.rank > DEMOTION_CUTOFF

              let rowBorder = ''
              let leftAccent = ''
              if (isMe) {
                rowBorder = 'bg-green-50 border border-green-200'
              } else if (isPromotion) {
                rowBorder = 'hover:bg-green-50/50'
                leftAccent = 'border-l-4 border-l-green-400'
              } else if (isDemotion) {
                rowBorder = 'hover:bg-red-50/50'
                leftAccent = 'border-l-4 border-l-red-400'
              } else {
                rowBorder = 'hover:bg-gray-50'
              }

              return (
                <div
                  key={s.user_id}
                  role="listitem"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${rowBorder} ${leftAccent}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    <RankBadge rank={s.rank} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-green-700' : 'text-gray-800'}`}>
                      {s.display_name} {isMe && '(you)'}
                    </p>
                  </div>
                  {isPromotion && !isMe && (
                    <span className="text-xs text-green-600 font-medium hidden sm:block">↑ Promotion</span>
                  )}
                  {isDemotion && !isMe && (
                    <span className="text-xs text-red-500 font-medium hidden sm:block">↓ Danger</span>
                  )}
                  <span className={`text-sm font-bold ${isMe ? 'text-green-600' : 'text-gray-700'}`}>
                    {s.week_xp} XP
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Zone explanation card */}
      <Card className="bg-gray-50 border border-gray-200">
        <h2 className="font-bold text-gray-900 mb-3">How Zones Work</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">↑</span>
            <p><span className="font-semibold text-green-700">Promotion zone</span> — Top 3 players move up to the next tier at week reset.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 font-bold mt-0.5">—</span>
            <p><span className="font-semibold text-gray-700">Safe zone</span> — Stay in your current tier for another week.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold mt-0.5">↓</span>
            <p><span className="font-semibold text-red-600">Danger zone</span> — Bottom 3 players may drop to the tier below.</p>
          </div>
        </div>
      </Card>

      {/* Tier Benefits card */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Tier Benefits</h2>
        <div className="space-y-2">
          {TIER_ORDER.map(t => {
            const info = TIER_INFO[t]
            const isCurrentTier = t === tier
            const isUnlocked = TIER_ORDER.indexOf(t) <= TIER_ORDER.indexOf(tier)
            return (
              <div
                key={t}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  isCurrentTier
                    ? 'bg-green-50 border border-green-200'
                    : isUnlocked
                    ? 'bg-gray-50'
                    : 'bg-gray-50 opacity-60'
                }`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{info.emoji}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm mb-0.5 ${isCurrentTier ? 'text-green-700' : 'text-gray-700'}`}>
                    {info.label}
                    {isCurrentTier && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">You're here</span>
                    )}
                    {!isUnlocked && (
                      <span className="ml-2 text-xs text-gray-400">Locked</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{TIER_BENEFITS[t]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Requires {TIER_THRESHOLDS[t]} weekly XP</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tier Ladder */}
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
                <span className="text-xl" aria-hidden="true">{info.emoji}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isCurrentTier ? 'text-green-700' : 'text-gray-700'}`}>
                    {info.label}
                    {isCurrentTier && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">You're here</span>
                    )}
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
    </div>
  )
}
