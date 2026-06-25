import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { useLessonNotes, useDeleteNote } from '../data/queries'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Notes() {
  usePageTitle('My Notes')
  const { user } = useAuth()
  const { data: notes = [], isLoading } = useLessonNotes(user?.id)
  const deleteNote = useDeleteNote()
  const { success, error } = useToast()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleDelete(id: string) {
    try {
      await deleteNote.mutateAsync(id)
      success('Note deleted.')
    } catch {
      error('Could not delete note. Try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-500 mt-1">Notes you've taken during lessons.</p>
        </div>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Tap the 📝 button during a lesson to save a note here."
        />
      ) : (
        <div className="space-y-3">
          {notes.map(note => {
            const isExpanded = expandedIds.has(note.id)
            const isLong = note.content.length > 200
            return (
              <Card key={note.id}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <time className="text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </time>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deleteNote.isPending}
                    className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
                    aria-label="Delete note"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {isLong && !isExpanded
                    ? note.content.slice(0, 200) + '…'
                    : note.content}
                </p>
                {isLong && (
                  <button
                    onClick={() => toggleExpand(note.id)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium mt-2 block"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
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
