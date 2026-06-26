import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

interface BookmarkRow {
  lesson_id: string
  lessons: {
    id: string
    title: string
    unit_id: string
    units: {
      title: string
    } | null
  } | null
}

interface GroupedUnit {
  unitId: string
  unitTitle: string
  lessons: {
    lessonId: string
    lessonTitle: string
    unitId: string
    unitTitle: string
  }[]
}

export default function Bookmarks() {
  usePageTitle('Bookmarks')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())

  const { data: bookmarks = [], isLoading } = useQuery<BookmarkRow[]>({
    queryKey: ['lesson-bookmarks', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('lesson_bookmarks')
        .select('lesson_id, lessons(id, title, unit_id, units(title))')
        .eq('user_id', user!.id)
      if (err) throw err
      return (data ?? []) as BookmarkRow[]
    },
  })

  const removeBookmark = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error: err } = await supabase
        .from('lesson_bookmarks')
        .delete()
        .eq('user_id', user!.id)
        .eq('lesson_id', lessonId)
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-bookmarks', user?.id] })
      success('Bookmark removed.')
    },
    onError: () => {
      error('Could not remove bookmark. Try again.')
    },
  })

  // Group bookmarks by unit
  const grouped: GroupedUnit[] = (() => {
    const map = new Map<string, GroupedUnit>()
    for (const bm of bookmarks) {
      const lesson = bm.lessons
      if (!lesson) continue
      const unitId = lesson.unit_id
      const unitTitle = lesson.units?.title ?? 'Unknown Unit'
      if (!map.has(unitId)) {
        map.set(unitId, { unitId, unitTitle, lessons: [] })
      }
      map.get(unitId)!.lessons.push({
        lessonId: bm.lesson_id,
        lessonTitle: lesson.title,
        unitId,
        unitTitle,
      })
    }
    return [...map.values()]
  })()

  function toggleUnit(unitId: string) {
    setExpandedUnits(prev => {
      const next = new Set(prev)
      next.has(unitId) ? next.delete(unitId) : next.add(unitId)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        {[0, 1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
          <p className="text-gray-500 mt-1">Lessons you've saved for later.</p>
        </div>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No bookmarks yet"
          description="Bookmark lessons during study to save them here."
        />
      ) : (
        <div className="space-y-3">
          {grouped.map(group => {
            const isOpen = expandedUnits.has(group.unitId)
            return (
              <Card key={group.unitId} className="!p-0 overflow-hidden">
                {/* Accordion header */}
                <button
                  onClick={() => toggleUnit(group.unitId)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg" aria-hidden="true">📂</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{group.unitTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {group.lessons.length} lesson{group.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {group.lessons.map(lesson => (
                      <div
                        key={lesson.lessonId}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {lesson.lessonTitle}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {group.unitTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to={`/lesson/${lesson.unitId}`}
                            className="text-sm text-green-600 hover:text-green-700 font-medium whitespace-nowrap transition-colors"
                          >
                            Go to lesson →
                          </Link>
                          <button
                            onClick={() => removeBookmark.mutate(lesson.lessonId)}
                            disabled={removeBookmark.isPending}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            aria-label={`Remove bookmark for ${lesson.lessonTitle}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
