import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui/Spinner'
import { usePageTitle } from '../hooks/usePageTitle'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

function usePublicProfile(userId?: string) {
  return useQuery({
    queryKey: ['publicProfile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, xp, streak, goal')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data as { id: string; name?: string; xp: number; streak: number; goal?: string }
    },
    staleTime: 5 * 60_000,
    retry: false,
  })
}

function useBadgeCount(userId?: string) {
  return useQuery({
    queryKey: ['publicBadgeCount', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count } = await supabase
        .from('user_badges')
        .select('badge_id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return count ?? 0
    },
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export default function Share() {
  const { userId } = useParams<{ userId: string }>()
  const { data: profile, isLoading, isError } = usePublicProfile(userId)
  const { data: badgeCount = 0 } = useBadgeCount(userId)

  usePageTitle(profile?.name ? `${profile.name} on Turbo Learning` : 'Turbo Learning')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-gray-400 mb-6">This profile may be private or the link may be incorrect.</p>
          <Link to="/auth/register" className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Join Turbo Learning
          </Link>
        </div>
      </div>
    )
  }

  const level = xpToLevel(profile.xp)
  const initial = (profile.name || 'L')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-6">
          <span className="text-3xl">⚡</span>
          <p className="text-gray-400 text-sm mt-1">Turbo Learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 pt-8 pb-16 text-center relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-black mx-auto mb-3">
              {initial}
            </div>
            <h1 className="text-xl font-bold text-white">{profile.name ?? 'Turbo Learner'}</h1>
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mt-1">
              Level {level}
            </span>
          </div>

          {/* Stats */}
          <div className="px-6 -mt-8 relative z-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 grid grid-cols-3 gap-3 text-center mb-6">
              {[
                { label: 'XP', value: profile.xp.toLocaleString(), icon: '⚡' },
                { label: 'Streak', value: `${profile.streak}🔥`, icon: null },
                { label: 'Badges', value: badgeCount, icon: '🎖️' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-lg font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pb-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Learn AI, earn XP, and compete — just like {profile.name?.split(' ')[0] ?? 'them'}.
            </p>
            <Link
              to="/auth/register"
              className="block w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-bold transition-colors"
            >
              Join for free →
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">turbolearning.ai</p>
      </div>
    </div>
  )
}
