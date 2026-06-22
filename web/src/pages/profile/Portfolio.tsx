import { useAuth } from '../../data/useAuth'
import { usePortfolioResponses } from '../../data/queries'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { usePageTitle } from '../../hooks/usePageTitle'

function renderResponse(response: unknown): string {
  if (typeof response === 'string') return response
  if (typeof response === 'object' && response !== null) {
    // Try to extract a meaningful text field
    const r = response as Record<string, unknown>
    if (r.text) return String(r.text)
    if (r.content) return String(r.content)
    if (r.response) return String(r.response)
    if (r.answer) return String(r.answer)
    return JSON.stringify(response, null, 2)
  }
  return String(response)
}

export default function Portfolio() {
  usePageTitle('Portfolio')
  const { user } = useAuth()
  const { data: responses, isLoading } = usePortfolioResponses(user?.id)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton lines={4} />
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
        <EmptyState
          icon="📁"
          title="Nothing here yet"
          description="Complete lessons with portfolio-building exercises to populate this gallery."
        />
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
                  {renderResponse(item.response)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
