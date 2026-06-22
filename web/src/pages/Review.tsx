import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useReviewQueue, useMarkReviewed } from '../data/useReviewQueue'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { usePageTitle } from '../hooks/usePageTitle'

// ─── Fetch lesson + unit title for a review item ───
function useLessonInfo(lessonId?: string | null) {
  return useQuery({
    queryKey: ['lessonInfo', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('title, units(title)')
        .eq('id', lessonId)
        .maybeSingle()
      if (error) throw error
      return data as { title: string | null; units: { title: string } | { title: string }[] | null } | null
    },
    staleTime: 10 * 60_000,
  })
}

// ─── Format step_id as a readable topic ───
function formatTopic(stepId: string | null | undefined): string {
  if (!stepId) return 'Unknown Topic'
  return stepId
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Card that fetches lesson info ───
function ReviewCard({
  current,
  revealed,
  onReveal,
  onGrade,
  isPending,
}: {
  current: { id: string; lesson_id?: string | null; step_id?: string | null }
  revealed: boolean
  onReveal: () => void
  onGrade: (d: 'easy' | 'hard' | 'again') => void
  isPending: boolean
}) {
  const { data: lessonInfo, isLoading: infoLoading } = useLessonInfo(current.lesson_id)

  const unitTitle = (() => {
    if (!lessonInfo?.units) return null
    const units = Array.isArray(lessonInfo.units) ? lessonInfo.units[0] : lessonInfo.units
    return units?.title ?? null
  })()

  const lessonTitle = lessonInfo?.title ?? null

  return (
    <Card>
      <p className="text-xs font-medium text-green-600 mb-3 uppercase tracking-wide">
        Review Card
      </p>

      {/* Topic */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-1">Topic</p>
        <p className="text-lg font-semibold text-gray-900 leading-snug">
          {formatTopic(current.step_id)}
        </p>
        {infoLoading ? (
          <Skeleton className="h-4 w-48 mt-1" />
        ) : (
          (unitTitle || lessonTitle) && (
            <p className="text-sm text-gray-500 mt-1">
              {[unitTitle, lessonTitle].filter(Boolean).join(' → ')}
            </p>
          )
        )}
      </div>

      {!revealed ? (
        <button
          onClick={onReveal}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors font-medium"
        >
          Tap to reveal answer
        </button>
      ) : (
        <div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">How to refresh this concept:</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Open your lesson notes or complete the lesson again to refresh this concept.
            </p>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-3 text-center">How well did you remember?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onGrade('again')}
              disabled={isPending}
              className="flex-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
            >
              😐 Again
            </button>
            <button
              onClick={() => onGrade('hard')}
              disabled={isPending}
              className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
            >
              🤔 Hard
            </button>
            <button
              onClick={() => onGrade('easy')}
              disabled={isPending}
              className="flex-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
            >
              ✓ Easy
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function Review() {
  usePageTitle('Review')

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
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Review</h1>
        </div>
        <Skeleton lines={4} />
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
              : 'No reviews due right now. Check back tomorrow!'}
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

      <ReviewCard
        current={current}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
        onGrade={handleGrade}
        isPending={markReviewed.isPending}
      />

      <p className="text-xs text-center text-gray-400">
        Spaced repetition: items you struggle with appear more often.
      </p>
    </div>
  )
}
