import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { useProfile, useBadges } from '../data/queries'
import { useStreakShield } from '../data/useStreakShield'
import { Card } from '../components/ui/Card'
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

const NAV_LINKS = [
  { to: '/leagues', icon: '🏆', label: 'My League' },
  { to: '/shop', icon: '🛡️', label: 'Shield Shop' },
  { to: '/profile/portfolio', icon: '📁', label: 'Portfolio' },
  { to: '/profile/badges', icon: '🎖️', label: 'Badge Gallery' },
  { to: '/profile/billing', icon: '💳', label: 'Billing' },
  { to: '/profile/settings', icon: '⚙️', label: 'Settings' },
]

export default function Profile() {
  usePageTitle('Profile')
  const { user, signOut } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: badges } = useBadges(user?.id)
  const { data: shields } = useStreakShield(user?.id)
  const navigate = useNavigate()
  const { success } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

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
          <button
            onClick={() => { setIsEditing(true); setName(profile?.name ?? '') }}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Edit
          </button>
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

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

      {/* Quick nav */}
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
