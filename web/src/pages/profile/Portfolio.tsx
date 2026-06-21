import { useAuth } from '../../data/useAuth'
import { usePortfolioResponses } from '../../data/queries'
import { Card } from '../../components/ui/Card'

export default function Portfolio() {
  const { user } = useAuth()
  const { data: responses, isLoading } = usePortfolioResponses(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-gray-500 mt-1">
          Your AI-generated artifacts from lessons — prompts, analyses, and more.
        </p>
      </div>

      {(!responses || responses.length === 0) ? (
        <Card className="text-center py-16">
          <p className="text-5xl mb-4">📁</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nothing here yet</h2>
          <p className="text-sm text-gray-500">
            Complete lessons with portfolio-building exercises to populate this gallery.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {responses.map((item: any) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {item.step_id ?? 'Artifact'}
                  </span>
                </div>
                <time className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(item.created_at).toLocaleDateString()}
                </time>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {typeof item.response === 'string' ? item.response : JSON.stringify(item.response, null, 2)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
