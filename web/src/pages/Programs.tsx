import { useNavigate } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { useAllPrograms, useActiveProgramSlug, useEnrollInProgram } from '../data/queries'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Programs() {
  usePageTitle('Programs')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { data: programs = [], isLoading } = useAllPrograms()
  const { data: activeSlug } = useActiveProgramSlug()
  const enroll = useEnrollInProgram()

  async function handleEnroll(programId: string, _programSlug: string) {
    try {
      await enroll.mutateAsync(programId)
      success('Program switched! Starting your new journey.')
      navigate('/')
    } catch (err) {
      error('Could not switch program. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        <p className="text-gray-500 mt-1">Choose your learning path. Switch anytime.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-6">No programs available yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {programs.map(prog => {
            const isActive = prog.slug === activeSlug
            return (
              <Card key={prog.id}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {prog.emoji ?? '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-gray-900">{prog.title}</h2>
                      {isActive && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    {prog.description && (
                      <p className="text-sm text-gray-500 mb-3">{prog.description}</p>
                    )}
                    {isActive ? (
                      <button
                        onClick={() => navigate('/')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Continue learning →
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(prog.id, prog.slug)}
                        disabled={enroll.isPending}
                        className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                      >
                        {enroll.isPending ? 'Switching…' : 'Switch to this program'}
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
