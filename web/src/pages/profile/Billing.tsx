import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../data/useAuth'
import { useSubscription } from '../../data/useSubscription'
import { usePaymentHistory } from '../../data/queries'
import { Card } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'

export default function Billing() {
  const { user } = useAuth()
  const { data: sub } = useSubscription(user?.id)
  const { data: payments, isLoading } = usePaymentHistory(user?.id)
  const [portalLoading, setPortalLoading] = useState(false)

  const isPremium = sub?.tier === 'premium'

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {})
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      {/* Current plan */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Current Plan</h2>
        <div className={`rounded-xl p-4 flex items-center justify-between ${isPremium ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div>
            <p className={`font-bold text-lg ${isPremium ? 'text-green-700' : 'text-gray-700'}`}>
              {isPremium ? '✨ Premium' : '🆓 Free'}
            </p>
            {isPremium && sub?.current_period_end && (
              <p className="text-sm text-green-600 mt-0.5">
                Renews {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
            {!isPremium && (
              <p className="text-sm text-gray-500 mt-0.5">Limited features</p>
            )}
          </div>
          {isPremium ? (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-60"
            >
              {portalLoading ? 'Loading…' : 'Manage'}
            </button>
          ) : (
            <Link
              to="/pricing"
              className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Upgrade
            </Link>
          )}
        </div>
      </Card>

      {/* Payment history */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (!payments || payments.length === 0) ? (
          <p className="text-sm text-gray-400 text-center py-6">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {(payments as any[]).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {p.currency?.toUpperCase() ?? 'USD'} {((p.amount_cents ?? 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'succeeded' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-xs text-center text-gray-400">
        Questions about billing?{' '}
        <a href="mailto:support@turbolearning.ai" className="text-green-600 hover:underline">
          Contact support
        </a>
      </p>
    </div>
  )
}
