import { useState, useMemo } from 'react'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Types ────────────────────────────────────────────────────────────────────

interface Resource {
  id: string
  title: string
  url: string
  description: string
  type: 'article' | 'video' | 'tool' | 'course'
  topic: string
  likes: number
}

type FilterType = 'all' | 'article' | 'video' | 'tool' | 'course' | 'bookmarked'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  article: '📄',
  video: '🎬',
  tool: '🔧',
  course: '🎓',
}

const TYPE_COLORS: Record<string, string> = {
  article: 'bg-blue-100 text-blue-700',
  video: 'bg-red-100 text-red-700',
  tool: 'bg-orange-100 text-orange-700',
  course: 'bg-purple-100 text-purple-700',
}

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'article', label: 'Articles' },
  { key: 'video', label: 'Videos' },
  { key: 'tool', label: 'Tools' },
  { key: 'course', label: 'Courses' },
  { key: 'bookmarked', label: 'Bookmarked' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Resources() {
  usePageTitle('Resources')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestForm, setSuggestForm] = useState({
    title: '',
    url: '',
    description: '',
    type: 'article' as Resource['type'],
  })

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('resources')
        .select('*')
        .order('likes', { ascending: false })
      if (err) throw err
      return data as Resource[]
    },
  })

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ['resource_bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error: err } = await supabase
        .from('resource_bookmarks')
        .select('resource_id')
        .eq('user_id', user.id)
      if (err) throw err
      return (data ?? []).map((b: { resource_id: string }) => b.resource_id)
    },
    enabled: !!user,
  })

  const bookmarkSet = new Set(bookmarks)

  // ── Mutations ──────────────────────────────────────────────────────────────

  const toggleBookmark = useMutation({
    mutationFn: async (resourceId: string) => {
      if (!user) throw new Error('Not authenticated')
      if (bookmarkSet.has(resourceId)) {
        const { error: err } = await supabase
          .from('resource_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('resource_bookmarks')
          .upsert({ user_id: user.id, resource_id: resourceId }, { onConflict: 'user_id,resource_id' })
        if (err) throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource_bookmarks', user?.id] })
    },
    onError: () => error('Could not update bookmark.'),
  })

  const suggestResource = useMutation({
    mutationFn: async (form: typeof suggestForm) => {
      const { error: err } = await supabase.from('resources').insert({
        title: form.title,
        url: form.url,
        description: form.description,
        type: form.type,
        topic: '',
        likes: 0,
      })
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      setSuggestForm({ title: '', url: '', description: '', type: 'article' })
      setShowSuggest(false)
      success('Resource suggested — thanks!')
    },
    onError: () => error('Could not submit suggestion.'),
  })

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = resources

    if (activeFilter === 'bookmarked') {
      list = list.filter(r => bookmarkSet.has(r.id))
    } else if (activeFilter !== 'all') {
      list = list.filter(r => r.type === activeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      )
    }

    return list
  }, [resources, activeFilter, search, bookmarks])

  const isLoading = resourcesLoading || bookmarksLoading

  // ── Render: Resource Card ─────────────────────────────────────────────────

  function ResourceCard({ resource }: { resource: Resource }) {
    const isBookmarked = bookmarkSet.has(resource.id)
    const icon = TYPE_ICONS[resource.type] ?? '📎'
    const typeColor = TYPE_COLORS[resource.type] ?? 'bg-gray-100 text-gray-700'

    return (
      <Card>
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gray-900 hover:text-green-700 transition-colors leading-tight"
                >
                  {resource.title}
                </a>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor}`}>
                  {resource.type}
                </span>
                {resource.topic && (
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {resource.topic}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleBookmark.mutate(resource.id)}
                disabled={toggleBookmark.isPending}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                className="text-lg flex-shrink-0 hover:scale-110 transition-transform"
              >
                {isBookmarked ? '★' : '☆'}
              </button>
            </div>

            {resource.description && (
              <p className="text-sm text-gray-500 mt-1 mb-2 leading-relaxed">{resource.description}</p>
            )}

            <div className="flex items-center gap-3">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:text-green-700 font-medium truncate max-w-xs"
              >
                {resource.url}
              </a>
              <span className="text-xs text-gray-400 flex-shrink-0">
                ❤️ {resource.likes ?? 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // ── Render: Page ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1">Curated learning materials to level up your skills.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveFilter(t.key)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeFilter === t.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by title or description..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      />

      {/* Suggest a Resource (collapsible) */}
      <div>
        <button
          onClick={() => setShowSuggest(v => !v)}
          className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
        >
          {showSuggest ? 'Cancel' : '+ Suggest a Resource'}
        </button>

        {showSuggest && (
          <Card className="mt-3">
            <h2 className="font-bold text-gray-900 mb-4">Suggest a Resource</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={suggestForm.title}
                onChange={e => setSuggestForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Title"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <input
                type="url"
                value={suggestForm.url}
                onChange={e => setSuggestForm(f => ({ ...f, url: e.target.value }))}
                placeholder="URL (https://...)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <textarea
                value={suggestForm.description}
                onChange={e => setSuggestForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <select
                value={suggestForm.type}
                onChange={e => setSuggestForm(f => ({ ...f, type: e.target.value as Resource['type'] }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="tool">Tool</option>
                <option value="course">Course</option>
              </select>
              <button
                onClick={() => {
                  if (!suggestForm.title.trim() || !suggestForm.url.trim()) return
                  suggestResource.mutate(suggestForm)
                }}
                disabled={
                  suggestResource.isPending ||
                  !suggestForm.title.trim() ||
                  !suggestForm.url.trim()
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {suggestResource.isPending ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Resource list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        activeFilter === 'bookmarked' ? (
          <EmptyState
            icon="★"
            title="No bookmarks yet"
            description="Star resources to save them here for quick access."
          />
        ) : search.trim() ? (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={`No resources matched "${search}". Try a different search.`}
          />
        ) : (
          <EmptyState
            icon="📚"
            title="No resources yet"
            description="Resources will appear here once they're added."
          />
        )
      ) : (
        <div className="space-y-3">
          {filtered.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}
