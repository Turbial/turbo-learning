import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Types ────────────────────────────────────────────────────────────────────

interface Quest {
  id: string
  title: string
  description: string
  emoji: string
  type: 'daily' | 'weekly' | 'epic'
  xp_reward: number
  condition_type: string
  condition_value: number
}

interface QuestProgress {
  id: string
  user_id: string
  quest_id: string
  current_value: number
  completed: boolean
  completed_at: string | null
}

interface QuestWithProgress extends Quest {
  progress: QuestProgress | null
}

type Tab = 'active' | 'completed'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-green-100 text-green-700',
  epic: 'bg-purple-100 text-purple-700',
}

function daysRemaining(type: Quest['type']): number {
  const now = new Date()
  if (type === 'daily') {
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
  }
  if (type === 'weekly') {
    const day = now.getDay()
    return day === 0 ? 0 : 7 - day
  }
  return 30
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Quests() {
  usePageTitle('Quests')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [tab, setTab] = useState<Tab>('active')

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: quests = [], isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('quests')
        .select('*')
        .order('type', { ascending: true })
      if (err) throw err
      return data as Quest[]
    },
  })

  const { data: progressList = [], isLoading: progressLoading } = useQuery({
    queryKey: ['quest_progress', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error: err } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', user.id)
      if (err) throw err
      return data as QuestProgress[]
    },
    enabled: !!user,
  })

  const isLoading = questsLoading || progressLoading

  const progressMap: Record<string, QuestProgress> = {}
  for (const p of progressList) progressMap[p.quest_id] = p

  const allQuests: QuestWithProgress[] = quests.map(q => ({
    ...q,
    progress: progressMap[q.id] ?? null,
  }))

  const activeQuests = allQuests.filter(q => q.progress && !q.progress.completed)
  const availableQuests = allQuests.filter(q => !q.progress)
  const completedQuests = allQuests.filter(q => q.progress?.completed)

  // ── Mutations ──────────────────────────────────────────────────────────────

  const acceptQuest = useMutation({
    mutationFn: async (questId: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error: err } = await supabase.from('quest_progress').insert({
        user_id: user.id,
        quest_id: questId,
        current_value: 0,
        completed: false,
        completed_at: null,
      })
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest_progress', user?.id] })
      success('Quest accepted! Good luck!')
    },
    onError: () => error('Could not accept quest. Try again.'),
  })

  // ── Render: Quest Card ────────────────────────────────────────────────────

  function QuestCard({ quest }: { quest: QuestWithProgress }) {
    const { progress, type, xp_reward, condition_value, emoji, title, description } = quest
    const isAccepted = !!progress
    const isCompleted = progress?.completed ?? false
    const currentValue = progress?.current_value ?? 0
    const days = daysRemaining(type)
    const typeColor = TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'

    return (
      <Card>
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0 mt-0.5">{emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-gray-900 leading-tight">{title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor}`}>
                  {type}
                </span>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  +{xp_reward} XP
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-3">{description}</p>

            {isCompleted ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-semibold">Completed</span>
                {progress?.completed_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(progress.completed_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            ) : isAccepted ? (
              <div className="space-y-1.5">
                <ProgressBar
                  value={currentValue}
                  max={condition_value}
                  label={`${currentValue} / ${condition_value}`}
                  showPercent
                  size="sm"
                />
                <p className="text-xs text-gray-400">
                  {days === 0 ? 'Ends today' : `${days} day${days !== 1 ? 's' : ''} remaining`}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {days === 0 ? 'Ends today' : `${days} day${days !== 1 ? 's' : ''} remaining`}
                </p>
                <button
                  onClick={() => acceptQuest.mutate(quest.id)}
                  disabled={acceptQuest.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  Accept Quest
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // ── Render: Page ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quests</h1>
        <p className="text-gray-500 mt-1">Complete missions to earn XP and level up.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(['active', 'completed'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'active' && activeQuests.length > 0 && (
              <span className="ml-1.5 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeQuests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : tab === 'active' ? (
        <>
          {activeQuests.length === 0 && availableQuests.length === 0 ? (
            <EmptyState
              icon="⚔️"
              title="No quests available"
              description="Check back soon for new quests to take on."
            />
          ) : (
            <div className="space-y-4">
              {activeQuests.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-bold text-gray-900 mb-4">In Progress</h2>
                  {activeQuests.map(q => <QuestCard key={q.id} quest={q} />)}
                </div>
              )}
              {availableQuests.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-bold text-gray-900 mb-4">Available</h2>
                  {availableQuests.map(q => <QuestCard key={q.id} quest={q} />)}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {completedQuests.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="No completed quests yet"
              description="Accept and complete quests to see them here."
            />
          ) : (
            <div className="space-y-3">
              {completedQuests.map(q => <QuestCard key={q.id} quest={q} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
