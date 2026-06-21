import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { useStreakShield } from '../data/useStreakShield'
import { Card } from '../components/ui/Card'

const SHIELD_PACKS = [
  { id: 1, count: 1, price: '$0.99', emoji: '🛡️', label: '1 Shield', desc: 'Protect one streak day' },
  { id: 3, count: 3, price: '$1.99', emoji: '🛡️🛡️🛡️', label: '3 Shields', desc: 'Best value for regulars', popular: true },
  { id: 7, count: 7, price: '$3.99', emoji: '🛡️✨', label: '7 Shields', desc: 'A full week of protection' },
]

export default function Shop() {
  const { user } = useAuth()
  const { data: shields, purchase } = useStreakShield(user?.id)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)

  async function handlePurchase(count: number) {
    setPurchasing(count)
    try {
      await purchase.mutateAsync()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      // error handled by TanStack Query
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shield Shop</h1>
        <p className="text-gray-500 mt-1">Protect your streak from breaking on missed days.</p>
      </div>

      {/* Current shields */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Your Shields</h2>
            <p className="text-sm text-gray-500 mt-0.5">Automatically used when you miss a day</p>
          </div>
          <div className="text-center">
            <p className="text-3xl">🛡️</p>
            <p className="text-xl font-bold text-gray-900">{shields?.count ?? 0}</p>
          </div>
        </div>
      </Card>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <p className="text-green-700 font-medium">Shield purchased! Your streak is protected.</p>
        </div>
      )}

      {/* How shields work */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">How Shields Work</h2>
        <div className="space-y-3">
          {[
            { icon: '📅', text: 'Miss a day of learning? A shield automatically activates.' },
            { icon: '🔥', text: 'Your streak stays alive as if you never missed.' },
            { icon: '🛡️', text: 'One shield = one missed day protection.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
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
            {pack.popular && (
              <div className="absolute -mt-8 ml-auto">
              </div>
            )}
            <div className="text-2xl flex-shrink-0">{pack.emoji[0]}</div>
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

      <p className="text-xs text-center text-gray-400">
        Shields are consumed automatically. No subscription required.
      </p>
    </div>
  )
}
