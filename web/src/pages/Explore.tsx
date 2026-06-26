import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllPrograms, useActiveProgramSlug, useEnrollInProgram } from '../data/queries'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

function deriveDifficultyChip(description: string | null | undefined): { label: string; color: string } | null {
  if (!description) return null
  const lower = description.toLowerCase()
  if (lower.includes('beginner') || lower.includes('intro') || lower.includes('basic')) {
    return { label: 'Beginner', color: 'bg-green-100 text-green-700' }
  }
  if (lower.includes('intermediate') || lower.includes('medium')) {
    return { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' }
  }
  if (lower.includes('advanced') || lower.includes('expert')) {
    return { label: 'Advanced', color: 'bg-red-100 text-red-700' }
  }
  return null
}

function deriveCategoryChip(description: string | null | undefined): { label: string; color: string } | null {
  if (!description) return null
  const lower = description.toLowerCase()
  if (lower.includes('grammar') || lower.includes('writing')) return { label: 'Grammar', color: 'bg-blue-100 text-blue-700' }
  if (lower.includes('vocab') || lower.includes('word')) return { label: 'Vocabulary', color: 'bg-purple-100 text-purple-700' }
  if (lower.includes('speak') || lower.includes('conversat')) return { label: 'Speaking', color: 'bg-pink-100 text-pink-700' }
  if (lower.includes('listen') || lower.includes('audio')) return { label: 'Listening', color: 'bg-indigo-100 text-indigo-700' }
  if (lower.includes('read')) return { label: 'Reading', color: 'bg-teal-100 text-teal-700' }
  if (lower.includes('business')) return { label: 'Business', color: 'bg-orange-100 text-orange-700' }
  return null
}

export default function Explore() {
  usePageTitle('Explore Programs')
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { data: programs = [], isLoading } = useAllPrograms()
  const { data: activeSlug } = useActiveProgramSlug()
  const enroll = useEnrollInProgram()

  // Map: programId → confirm pending
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleEnroll(programId: string) {
    try {
      await enroll.mutateAsync(programId)
      success('Enrolled! Starting your new program.')
      setConfirmId(null)
      navigate('/')
    } catch {
      error('Could not enroll. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Programs</h1>
        <p className="text-gray-500 mt-1">Browse all available learning paths and enroll in one.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon="🔭"
          title="No programs yet"
          description="Check back soon — new programs are being added."
        />
      ) : (
        <div className="space-y-4">
          {programs.map(prog => {
            const isEnrolled = prog.slug === activeSlug
            const diffChip = deriveDifficultyChip(prog.description)
            const catChip = deriveCategoryChip(prog.description)
            const isConfirming = confirmId === prog.id

            return (
              <Card key={prog.id}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-green-100">
                    {prog.emoji ?? '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-bold text-gray-900">{prog.title}</h2>
                      {isEnrolled && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          Enrolled ✓
                        </span>
                      )}
                    </div>

                    {/* Chips */}
                    {(diffChip || catChip) && (
                      <div className="flex gap-2 mb-2">
                        {catChip && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catChip.color}`}>
                            {catChip.label}
                          </span>
                        )}
                        {diffChip && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffChip.color}`}>
                            {diffChip.label}
                          </span>
                        )}
                      </div>
                    )}

                    {prog.description && (
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">{prog.description}</p>
                    )}

                    {isEnrolled ? (
                      <button
                        onClick={() => navigate('/')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Continue learning →
                      </button>
                    ) : isConfirming ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-600 mr-1">
                          You'll switch to this program. Continue?
                        </p>
                        <button
                          onClick={() => handleEnroll(prog.id)}
                          disabled={enroll.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                        >
                          {enroll.isPending ? 'Enrolling…' : 'Yes, enroll'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={enroll.isPending}
                          className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(prog.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
