import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { useSubscription } from '../data/useSubscription'
import { supabase } from '../lib/supabase'
import { usePageTitle } from '../hooks/usePageTitle'

const FREE_FEATURES = [
  '3 lessons per day',
  'Daily challenge',
  'Progress tracking',
  'Basic leaderboard',
]

const PREMIUM_FEATURES = [
  'Unlimited lessons',
  'All 3 programs',
  'Streak shields included',
  'Advanced analytics',
  'Priority support',
  'Offline access',
  'Badge & portfolio system',
  'League competition',
]

export default function Pricing() {
  usePageTitle('Pricing')
  const { user } = useAuth()
  const { data: sub } = useSubscription(user?.id)
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly')

  const isPremium = sub?.tier === 'premium'

  async function handleCheckout(plan: 'monthly' | 'yearly') {
    setLoading(plan)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId: plan, testMode: false },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('monthly')
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {})
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose your plan</h1>
        <p className="text-gray-500">Upgrade to unlock everything and accelerate your AI skills.</p>

        {!isPremium && (
          <div className="inline-flex bg-gray-100 rounded-full p-1 mt-6">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Yearly
              <span className="ml-1.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">–40%</span>
            </button>
          </div>
        )}
      </div>

      {isPremium ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
          <div className="text-4xl mb-3" aria-hidden="true">🎉</div>
          <h2 className="text-xl font-bold text-green-800 mb-1">You're on Premium!</h2>
          <p className="text-green-600 mb-4">
            {sub?.current_period_end
              ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}`
              : 'Active subscription'}
          </p>
          <button
            onClick={handlePortal}
            disabled={loading !== null}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
          >
            Manage Billing
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Free</h2>
              <div className="mt-2">
                <span className="text-4xl font-black text-gray-900">$0</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Forever free, no credit card</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/"
              className="block text-center border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Free
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              POPULAR
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Premium</h2>
              <div className="mt-2">
                <span className="text-4xl font-black text-white">
                  {billingPeriod === 'yearly' ? '$9' : '$15'}
                </span>
                <span className="text-gray-400 text-sm ml-1">/mo</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-green-400 mt-1">Billed $108/yr · Save $72</p>
              )}
              {billingPeriod === 'monthly' && (
                <p className="text-sm text-gray-400 mt-1">Billed monthly</p>
              )}
            </div>
            <ul className="space-y-2.5 mb-6">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(billingPeriod)}
              disabled={loading !== null}
              className="w-full bg-green-500 hover:bg-green-400 text-white rounded-xl py-3 font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {loading === billingPeriod ? 'Redirecting…' : `Start Premium — ${billingPeriod === 'yearly' ? '$9/mo' : '$15/mo'}`}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Cancel anytime. Questions?{' '}
        <a href="mailto:support@turbolearning.ai" className="text-green-600 hover:underline">
          support@turbolearning.ai
        </a>
      </p>
    </div>
  )
}
