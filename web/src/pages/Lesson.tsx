import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { useUnit, useCompleteLesson } from '../data/queries'
import { Card } from '../components/ui/Card'

export default function Lesson() {
  const { unitId } = useParams<{ unitId: string }>()
  const { user: _user } = useAuth()
  const navigate = useNavigate()
  const completeLesson = useCompleteLesson()

  const [phase, setPhase] = useState<'intro' | 'complete'>('intro')
  const [completing, setCompleting] = useState(false)

  const { data: unit } = useUnit(unitId)

  const LESSON_XP = 50

  async function handleComplete() {
    if (!unitId) return
    setCompleting(true)
    try {
      await completeLesson.mutateAsync({ unitId, xpEarned: 50, score: 100 })
      setPhase('complete')
    } catch (err) {
      console.error('Failed to complete lesson:', err)
    } finally {
      setCompleting(false)
    }
  }

  if (phase === 'complete') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lesson Complete!</h1>
          <p className="text-gray-500 mb-2">{unit?.title ?? 'Lesson'}</p>

          <div className="bg-green-50 rounded-xl p-4 mb-6 inline-block mx-auto">
            <p className="text-2xl font-bold text-green-600">+{LESSON_XP} XP</p>
            <p className="text-sm text-green-600/70">earned</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              Back to Journey
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-gray-200 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Journey
      </button>

      {/* Lesson header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            {unit?.emoji ?? '📖'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Today's Lesson</p>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {unit?.title ?? `Lesson ${unitId?.slice(-4)}`}
            </h1>
            {unit?.goal && (
              <p className="text-sm text-gray-500">{unit.goal}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                +{LESSON_XP} XP
              </span>
              <span className="text-xs text-gray-400">~10 min</span>
            </div>
          </div>
        </div>
      </Card>

      {/* What you'll learn */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">What you'll learn</h2>
        <div className="space-y-2">
          {[
            'Core concepts and practical applications',
            'Real-world examples you can use immediately',
            'Quick knowledge check to reinforce learning',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 text-sm">✓</span>
              <p className="text-sm text-gray-600">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white text-center">
        <p className="text-white/80 text-sm mb-1">Ready to learn?</p>
        <h2 className="text-xl font-bold mb-4">Start this lesson</h2>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="bg-white text-green-700 hover:bg-green-50 rounded-xl px-8 py-3 font-bold text-sm transition-colors disabled:opacity-60"
        >
          {completing ? 'Saving progress…' : 'Begin Lesson →'}
        </button>
      </div>

      {completing && (
        <div className="text-center text-sm text-gray-500">
          Marking lesson as complete…
        </div>
      )}
    </div>
  )
}
