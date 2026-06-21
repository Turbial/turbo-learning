import { useAuth } from '../../data/useAuth'
import { useBadges, useAllBadges } from '../../data/queries'
import { Card } from '../../components/ui/Card'

export default function Badges() {
  const { user } = useAuth()
  const { data: userBadges, isLoading } = useBadges(user?.id)
  const { data: allBadges } = useAllBadges()

  const earnedSlugs = new Set((userBadges ?? []).map((b: any) => b.badges?.slug ?? b.badge_id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Badge Gallery</h1>
        <p className="text-gray-500 mt-1">
          {earnedSlugs.size} of {allBadges?.length ?? '?'} badges earned
        </p>
      </div>

      {/* Earned */}
      {(userBadges ?? []).length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Earned</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(userBadges ?? []).map((b: any) => {
              const badge = b.badges
              return (
                <div
                  key={b.badge_id}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center text-center"
                >
                  <span className="text-3xl mb-2">{badge?.icon ?? '🎖️'}</span>
                  <p className="font-semibold text-sm text-amber-900">{badge?.name ?? 'Badge'}</p>
                  {badge?.unlock_condition && (
                    <p className="text-xs text-amber-600 mt-1">{badge.unlock_condition}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* All badges (locked/unlocked) */}
      {allBadges && allBadges.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">All Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allBadges.map(badge => {
              const earned = earnedSlugs.has(badge.slug)
              return (
                <div
                  key={badge.slug}
                  className={`rounded-xl p-4 flex flex-col items-center text-center border ${earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}
                >
                  <span className="text-3xl mb-2">{badge.icon ?? '🎖️'}</span>
                  <p className={`font-semibold text-sm ${earned ? 'text-amber-900' : 'text-gray-600'}`}>
                    {badge.name}
                  </p>
                  {badge.unlock_condition && (
                    <p className={`text-xs mt-1 ${earned ? 'text-amber-600' : 'text-gray-400'}`}>
                      {badge.unlock_condition}
                    </p>
                  )}
                  {earned && (
                    <span className="mt-2 text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">Earned</span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {(!userBadges || userBadges.length === 0) && (!allBadges || allBadges.length === 0) && (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">🎖️</p>
          <p className="text-gray-500">Complete lessons to earn badges!</p>
        </Card>
      )}
    </div>
  )
}
