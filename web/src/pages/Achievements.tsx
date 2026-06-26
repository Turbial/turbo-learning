import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { usePageTitle } from '../hooks/usePageTitle'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp_reward: number
  user_achievements: {
    progress: number | null
    unlocked: boolean | null
    unlocked_at: string | null
  }[]
}

type AchievementStatus = 'unlocked' | 'in-progress' | 'locked'

function getStatus(ua: Achievement['user_achievements']): AchievementStatus {
  const row = ua?.[0]
  if (!row) return 'locked'
  if (row.unlocked) return 'unlocked'
  if (row.progress != null && row.progress > 0) return 'in-progress'
  return 'locked'
}

function getProgress(ua: Achievement['user_achievements']): number {
  return ua?.[0]?.progress ?? 0
}

function sortAchievements(list: Achievement[]): Achievement[] {
  return [...list].sort((a, b) => {
    const sa = getStatus(a.user_achievements)
    const sb = getStatus(b.user_achievements)
    if (sa === sb) {
      if (sa === 'in-progress') {
        return getProgress(b.user_achievements) - getProgress(a.user_achievements)
      }
      return 0
    }
    const order: Record<AchievementStatus, number> = { unlocked: 0, 'in-progress': 1, locked: 2 }
    return order[sa] - order[sb]
  })
}

export default function Achievements() {
  usePageTitle('Achievements')
  const { user } = useAuth()

  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*, user_achievements!left(progress, unlocked, unlocked_at)')
        .eq('user_achievements.user_id', user!.id)
      if (error) throw error
      return (data ?? []) as Achievement[]
    },
  })

  const sorted = sortAchievements(achievements)
  const unlockedCount = sorted.filter(a => getStatus(a.user_achievements) === 'unlocked').length
  const totalXpEarned = sorted
    .filter(a => getStatus(a.user_achievements) === 'unlocked')
    .reduce((sum, a) => sum + (a.xp_reward ?? 0), 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-500 mt-1">Your accomplishments so far.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{unlockedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Unlocked</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-400">{achievements.length - unlockedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Remaining</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-500">{totalXpEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">XP Earned</p>
        </Card>
      </div>

      {achievements.length === 0 ? (
        <EmptyState
          icon="🏅"
          title="No achievements yet"
          description="Complete lessons and reach milestones to earn achievements."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map(achievement => {
            const status = getStatus(achievement.user_achievements)
            const progress = getProgress(achievement.user_achievements)
            const unlockedAt = achievement.user_achievements?.[0]?.unlocked_at

            const isUnlocked = status === 'unlocked'
            const isInProgress = status === 'in-progress'

            return (
              <div
                key={achievement.id}
                className={`rounded-2xl border p-4 flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                {/* Icon */}
                <span
                  className={`text-4xl mb-3 block leading-none ${
                    !isUnlocked && !isInProgress ? 'grayscale opacity-30' : ''
                  } ${isInProgress && !isUnlocked ? 'opacity-60' : ''}`}
                  aria-hidden="true"
                >
                  {achievement.icon ?? '🏅'}
                </span>

                {/* Title */}
                <h3
                  className={`font-bold text-sm leading-tight mb-1 ${
                    isUnlocked ? 'text-yellow-900' : 'text-gray-700'
                  }`}
                >
                  {achievement.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {achievement.description}
                </p>

                {/* XP reward badge */}
                {achievement.xp_reward > 0 && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full mb-3 ${
                      isUnlocked ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    +{achievement.xp_reward} XP
                  </span>
                )}

                {/* Progress bar for in-progress */}
                {isInProgress && (
                  <div className="w-full mt-auto">
                    <ProgressBar value={progress} max={100} showPercent size="sm" />
                  </div>
                )}

                {/* Unlocked timestamp */}
                {isUnlocked && unlockedAt && (
                  <p className="text-xs text-yellow-700 mt-auto">
                    Unlocked{' '}
                    {new Date(unlockedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {/* Locked indicator */}
                {status === 'locked' && (
                  <p className="text-xs text-gray-400 mt-auto">Locked</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
