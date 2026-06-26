import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../data/useAuth'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

type GoalType = 'xp' | 'lessons' | 'streak' | 'custom'

interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  type: GoalType
  target_value: number
  current_value: number
  target_date: string | null
  completed: boolean
  created_at: string
}

const TYPE_ICONS: Record<GoalType, string> = {
  xp: '⚡',
  lessons: '📚',
  streak: '🔥',
  custom: '🎯',
}

const TYPE_LABELS: Record<GoalType, string> = {
  xp: 'XP',
  lessons: 'Lessons',
  streak: 'Day streak',
  custom: 'Custom',
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

const BLANK_FORM = { title: '', type: 'custom' as GoalType, target_value: '', target_date: '' }

export default function Goals() {
  usePageTitle('Goals')

  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error: err } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      return data ?? []
    },
    enabled: !!user,
  })

  // Create goal
  const createGoal = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const target = parseInt(form.target_value, 10)
      if (!form.title.trim() || isNaN(target) || target <= 0) throw new Error('Invalid input')
      const { error: err } = await supabase.from('goals').insert({
        user_id: user.id,
        title: form.title.trim(),
        type: form.type,
        target_value: target,
        current_value: 0,
        target_date: form.target_date || null,
        completed: false,
      })
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] })
      setForm(BLANK_FORM)
      setShowForm(false)
      success('Goal created!')
    },
    onError: () => error('Could not create goal. Try again.'),
  })

  // Complete goal
  const completeGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase
        .from('goals')
        .update({ completed: true })
        .eq('id', id)
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] })
      success('Goal completed! Great work.')
    },
    onError: () => error('Could not complete goal.'),
  })

  // Delete goal
  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase.from('goals').delete().eq('id', id)
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] })
      setConfirmDeleteId(null)
      success('Goal deleted.')
    },
    onError: () => error('Could not delete goal.'),
  })

  const active = goals.filter(g => !g.completed)
  const completed = goals.filter(g => g.completed)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-500 mt-1">Track your learning milestones.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <h2 className="font-bold text-gray-900 mb-4">New goal</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Earn 1000 XP this month"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as GoalType }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="xp">⚡ XP</option>
                  <option value="lessons">📚 Lessons</option>
                  <option value="streak">🔥 Streak</option>
                  <option value="custom">🎯 Custom</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Target value</label>
                <input
                  type="number"
                  min={1}
                  value={form.target_value}
                  onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Target date (optional)</label>
              <input
                type="date"
                value={form.target_date}
                onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
            <button
              onClick={() => createGoal.mutate()}
              disabled={createGoal.isPending || !form.title.trim() || !form.target_value}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors w-full"
            >
              {createGoal.isPending ? 'Saving…' : 'Create goal'}
            </button>
          </div>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && goals.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Set your first learning goal"
          description="Goals help you stay motivated. Create one to get started."
        />
      )}

      {/* Active goals */}
      {!isLoading && active.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-900 mb-4">Active</h2>
          <div className="space-y-3">
            {active.map(goal => {
              const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
              const daysLeft = goal.target_date ? daysUntil(goal.target_date) : null
              const isDeleting = confirmDeleteId === goal.id

              return (
                <Card key={goal.id}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0">{TYPE_ICONS[goal.type]}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{goal.title}</p>
                        <p className="text-xs text-gray-400">{TYPE_LABELS[goal.type]}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {goal.current_value.toLocaleString()}
                        <span className="text-gray-400 font-normal"> / {goal.target_value.toLocaleString()}</span>
                      </p>
                      {daysLeft !== null && (
                        <p className={`text-xs mt-0.5 ${daysLeft < 3 ? 'text-red-500' : 'text-gray-400'}`}>
                          {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                        </p>
                      )}
                    </div>
                  </div>

                  <ProgressBar value={goal.current_value} max={goal.target_value} showPercent size="sm" />

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => completeGoal.mutate(goal.id)}
                      disabled={completeGoal.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors"
                    >
                      Mark complete
                    </button>

                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Delete?</span>
                        <button
                          onClick={() => deleteGoal.mutate(goal.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-medium"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-xl text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(goal.id)}
                        className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Completed goals */}
      {!isLoading && completed.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-900 mb-4">Completed</h2>
          <div className="space-y-3">
            {completed.map(goal => (
              <Card key={goal.id} className="opacity-70">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{TYPE_ICONS[goal.type]}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm line-through truncate">{goal.title}</p>
                      <p className="text-xs text-gray-400">{TYPE_LABELS[goal.type]} · Completed</p>
                    </div>
                  </div>
                  <span className="text-green-500 text-lg flex-shrink-0">✓</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
