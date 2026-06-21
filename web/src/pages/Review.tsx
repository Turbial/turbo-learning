import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { useReviewQueue, useMarkReviewed } from '../data/useReviewQueue'
import { Card } from '../components/ui/Card'

export default function Review() {
  const { user } = useAuth()
  const { data: queue, isLoading } = useReviewQueue(user?.id)
  const markReviewed = useMarkReviewed()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)

  const items = queue ?? []

  async function handleGrade(difficulty: 'easy' | 'hard' | 'again') {
    if (!items[currentIdx]) return
    await markReviewed.mutateAsync({ itemId: items[currentIdx].id, difficulty })
    setRevealed(false)
    if (currentIdx + 1 >= items.length) {
      setDone(true)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (done || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">{done ? '✅' : '🎯'}</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {done ? 'Review Complete!' : 'All Caught Up!'}
          </h1>
          <p className="text-gray-500 text-sm">
            {done
              ? `You reviewed ${items.length} items. Great work!`
              : "No reviews due right now. Check back tomorrow!"}
          </p>
        </Card>
      </div>
    )
  }

  const current = items[currentIdx]

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review</h1>
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {items.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-gray-100 rounded-full">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${(currentIdx / items.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <Card>
        <p className="text-xs font-medium text-green-600 mb-3 uppercase tracking-wide">
          Review Card
        </p>
        <p className="text-lg font-semibold text-gray-900 leading-relaxed mb-4">
          Tap to review this concept and rate your recall.
        </p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors font-medium"
          >
            Tap to reveal answer
          </button>
        ) : (
          <div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Lesson ID: {current.lesson_id} · Step: {current.step_id}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-3 text-center">How well did you remember?</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleGrade('again')}
                disabled={markReviewed.isPending}
                className="flex-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
              >
                😐 Again
              </button>
              <button
                onClick={() => handleGrade('hard')}
                disabled={markReviewed.isPending}
                className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
              >
                🤔 Hard
              </button>
              <button
                onClick={() => handleGrade('easy')}
                disabled={markReviewed.isPending}
                className="flex-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
              >
                ✓ Easy
              </button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-xs text-center text-gray-400">
        Spaced repetition: items you struggle with appear more often.
      </p>
    </div>
  )
}
