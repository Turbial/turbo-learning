import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { useProfile } from '../data/queries'
import { useStreakShield } from '../data/useStreakShield'
import { Card } from '../components/ui/Card'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

const SHIELD_PACKS = [
  { id: 1, count: 1, price: '$0.99', emoji: '🛡️', label: '1 Shield', desc: 'Protect one streak day' },
  { id: 3, count: 3, price: '$1.99', emoji: '🛡️🛡️🛡️', label: '3 Shields', desc: 'Best value for regulars', popular: true },
  { id: 7, count: 7, price: '$3.99', emoji: '🛡️✨', label: '7 Shields', desc: 'A full week of protection' },
]

const XP_BOOSTS = [
  { id: 'boost-30m', label: '30 Min Boost', price: '$0.99', multiplier: '1.5×', desc: '1.5× XP for 30 minutes', hours: 0.5 },
  { id: 'boost-2h', label: '2 Hour Boost', price: '$1.99', multiplier: '2×', desc: '2× XP for 2 hours', hours: 2 },
  { id: 'boost-day', label: 'Day Pass', price: '$3.99', multiplier: '2×', desc: '2× XP all day long', hours: 24, popular: true },
]

const THEMES = [
  { id: 'default', label: 'Default', price: null, colors: ['#ffffff', '#f3f4f6', '#22c55e', '#111827'] },
  { id: 'dark', label: 'Dark Mode', price: '$1.99', colors: ['#111827', '#1f2937', '#22c55e', '#f9fafb'] },
  { id: 'ocean', label: 'Ocean Blue', price: '$1.99', colors: ['#eff6ff', '#bfdbfe', '#2563eb', '#1e3a5f'] },
  { id: 'sunset', label: 'Sunset Pink', price: '$2.99', colors: ['#fff1f2', '#fecdd3', '#f43f5e', '#4c0519'] },
]

const DAILY_REWARD_KEY = 'turbo_daily_reward_claimed'

function getDailyRewardState(): 'unclaimed' | 'claimed' {
  const stored = localStorage.getItem(DAILY_REWARD_KEY)
  if (!stored) return 'unclaimed'
  const claimedDate = new Date(stored)
  const now = new Date()
  const isSameDay =
    claimedDate.getFullYear() === now.getFullYear() &&
    claimedDate.getMonth() === now.getMonth() &&
    claimedDate.getDate() === now.getDate()
  return isSameDay ? 'claimed' : 'unclaimed'
}

export default function Shop() {
  usePageTitle('Shop')
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const { data: shields, purchase } = useStreakShield(user?.id)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [activatingBoost, setActivatingBoost] = useState<string | null>(null)
  const [activeTheme, setActiveTheme] = useState<string>('default')
  const [unlockedThemes, setUnlockedThemes] = useState<Set<string>>(new Set(['default']))
  const [dailyRewardState, setDailyRewardState] = useState<'unclaimed' | 'claimed'>(getDailyRewardState)
  const { success, error, info } = useToast()

  async function handlePurchase(count: number) {
    setPurchasing(count)
    try {
      await purchase.mutateAsync()
      success('Shield purchased! Your streak is protected.')
    } catch {
      error('Purchase failed. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }

  function handleActivateBoost(boost: typeof XP_BOOSTS[number]) {
    setActivatingBoost(boost.id)
    setTimeout(() => {
      const label = boost.hours < 1
        ? `${boost.hours * 60} minutes`
        : boost.hours === 24
        ? '24 hours'
        : `${boost.hours} hours`
      success(`XP Boost activated! Expires in ${label}.`)
      setActivatingBoost(null)
    }, 600)
  }

  function handleUnlockTheme(theme: typeof THEMES[number]) {
    setUnlockedThemes(prev => new Set([...prev, theme.id]))
    setActiveTheme(theme.id)
    success(`${theme.label} theme unlocked!`)
  }

  function handleActivateTheme(themeId: string) {
    setActiveTheme(themeId)
    info('Theme applied.')
  }

  function handleClaimDailyReward() {
    localStorage.setItem(DAILY_REWARD_KEY, new Date().toISOString())
    setDailyRewardState('claimed')
    success('Claimed 10 XP! Come back tomorrow for another reward.')
  }

  const shieldCount = profile?.shield_count ?? shields?.count ?? 0

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 mt-1">Power-ups, themes, and streak protection.</p>
      </div>

      {/* Daily Reward */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-0.5">Daily Reward</p>
            <h2 className="font-bold text-lg leading-tight">
              {dailyRewardState === 'claimed' ? 'See you tomorrow!' : 'Claim your free 10 XP'}
            </h2>
            <p className="text-sm text-white/80 mt-0.5">
              {dailyRewardState === 'claimed'
                ? 'You already claimed today\'s reward. Come back tomorrow!'
                : 'A small gift for showing up today.'}
            </p>
          </div>
          <div className="flex-shrink-0">
            {dailyRewardState === 'claimed' ? (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                ✓
              </div>
            ) : (
              <button
                onClick={handleClaimDailyReward}
                className="bg-white text-orange-500 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
              >
                Claim
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owned Items Panel */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Your Inventory</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1" aria-hidden="true">🛡️</p>
            <p className="text-xl font-bold text-gray-900">{shieldCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Shields</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1" aria-hidden="true">⚡</p>
            <p className="text-xs font-medium text-gray-400 mt-1.5">No active</p>
            <p className="text-xs text-gray-500 mt-0.5">boosts</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1" aria-hidden="true">🎨</p>
            <p className="text-xs font-medium text-gray-700 mt-1.5 truncate">Default</p>
            <p className="text-xs text-gray-500 mt-0.5">theme</p>
          </div>
        </div>
      </Card>

      {/* XP Boosts */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">XP Boosts</h2>
        <div className="space-y-3">
          {XP_BOOSTS.map(boost => (
            <div
              key={boost.id}
              className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${boost.popular ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-100'}`}
            >
              <div className="text-2xl flex-shrink-0" aria-hidden="true">⚡</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{boost.label}</p>
                  {boost.popular && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                      Best value
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{boost.desc}</p>
                <p className="text-xs text-amber-600 font-semibold mt-0.5">{boost.multiplier} XP multiplier</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-gray-900 mb-1">{boost.price}</p>
                <button
                  onClick={() => handleActivateBoost(boost)}
                  disabled={activatingBoost !== null}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {activatingBoost === boost.id ? 'Activating…' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shields */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Streak Shields</h2>

        {/* Current shields */}
        <Card className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Your Shields</h3>
              <p className="text-sm text-gray-500 mt-0.5">Automatically used when you miss a day</p>
            </div>
            <div className="text-center">
              <p className="text-3xl" aria-hidden="true">🛡️</p>
              <p className="text-xl font-bold text-gray-900">{shieldCount}</p>
            </div>
          </div>
        </Card>

        {/* How shields work */}
        <Card className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-3">How Shields Work</h3>
          <div className="space-y-3">
            {[
              { icon: '📅', text: 'Miss a day of learning? A shield automatically activates.' },
              { icon: '🔥', text: 'Your streak stays alive as if you never missed.' },
              { icon: '🛡️', text: 'One shield = one missed day protection.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Packs */}
        <div className="space-y-3">
          {SHIELD_PACKS.map(pack => (
            <div
              key={pack.id}
              className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${pack.popular ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-100'}`}
            >
              <div className="text-2xl flex-shrink-0" aria-hidden="true">🛡️</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{pack.label}</p>
                  {pack.popular && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{pack.desc}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-gray-900 mb-1">{pack.price}</p>
                <button
                  onClick={() => handlePurchase(pack.count)}
                  disabled={purchasing !== null}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {purchasing === pack.count ? 'Buying…' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Visual Themes</h2>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(theme => {
            const isActive = activeTheme === theme.id
            const isOwned = unlockedThemes.has(theme.id)
            const isFree = theme.price === null
            return (
              <div
                key={theme.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col gap-3 ${isActive ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-100'}`}
              >
                {/* Color swatch */}
                <div className="grid grid-cols-4 gap-1 h-10 rounded-lg overflow-hidden">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{theme.label}</p>
                    <p className="text-xs text-gray-400">{isFree ? 'Free' : theme.price}</p>
                  </div>
                  {isActive ? (
                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg font-semibold">
                      Active
                    </span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleActivateTheme(theme.id)}
                      className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlockTheme(theme)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-center text-gray-400">
        Shields are consumed automatically. No subscription required.
      </p>
    </div>
  )
}
