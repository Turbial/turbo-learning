import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { Card } from '../components/ui/Card'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Referral() {
  usePageTitle('Refer a Friend')
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const referralLink = user
    ? `${window.location.origin}/auth/register?ref=${user.id}`
    : ''

  async function handleCopy() {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareText = encodeURIComponent(
    `I'm learning AI on Turbo Learning — join me! ${referralLink}`,
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Refer a Friend</h1>
        <p className="text-gray-500 mt-1">Share Turbo Learning and earn rewards together.</p>
      </div>

      {/* Reward banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white text-center">
        <p className="text-4xl mb-2" aria-hidden="true">🎁</p>
        <h2 className="text-xl font-bold mb-1">Earn 100 XP per referral</h2>
        <p className="text-green-100 text-sm">
          You earn 100 XP when your friend completes their first lesson.
        </p>
      </div>

      {/* Referral link */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Your referral link</h2>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-gray-50 min-w-0 select-all"
            onClick={e => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </Card>

      {/* Share options */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Share directly</h2>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">𝕏</span>
            <span className="text-sm font-medium text-gray-700">Share on X</span>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">in</span>
            <span className="text-sm font-medium text-gray-700">LinkedIn</span>
          </a>
          <a
            href={`mailto:?subject=Join%20me%20on%20Turbo%20Learning&body=${shareText}`}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">✉️</span>
            <span className="text-sm font-medium text-gray-700">Email</span>
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">🔗</span>
            <span className="text-sm font-medium text-gray-700">{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>
      </Card>

      {/* How it works */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Copy your unique referral link above.' },
            { step: '2', text: 'Share it with a friend who wants to learn AI.' },
            { step: '3', text: 'They sign up and complete their first lesson.' },
            { step: '4', text: 'You both earn 100 XP automatically!' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </span>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
