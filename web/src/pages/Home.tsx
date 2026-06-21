import { useNavigate } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { useActiveProgramSlug, useUnits, useProgram, useLessonProgressMap } from '../data/queries'
import { useLocalProgressStore } from '../store/localProgressStore'
import { Card } from '../components/ui/Card'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: slug, isLoading: slugLoading } = useActiveProgramSlug()
  const { data: program } = useProgram(slug ?? '')
  const { data: units = [], isLoading: unitsLoading } = useUnits(program?.id)
  const { data: progressMap } = useLessonProgressMap(user?.id)
  const localProgress = useLocalProgressStore()

  const isCompleted = (unitId: string) => {
    return progressMap?.has(unitId) || localProgress.isCompleted(unitId)
  }

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

  const handleUnitClick = (unit: (typeof units)[0], idx: number) => {
    if (idx <= currentUnitIndex) {
      navigate(`/lesson/${unit.id}`)
    }
  }

  if (slugLoading || unitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!slug) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">📚</span>
        <h2 className="mt-4 text-xl font-bold text-gray-900">No program enrolled</h2>
        <p className="mt-2 text-gray-500">Complete onboarding to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {program?.emoji} {program?.title ?? 'Your Journey'}
        </h1>
        <p className="text-gray-500 mt-1">
          {completedCount} of {units.length} lessons completed
        </p>
      </div>

      {/* Overall progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{Math.round((completedCount / Math.max(units.length, 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / Math.max(units.length, 1)) * 100}%` }}
          />
        </div>
      </Card>

      {/* Weeks */}
      <div className="space-y-8">
        {weeks.map(({ week, units: weekUnits }) => (
          <div key={week}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Week {week}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {weekUnits.map((unit, idxInWeek) => {
                const globalIdx = units.findIndex((u) => u.id === unit.id)
                const done = isCompleted(unit.id)
                const isCurrent = globalIdx === currentUnitIndex
                const locked = globalIdx > currentUnitIndex

                return (
                  <button
                    key={unit.id}
                    onClick={() => handleUnitClick(unit, globalIdx)}
                    disabled={locked}
                    className={`
                      flex items-center gap-4 p-4 rounded-2xl border text-left transition-all
                      ${done ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                      ${isCurrent ? 'bg-yellow-50 border-yellow-300 shadow-sm hover:bg-yellow-100' : ''}
                      ${locked ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : ''}
                      ${!done && !isCurrent && !locked ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm' : ''}
                    `}
                  >
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

                    {/* XP badge */}
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                      done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {done ? '✓' : '50'} XP
                    </div>

                    {/* Locked icon */}
                    {locked && (
                      <span className="text-gray-300 flex-shrink-0">🔒</span>
                    )}
                    {isCurrent && (
                      <span className="text-yellow-500 flex-shrink-0">▶</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {weeks.length === 0 && (
          <Card className="text-center py-12">
            <span className="text-4xl">📖</span>
            <p className="mt-3 text-gray-500">No lessons available yet. Check back soon!</p>
          </Card>
        )}
      </div>
    </div>
  )
}
