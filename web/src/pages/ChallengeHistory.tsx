import { Link } from 'react-router-dom'
import { useDailyChallengeStore } from '../store/dailyChallengeStore'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex gap-1" aria-label={`Score: ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`w-3 h-3 rounded-sm ${i < score ? 'bg-green-500' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function scoreLabel(score: number): { text: string; cls: string } {
  if (score === 5) return { text: 'Perfect',    cls: 'bg-green-100 text-green-700' }
  if (score >= 4) return { text: 'Great',       cls: 'bg-blue-50 text-blue-600' }
  if (score >= 3) return { text: 'Good',        cls: 'bg-yellow-50 text-yellow-600' }
  return               { text: 'Keep going',   cls: 'bg-red-50 text-red-500' }
}

export default function ChallengeHistory() {
  usePageTitle('Challenge History')
  const history = useDailyChallengeStore(s => s.history)
  const store = useDailyChallengeStore()

  const avgScore = history.length
    ? (history.reduce((s, e) => s + e.score, 0) / history.length).toFixed(1)
    : '—'
  const perfectCount = history.filter(e => e.score === 5).length
  const times = history.map(e => e.timeSec).filter(t => t > 0)
  const bestTime = times.length ? formatTime(Math.min(...times)) : '—'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Challenge History</h1>
          <p className="text-gray-500 mt-1">Your daily challenge results over time.</p>
        </div>
        <Link
          to="/challenge"
          className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          Today's Challenge →
        </Link>
      </div>

      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avg Score', value: `${avgScore}/5` },
            { label: 'Perfect Scores', value: String(perfectCount) },
            { label: 'Best Time', value: bestTime },
          ].map(stat => (
            <Card key={stat.label} className="text-center">
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>
      )}

      {store.completed && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Today</p>
              <ScoreDots score={store.score} />
              <p className="text-sm text-gray-500 mt-1.5">{store.score}/5 correct</p>
            </div>
            <span className="text-3xl" aria-hidden="true">
              {store.score === 5 ? '🏆' : store.score >= 3 ? '⚡' : '💪'}
            </span>
          </div>
        </Card>
      )}

      {history.length === 0 ? (
        <EmptyState
          icon="⚡"
          title="No history yet"
          description="Complete your first daily challenge to start tracking results."
          action={
            <Link
              to="/challenge"
              className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Start challenge →
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {history.map(entry => {
            const { text, cls } = scoreLabel(entry.score)
            return (
              <div
                key={entry.date}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0"
              >
                <div className="w-16 flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-900">
                    {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
                <div className="flex-1">
                  <ScoreDots score={entry.score} />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {entry.timeSec > 0 && (
                    <p className="text-xs text-gray-400 font-mono">{formatTime(entry.timeSec)}</p>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{text}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
