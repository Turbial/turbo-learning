import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

const RECENT_KEY = 'turbo-recent-searches'
const MAX_RECENT = 5

interface ProgramResult { id: string; slug: string; title: string; emoji: string | null }
interface UnitResult    { id: string; title: string; emoji: string | null; program_id: string }
interface LessonResult  { id: string; title: string; unit_id: string }

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(term: string) {
  const prev = getRecent().filter(t => t !== term)
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)))
}

function removeRecent(term: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(t => t !== term)))
}

export default function Search() {
  usePageTitle('Search')

  const [input, setInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [recent, setRecent] = useState<string[]>(getRecent)

  // Debounce input → searchTerm
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(input.trim()), 300)
    return () => clearTimeout(id)
  }, [input])

  // Save to recent when a search completes
  useEffect(() => {
    if (searchTerm.length >= 2) saveRecent(searchTerm)
  }, [searchTerm])

  const enabled = searchTerm.length >= 2

  const { data: programs = [], isLoading: loadingPrograms } = useQuery<ProgramResult[]>({
    queryKey: ['search-programs', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id,slug,title,emoji')
        .ilike('title', `%${searchTerm}%`)
        .limit(5)
      if (error) throw error
      return data ?? []
    },
    enabled,
  })

  const { data: units = [], isLoading: loadingUnits } = useQuery<UnitResult[]>({
    queryKey: ['search-units', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('id,title,emoji,program_id')
        .ilike('title', `%${searchTerm}%`)
        .limit(5)
      if (error) throw error
      return data ?? []
    },
    enabled,
  })

  const { data: lessons = [], isLoading: loadingLessons } = useQuery<LessonResult[]>({
    queryKey: ['search-lessons', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id,title,unit_id')
        .ilike('title', `%${searchTerm}%`)
        .limit(5)
      if (error) throw error
      return data ?? []
    },
    enabled,
  })

  const isLoading = enabled && (loadingPrograms || loadingUnits || loadingLessons)
  const hasResults = programs.length + units.length + lessons.length > 0

  function handleRecentClick(term: string) {
    setInput(term)
    setSearchTerm(term)
  }

  function handleRemoveRecent(term: string) {
    removeRecent(term)
    setRecent(getRecent())
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-500 mt-1">Find programs, units, and lessons.</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="search"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search anything…"
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          autoFocus
        />
      </div>

      {/* Recent searches (shown only when input is empty) */}
      {!input && recent.length > 0 && (
        <Card>
          <h2 className="font-bold text-gray-900 mb-3">Recent searches</h2>
          <ul className="space-y-1">
            {recent.map(term => (
              <li key={term} className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleRecentClick(term)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 flex-1 text-left py-1"
                >
                  <span className="text-gray-400">🕑</span>
                  {term}
                </button>
                <button
                  onClick={() => handleRemoveRecent(term)}
                  className="text-xs text-gray-400 hover:text-red-500 px-1"
                  aria-label={`Remove "${term}" from recent`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Empty prompt */}
      {!input && recent.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Start searching"
          description="Type at least 2 characters to search programs, units, and lessons."
        />
      )}

      {/* Short query hint */}
      {input.length === 1 && (
        <p className="text-sm text-gray-400 text-center">Keep typing…</p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && enabled && (
        <>
          {!hasResults ? (
            <EmptyState
              icon="😕"
              title="No results"
              description={`Nothing matched "${searchTerm}". Try a different search.`}
            />
          ) : (
            <div className="space-y-6">
              {/* Programs */}
              {programs.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-bold text-gray-900">📚 Programs</h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {programs.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {programs.map(p => (
                      <Link key={p.id} to="/programs">
                        <Card className="hover:border-green-200 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{p.emoji ?? '📚'}</span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                              <p className="text-xs text-gray-400">Program</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Units */}
              {units.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-bold text-gray-900">📖 Units</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {units.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {units.map(u => (
                      <Link key={u.id} to={`/lesson/${u.id}`}>
                        <Card className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{u.emoji ?? '📖'}</span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{u.title}</p>
                              <p className="text-xs text-gray-400">Unit</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Lessons */}
              {lessons.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-bold text-gray-900">🎯 Lessons</h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {lessons.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {lessons.map(l => (
                      <Link key={l.id} to={`/lesson/${l.unit_id}`}>
                        <Card className="hover:border-orange-200 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{l.title}</p>
                              <p className="text-xs text-gray-400">Lesson</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
