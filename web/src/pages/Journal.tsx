import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../data/useAuth'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

interface JournalEntry {
  id: string
  user_id: string
  content: string
  mood: string | null
  word_count: number
  created_at: string
}

const MOODS = ['😊', '😤', '🤔', '😴', '🔥']
const PREVIEW_LENGTH = 150

type FilterTab = 'all' | 'week' | 'month'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function startOf(unit: 'week' | 'month'): Date {
  const now = new Date()
  if (unit === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0)
  }
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
}

export default function Journal() {
  usePageTitle('Journal')

  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const wordCount = useMemo(() => countWords(content), [content])

  // Fetch entries
  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['journal', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error: err } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      return data ?? []
    },
    enabled: !!user,
  })

  // Save entry
  const saveEntry = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const trimmed = content.trim()
      if (!trimmed) throw new Error('Empty entry')
      const { error: err } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        content: trimmed,
        mood: mood ?? null,
        word_count: countWords(trimmed),
      })
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', user?.id] })
      setContent('')
      setMood(null)
      success('Entry saved!')
    },
    onError: () => error('Could not save entry. Try again.'),
  })

  // Delete entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase.from('journal_entries').delete().eq('id', id)
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', user?.id] })
      success('Entry deleted.')
    },
    onError: () => error('Could not delete entry.'),
  })

  // Filter + search
  const filtered = useMemo(() => {
    let list = entries
    if (filter === 'week') {
      const since = startOf('week')
      list = list.filter(e => new Date(e.created_at) >= since)
    } else if (filter === 'month') {
      const since = startOf('month')
      list = list.filter(e => new Date(e.created_at) >= since)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.content.toLowerCase().includes(q))
    }
    return list
  }, [entries, filter, search])

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
        <p className="text-gray-500 mt-1">Reflect on your daily learning.</p>
      </div>

      {/* New entry form */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-3">New entry</h2>

        {/* Mood picker */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gray-500">Mood:</span>
          {MOODS.map(m => (
            <button
              key={m}
              onClick={() => setMood(prev => (prev === m ? null : m))}
              className={`text-xl rounded-xl p-1 transition-all ${
                mood === m
                  ? 'bg-green-100 ring-2 ring-green-400 scale-110'
                  : 'hover:bg-gray-100 opacity-60 hover:opacity-100'
              }`}
              aria-label={`Mood: ${m}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What did you learn today? Any challenges? Wins?"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
        />

        {/* Footer row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? 's' : ''}` : 'Start writing…'}
          </span>
          <button
            onClick={() => saveEntry.mutate()}
            disabled={saveEntry.isPending || !content.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {saveEntry.isPending ? 'Saving…' : 'Save entry'}
          </button>
        </div>
      </Card>

      {/* Filter tabs + search */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['all', 'week', 'month'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === tab
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && entries.length === 0 && (
        <EmptyState
          icon="📔"
          title="Your journal is empty"
          description="Write your first entry above to start tracking your learning journey."
        />
      )}

      {/* No results for filter/search */}
      {!isLoading && entries.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No entries found"
          description="Try a different filter or search term."
        />
      )}

      {/* Entry list */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(entry => {
            const isExpanded = expandedIds.has(entry.id)
            const isLong = entry.content.length > PREVIEW_LENGTH

            return (
              <Card key={entry.id}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.mood && (
                      <span className="text-lg" aria-label="mood">{entry.mood}</span>
                    )}
                    <time className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</time>
                    <span className="text-xs text-gray-400">
                      · {entry.word_count} word{entry.word_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteEntry.mutate(entry.id)}
                    disabled={deleteEntry.isPending}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                    aria-label="Delete entry"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {isLong && !isExpanded
                    ? entry.content.slice(0, PREVIEW_LENGTH) + '…'
                    : entry.content}
                </p>

                {isLong && (
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium mt-2 block"
                  >
                    {isExpanded ? 'Read less' : 'Read more'}
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
