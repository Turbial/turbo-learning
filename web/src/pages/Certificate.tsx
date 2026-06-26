import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useUnits, useLessonProgressMap, useActiveProgramSlug } from '../data/queries'
import type { Program } from '../data/queries'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui/Spinner'
import { usePageTitle } from '../hooks/usePageTitle'

// Local hook — get program by id (not slug)
function useProgramById(programId?: string) {
  return useQuery<Program | null>({
    queryKey: ['programById', programId],
    enabled: !!programId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, slug, title, emoji, description')
        .eq('id', programId)
        .single()
      if (error) return null
      return data as Program
    },
    staleTime: 10 * 60_000,
  })
}

export default function Certificate() {
  const { programId } = useParams<{ programId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: _activeSlug } = useActiveProgramSlug()
  const { data: units = [], isLoading: unitsLoading } = useUnits(programId)
  const { data: progressMap, isLoading: progressLoading } = useLessonProgressMap(user?.id)
  const { data: program, isLoading: programLoading } = useProgramById(programId)

  usePageTitle(program?.title ? `Certificate — ${program.title}` : 'Certificate')

  const completedCount = units.filter(u => progressMap?.has(u.id)).length
  const isComplete = units.length > 0 && completedCount >= units.length
  const isLoading = unitsLoading || progressLoading || programLoading

  useEffect(() => {
    if (!isLoading && !isComplete && units.length > 0) {
      navigate('/', { replace: true })
    }
  }, [isLoading, isComplete, units.length, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!isComplete) return null

  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Journey</Link>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const url = window.location.href
                navigator.clipboard.writeText(url)
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              Copy link
            </button>
            <button
              onClick={() => window.print()}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div
          id="certificate"
          className="bg-white rounded-3xl shadow-xl border-4 border-green-600 p-12 text-center"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <div className="text-5xl mb-4">⚡</div>
          <p className="text-sm font-sans font-semibold text-green-600 uppercase tracking-widest mb-2">
            Certificate of Completion
          </p>
          <p className="text-gray-500 font-sans text-sm mb-8">This certifies that</p>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 border-b-2 border-green-200 pb-4 mx-8">
            {user?.user_metadata?.name ?? user?.email ?? 'Learner'}
          </h1>

          <p className="text-gray-500 font-sans text-sm mt-4 mb-2">has successfully completed</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{program?.title ?? 'AI Learning Program'}</h2>

          <div className="flex justify-center gap-8 mb-8 font-sans">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{units.length}</p>
              <p className="text-xs text-gray-500">Lessons</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">{completionDate}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-400 font-sans">Turbo Learning · turbolearning.ai</p>
          </div>
        </div>

        {/* LinkedIn share */}
        <p className="text-center mt-4 text-sm text-gray-500">
          Share your achievement on{' '}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  )
}
