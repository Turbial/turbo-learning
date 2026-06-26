import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useReviewQueue, useMarkReviewed } from '../data/useReviewQueue'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { RingProgress } from '../components/ui/RingProgress'
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

// ─── Fetch upcoming 7-day schedule of due cards ───
function useUpcomingSchedule(userId?: string) {
  return useQuery({
    queryKey: ['upcomingSchedule', userId],
    enabled: !!userId,
    queryFn: async () => {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const in7Days = new Date(today)
      in7Days.setDate(today.getDate() + 7)
      const endStr = in7Days.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('flashcard_reviews')
        .select('due_date, card_id')
        .eq('user_id', userId)
        .gte('due_date', todayStr)
        .lte('due_date', endStr)
        .order('due_date')
        .limit(50)

      if (error) throw error

      // Group by date
      const grouped: Record<string, number> = {}
      for (const row of data ?? []) {
        const d = row.due_date as string
        grouped[d] = (grouped[d] ?? 0) + 1
      }
      return grouped
    },
    staleTime: 5 * 60_000,
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

type GradeFlash = 'easy' | 'hard' | 'again' | null

// ─── Card that fetches lesson info ───
function ReviewCard({
  current,
  revealed,
  onReveal,
  onGrade,
  isPending,
  gradeFlash,
}: {
  current: { id: string; lesson_id?: string | null; step_id?: string | null }
  revealed: boolean
  onReveal: () => void
  onGrade: (d: 'easy' | 'hard' | 'again') => void
  isPending: boolean
  gradeFlash: GradeFlash
}) {
  const { data: lessonInfo, isLoading: infoLoading } = useLessonInfo(current.lesson_id)

  const unitTitle = (() => {
    if (!lessonInfo?.units) return null
    const units = Array.isArray(lessonInfo.units) ? lessonInfo.units[0] : lessonInfo.units
    return units?.title ?? null
  })()

  const lessonTitle = lessonInfo?.title ?? null

  const flashRingClass =
    gradeFlash === 'easy'
      ? 'ring-2 ring-green-400 ring-offset-2'
      : gradeFlash === 'again'
      ? 'ring-2 ring-red-400 ring-offset-2'
      : gradeFlash === 'hard'
      ? 'ring-2 ring-amber-400 ring-offset-2'
      : ''

  return (
    <div className={`rounded-2xl transition-all duration-200 ${flashRingClass}`}>
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
                Again
              </button>
              <button
                onClick={() => onGrade('hard')}
                disabled={isPending}
                className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
              >
                Hard
              </button>
              <button
                onClick={() => onGrade('easy')}
                disabled={isPending}
                className="flex-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-xl py-2.5 font-semibold text-xs transition-colors disabled:opacity-60"
              >
                Easy
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Upcoming schedule mini-table ───
function UpcomingTab({ userId }: { userId?: string }) {
  const { data: schedule, isLoading } = useUpcomingSchedule(userId)

  if (isLoading) return <Skeleton lines={4} />

  const entries = Object.entries(schedule ?? {}).sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No cards scheduled in the next 7 days.
      </p>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-2">
      {entries.map(([date, count]) => {
        const isToday = date === todayStr
        const label = isToday
          ? 'Today'
          : new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })
        return (
          <div
            key={date}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
              isToday
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            <span className={`text-sm font-medium ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
              {label}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                isToday ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {count} card{count !== 1 ? 's' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Session complete screen ───
function SessionSummary({
  totalReviewed,
  correctCount,
  onRestart,
}: {
  totalReviewed: number
  correctCount: number
  onRestart: () => void
}) {
  const accuracy = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0

  const motivation =
    accuracy >= 90
      ? 'Outstanding recall — your memory palace is solid!'
      : accuracy >= 70
      ? 'Great work! Consistent practice builds lasting memory.'
      : accuracy >= 50
      ? 'Good effort! The tricky ones will get easier with repetition.'
      : 'Every review makes the next one easier. Keep going!'

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card className="text-center py-10">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Session Complete!</h1>
        <p className="text-sm text-gray-400 mb-6">{motivation}</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-900">{totalReviewed}</p>
            <p className="text-xs text-gray-500 mt-0.5">Reviewed</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-700">{accuracy}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Accuracy</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-blue-700">{correctCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Correct</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          Start Another Session
        </button>
      </Card>
    </div>
  )
}

export default function Review() {
  usePageTitle('Review')

  const { user } = useAuth()
  const { data: queue, isLoading } = useReviewQueue(user?.id)
  const markReviewed = useMarkReviewed()

  // Core state
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [activeTab, setActiveTab] = useState<'due' | 'upcoming'>('due')

  // Session tracking
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [easyStreak, setEasyStreak] = useState(0)
  const [gradeFlash, setGradeFlash] = useState<GradeFlash>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up flash timer on unmount
  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [])

  const items = queue ?? []

  function triggerFlash(grade: 'easy' | 'hard' | 'again') {
    if (flashTimer.current) clearTimeout(flashTimer.current)
    setGradeFlash(grade)
    flashTimer.current = setTimeout(() => setGradeFlash(null), 200)
  }

  async function handleGrade(difficulty: 'easy' | 'hard' | 'again') {
    if (!items[currentIdx]) return

    triggerFlash(difficulty)

    await markReviewed.mutateAsync({ itemId: items[currentIdx].id, difficulty })

    setReviewedCount((c) => c + 1)

    if (difficulty === 'easy') {
      setCorrectCount((c) => c + 1)
      setEasyStreak((s) => s + 1)
    } else {
      setEasyStreak(0)
    }

    setRevealed(false)

    if (currentIdx + 1 >= items.length) {
      setDone(true)
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  function handleRestart() {
    setCurrentIdx(0)
    setRevealed(false)
    setDone(false)
    setReviewedCount(0)
    setCorrectCount(0)
    setEasyStreak(0)
  }

  // ── Loading ──
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

  // ── Session summary ──
  if (done) {
    return (
      <SessionSummary
        totalReviewed={reviewedCount}
        correctCount={correctCount}
        onRestart={handleRestart}
      />
    )
  }

  // ── Empty queue ──
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h1>
          <p className="text-gray-500 text-sm">No reviews due right now. Check back tomorrow!</p>
        </Card>
      </div>
    )
  }

  const current = items[currentIdx]
  const accuracy =
    reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review</h1>
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {items.length}
        </span>
      </div>

      {/* Stats header grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">Due today</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{reviewedCount}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">Reviewed</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-green-600">{reviewedCount > 0 ? `${accuracy}%` : '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">Accuracy</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-amber-500">{easyStreak}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">Easy streak</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('due')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'due'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Due Now ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
      </div>

      {activeTab === 'upcoming' ? (
        <Card>
          <h2 className="font-bold text-gray-900 mb-4">Next 7 Days</h2>
          <UpcomingTab userId={user?.id} />
        </Card>
      ) : (
        <>
          {/* Progress bar + ring row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentIdx / items.length) * 100}%` }}
                />
              </div>
            </div>
            <RingProgress value={reviewedCount} max={items.length} size={48} strokeWidth={5}>
              <span className="text-xs font-bold text-gray-700">{reviewedCount}</span>
            </RingProgress>
          </div>

          {/* Review card with grade flash */}
          <ReviewCard
            current={current}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onGrade={handleGrade}
            isPending={markReviewed.isPending}
            gradeFlash={gradeFlash}
          />

          <p className="text-xs text-center text-gray-400">
            Spaced repetition: items you struggle with appear more often.
          </p>
        </>
      )}
    </div>
  )
}
