import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useProfile, useBadges } from '../data/queries'
import { useStreakShield } from '../data/useStreakShield'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { RadarChart } from '../components/ui/RadarChart'
import { Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

const GOAL_LABELS: Record<string, string> = {
  career_change: '🚀 Career Change',
  upskill: '📈 Upskill at Work',
  build_products: '🔨 Build AI Products',
  stay_current: '📰 Stay Current',
  curiosity: '💡 Curiosity',
}

const QUICK_LINKS = [
  { to: '/profile/badges', icon: '🎖️', label: 'Badges' },
  { to: '/profile/portfolio', icon: '📁', label: 'Portfolio' },
  { to: '/profile/billing', icon: '💳', label: 'Billing' },
  { to: '/profile/settings', icon: '⚙️', label: 'Settings' },
]

const NAV_LINKS = [
  { to: '/leagues', icon: '🏆', label: 'My League' },
  { to: '/shop', icon: '🛡️', label: 'Shield Shop' },
  { to: '/profile/portfolio', icon: '📁', label: 'Portfolio' },
  { to: '/profile/badges', icon: '🎖️', label: 'Badge Gallery' },
  { to: '/profile/billing', icon: '💳', label: 'Billing' },
  { to: '/profile/settings', icon: '⚙️', label: 'Settings' },
]

interface ActivityItem {
  completed_at: string
  xp_earned: number
  lessons: { title: string } | null
}

interface TotalStats {
  total_lessons: number
  total_xp: number
  member_since: string | null
}

function useActivityFeed(userId: string | undefined) {
  return useQuery<ActivityItem[]>({
    queryKey: ['activity-feed', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at, xp_earned, lessons(title)')
        .eq('user_id', userId!)
        .order('completed_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return (data ?? []) as ActivityItem[]
    },
    staleTime: 120_000,
  })
}

function useTotalStats(userId: string | undefined) {
  return useQuery<TotalStats>({
    queryKey: ['total-stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [progressRes, profileRes] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('xp_earned', { count: 'exact' })
          .eq('user_id', userId!),
        supabase
          .from('profiles')
          .select('created_at, xp')
          .eq('id', userId!)
          .maybeSingle(),
      ])
      if (progressRes.error) throw progressRes.error
      const rows = progressRes.data ?? []
      const total_xp = rows.reduce((sum: number, r: any) => sum + (r.xp_earned ?? 0), 0)
      return {
        total_lessons: progressRes.count ?? rows.length,
        total_xp,
        member_since: profileRes.data?.created_at ?? null,
      }
    },
    staleTime: 120_000,
  })
}

function useSkillScores(userId: string | undefined) {
  return useQuery({
    queryKey: ['skill-scores', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('xp_earned, lessons(category)')
        .eq('user_id', userId!)
      if (error) throw error

      const buckets: Record<string, number> = {
        'AI Foundations': 0,
        'Prompting': 0,
        'Coding': 0,
        'Data': 0,
        'Product': 0,
        'Business': 0,
      }
      const catMap: Record<string, keyof typeof buckets> = {
        ai: 'AI Foundations',
        foundations: 'AI Foundations',
        prompt: 'Prompting',
        prompting: 'Prompting',
        coding: 'Coding',
        code: 'Coding',
        data: 'Data',
        product: 'Product',
        business: 'Business',
      }

      for (const row of data ?? []) {
        const cat = ((row.lessons as any)?.category ?? '').toLowerCase()
        const key = catMap[cat]
        if (key) buckets[key] += row.xp_earned ?? 0
      }

      const maxVal = Math.max(...Object.values(buckets), 1)
      return Object.entries(buckets).map(([label, value]) => ({
        label,
        value: Math.round((value / maxVal) * 100),
      }))
    },
    staleTime: 120_000,
  })
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export default function Profile() {
  usePageTitle('Profile')
  const { user, signOut } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: badges } = useBadges(user?.id)
  const { data: shields } = useStreakShield(user?.id)
  const { data: activityFeed = [], isLoading: activityLoading } = useActivityFeed(user?.id)
  const { data: totalStats, isLoading: statsLoading } = useTotalStats(user?.id)
  const { data: skillScores = [], isLoading: skillsLoading } = useSkillScores(user?.id)
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const goal = profile?.goal ?? ''

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login')
  }

  async function handleSave() {
    setSaving(true)
    // In a real app, update profile in DB
    setSaving(false)
    setIsEditing(false)
    success('Profile updated!')
  }

  async function handleCopyShareLink() {
    if (!user?.id) return
    const link = `${window.location.origin}/share/${user.id}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toastError('Could not copy link')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {profile?.name || user?.email || 'Learner'}
              </h1>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Lv. {level}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>

            <div className="flex gap-4 mt-3">
              {[
                { label: 'XP', value: xp.toLocaleString() },
                { label: 'Streak', value: `${profile?.streak ?? 0}🔥` },
                { label: 'Badges', value: badges?.length ?? 0 },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={() => { setIsEditing(true); setName(profile?.name ?? '') }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleCopyShareLink}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                copied
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {copied ? 'Copied! ✓' : 'Share Profile'}
            </button>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Profile"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white text-sm px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Skills Radar */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Skill Breakdown</h2>
        {skillsLoading ? (
          <Skeleton lines={4} />
        ) : skillScores.length > 0 ? (
          <RadarChart data={skillScores} />
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">Complete lessons to see your skill radar.</p>
        )}
      </Card>

      {/* Total Stats */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Your Stats</h2>
        {statsLoading ? (
          <Skeleton lines={2} />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Lessons Done', value: totalStats?.total_lessons?.toLocaleString() ?? '—' },
              { label: 'Total XP', value: totalStats?.total_xp?.toLocaleString() ?? '—' },
              {
                label: 'Member Since',
                value: totalStats?.member_since
                  ? new Date(totalStats.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'N/A',
              },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-gray-50 rounded-xl py-3 px-2">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links grid */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl py-4 px-2 transition-all text-center"
            >
              <span className="text-2xl" aria-hidden="true">{link.icon}</span>
              <span className="text-xs font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Goal */}
      {goal && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">My Goal</h2>
          <p className="text-gray-900 font-medium">{GOAL_LABELS[goal] ?? goal}</p>
          <p className="text-sm text-gray-500 mt-1">
            {profile?.daily_mins ?? 15} min/day · {profile?.learn_time ?? 'Anytime'}
          </p>
        </Card>
      )}

      {/* Activity Feed */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Recent Activity</h2>
        {activityLoading ? (
          <Skeleton lines={5} />
        ) : activityFeed.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No lessons completed yet — start learning!</p>
        ) : (
          <ol className="relative border-l border-gray-100 ml-2 space-y-4">
            {activityFeed.map((item, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {item.lessons?.title ?? 'Lesson'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{formatRelativeDate(item.completed_at)}</span>
                  <span className="text-xs font-semibold text-green-600">+{item.xp_earned ?? 0} XP</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* Shields */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Streak Shields</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {shields?.count ?? 0} shield{shields?.count !== 1 ? 's' : ''} available
            </p>
          </div>
          <span className="text-3xl" aria-hidden="true">🛡️</span>
        </div>
        <Link
          to="/shop"
          className="mt-3 inline-block text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Get more shields →
        </Link>
      </Card>

      {/* Badges preview */}
      {badges && badges.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Badges</h2>
            <Link to="/profile/badges" className="text-sm text-green-600 hover:text-green-700 font-medium">
              See all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 6).map((badge: any) => (
              <span
                key={badge.id}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-800 text-sm px-3 py-1.5 rounded-full border border-amber-200"
              >
                <span aria-hidden="true">{badge.badges?.icon ?? '🎖️'}</span>
                <span className="font-medium">{badge.badges?.name ?? 'Badge'}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Full nav links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-green-300 hover:shadow transition-all"
          >
            <span className="text-xl" aria-hidden="true">{link.icon}</span>
            <span className="text-sm font-medium text-gray-800">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
      >
        Sign Out
      </button>
    </div>
  )
}
