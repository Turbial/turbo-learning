import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { useActiveProgramSlug, useUnits, useProgram, useLessonProgressMap } from '../data/queries'
import { useLocalProgressStore } from '../store/localProgressStore'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

// ─── Confetti particle ───
function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    'bg-green-400',
    'bg-yellow-400',
    'bg-blue-400',
    'bg-pink-400',
    'bg-purple-400',
    'bg-orange-400',
  ]
  const color = colors[index % colors.length]
  const left = 20 + (index / 9) * 60
  const delay = index * 80

  return (
    <div
      className={`absolute w-2 h-2 rounded-sm ${color} animate-bounce opacity-0`}
      style={{
        left: `${left}%`,
        bottom: '50%',
        animationDelay: `${delay}ms`,
        animationDuration: '600ms',
        animationFillMode: 'both',
        animationTimingFunction: 'ease-out',
      }}
    />
  )
}

// ─── Confetti burst overlay ───
function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
      {Array.from({ length: 10 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </div>
  )
}

export default function Home() {
  usePageTitle('Journey')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: slug, isLoading: slugLoading } = useActiveProgramSlug()
  const { data: program } = useProgram(slug ?? '')
  const { data: units = [], isLoading: unitsLoading } = useUnits(program?.id)
  const { data: progressMap } = useLessonProgressMap(user?.id)
  const localProgress = useLocalProgressStore()

  // Confetti state: track which unit id is celebrating
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const prevProgressRef = useRef<Set<string>>(new Set())
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isCompleted = (unitId: string) => {
    return progressMap?.has(unitId) || localProgress.isCompleted(unitId)
  }

  // Detect newly completed units and trigger confetti
  useEffect(() => {
    if (units.length === 0) return

    const prev = prevProgressRef.current
    const newlyCompleted = units.find((u) => isCompleted(u.id) && !prev.has(u.id))

    if (newlyCompleted) {
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current)
      setCelebrating(newlyCompleted.id)
      celebrateTimer.current = setTimeout(() => setCelebrating(null), 2000)
    }

    // Update ref with current completed set
    const currentCompleted = new Set(units.filter((u) => isCompleted(u.id)).map((u) => u.id))
    prevProgressRef.current = currentCompleted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressMap, units])

  useEffect(() => {
    return () => {
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current)
    }
  }, [])

  // Group units by week (each week = 7 units)
  const unitsByWeek: Record<number, typeof units> = {}
  units.forEach((unit) => {
    const week = unit.week ?? Math.ceil(unit.order_num / 7)
    if (!unitsByWeek[week]) unitsByWeek[week] = []
    unitsByWeek[week].push(unit)
  })

  const weeks = Object.entries(unitsByWeek).map(([w, u]) => ({ week: Number(w), units: u }))

  // Find current unit (first incomplete)
  const completedCount = units.filter((u) => isCompleted(u.id)).length
  const currentUnitIndex = completedCount
  const currentUnit = units[currentUnitIndex] ?? null

  const handleUnitClick = (unit: (typeof units)[0], idx: number) => {
    if (idx <= currentUnitIndex) {
      navigate(`/lesson/${unit.id}`)
    }
  }

  if (slugLoading || unitsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!slug) {
    return (
      <EmptyState
        icon="📚"
        title="No program enrolled"
        description="Complete onboarding to get started."
      />
    )
  }

  const progressPercent = (completedCount / Math.max(units.length, 1)) * 100
  const toGo = units.length - completedCount
  const estMinRemaining = toGo * 5

  return (
    <div className="pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <span aria-hidden="true">{program?.emoji}</span> {program?.title ?? 'Your Journey'}
        </h1>
        <p className="text-gray-500 mt-1">
          {completedCount} of {units.length} lessons completed
        </p>
      </div>

      {/* Overall progress */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progressPercent)}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall lesson progress"
          className="w-full bg-gray-100 rounded-full h-3"
        >
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress summary row */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs text-gray-600 font-medium">{completedCount} done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            <span className="text-xs text-gray-600 font-medium">{toGo} to go</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Est.</span>
            <span className="text-xs text-gray-600 font-medium">~{estMinRemaining} min remaining</span>
          </div>
        </div>
      </Card>

      {/* Weeks */}
      <div className="space-y-8">
        {weeks.map(({ week, units: weekUnits }) => {
          const weekCompleted = weekUnits.filter((u) => isCompleted(u.id)).length

          return (
            <div key={week}>
              {/* Chapter header — gradient badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider">Chapter {week}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {weekUnits.length} lesson{weekUnits.length !== 1 ? 's' : ''}
                  {weekCompleted > 0 && weekCompleted < weekUnits.length && (
                    <span className="ml-1 text-green-600">· {weekCompleted} done</span>
                  )}
                  {weekCompleted === weekUnits.length && weekUnits.length > 0 && (
                    <span className="ml-1 text-green-600 font-semibold">· Complete!</span>
                  )}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 gap-3" role="list">
                {weekUnits.map((unit, idxInWeek) => {
                  const globalIdx = units.findIndex((u) => u.id === unit.id)
                  const done = isCompleted(unit.id)
                  const isCurrent = globalIdx === currentUnitIndex
                  const locked = globalIdx > currentUnitIndex
                  const isCelebrating = celebrating === unit.id

                  return (
                    <button
                      key={unit.id}
                      role="listitem"
                      onClick={() => handleUnitClick(unit, globalIdx)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnitClick(unit, globalIdx)}
                      disabled={locked}
                      tabIndex={locked ? -1 : 0}
                      className={`
                        relative flex items-center gap-4 p-4 rounded-2xl border text-left transition-all
                        ${done ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                        ${isCurrent ? 'bg-yellow-50 border-yellow-300 shadow-sm hover:bg-yellow-100' : ''}
                        ${locked ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : ''}
                        ${!done && !isCurrent && !locked ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm' : ''}
                      `}
                    >
                      {/* Confetti burst on completion */}
                      {isCelebrating && <ConfettiBurst />}

                      {/* Day circle */}
                      <div
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                          ${done ? 'bg-green-500 text-white' : ''}
                          ${isCurrent ? 'bg-yellow-400 text-white' : ''}
                          ${locked ? 'bg-gray-200 text-gray-400' : ''}
                          ${!done && !isCurrent && !locked ? 'bg-gray-100 text-gray-600' : ''}
                        `}
                      >
                        {done ? '✓' : unit.emoji ?? (idxInWeek + 1)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
                          {unit.title}
                        </p>
                        {unit.goal && (
                          <p className={`text-xs mt-0.5 truncate ${locked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {unit.goal}
                          </p>
                        )}
                      </div>

                      {/* XP badge + time estimate */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {done ? '✓' : '50'} XP
                        </div>
                        <span className="text-xs text-gray-400">~5 min</span>
                      </div>

                      {/* State icon */}
                      {locked && (
                        <span aria-hidden="true" className="text-gray-300 flex-shrink-0">🔒</span>
                      )}
                      {isCurrent && (
                        <span aria-hidden="true" className="text-yellow-500 flex-shrink-0">▶</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {weeks.length === 0 && (
          <EmptyState
            icon="📖"
            title="No lessons yet"
            description="No lessons available yet. Check back soon!"
          />
        )}
      </div>

      {/* Sticky continue banner — mobile only */}
      {currentUnit && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-30 md:hidden">
          <button
            onClick={() => navigate('/lesson/' + currentUnit.id)}
            className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold shadow-xl hover:bg-green-700 transition-colors"
          >
            Continue: {currentUnit.title} →
          </button>
        </div>
      )}
    </div>
  )
}
