import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../contexts/ToastContext'
import { usePageTitle } from '../../hooks/usePageTitle'

interface Program { id: string; slug: string; title: string; emoji?: string; description?: string }
interface Unit    { id: string; title: string; emoji?: string; goal?: string; order_num: number; week?: number }

function useAdminPrograms() {
  return useQuery<Program[]>({
    queryKey: ['admin-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programs').select('id, slug, title, emoji, description').order('id')
      if (error) throw error
      return (data ?? []) as Program[]
    },
    staleTime: 30_000,
  })
}

function useAdminUnits(programId?: string) {
  return useQuery<Unit[]>({
    queryKey: ['admin-units', programId],
    enabled: !!programId,
    queryFn: async () => {
      const { data, error } = await supabase.from('units').select('id, title, emoji, goal, order_num, week').eq('program_id', programId).order('order_num')
      if (error) throw error
      return (data ?? []) as Unit[]
    },
    staleTime: 30_000,
  })
}

function UnitRow({ unit, programId }: { unit: Unit; programId: string }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(unit.title)
  const [emoji, setEmoji] = useState(unit.emoji ?? '')
  const [goal, setGoal] = useState(unit.goal ?? '')
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const saveUnit = useMutation({
    mutationFn: async () => {
      const { error: err } = await supabase
        .from('units')
        .update({ title, emoji: emoji || null, goal: goal || null })
        .eq('id', unit.id)
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-units', programId] })
      setEditing(false)
      success('Unit updated.')
    },
    onError: () => error('Could not save unit.'),
  })

  if (!editing) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
        <span className="text-gray-400 text-xs font-mono w-6 flex-shrink-0">{unit.order_num}</span>
        <span className="text-lg flex-shrink-0">{unit.emoji ?? '📖'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{unit.title}</p>
          {unit.goal && <p className="text-xs text-gray-400 truncate">{unit.goal}</p>}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-green-600 hover:text-green-700 font-medium flex-shrink-0"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-0 space-y-2">
      <div className="flex gap-2">
        <input
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          placeholder="Emoji"
          maxLength={2}
          className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Unit title"
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <input
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="Goal / description"
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <div className="flex gap-2">
        <button
          onClick={() => saveUnit.mutate()}
          disabled={saveUnit.isPending || !title.trim()}
          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          {saveUnit.isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setTitle(unit.title); setEmoji(unit.emoji ?? ''); setGoal(unit.goal ?? '') }}
          className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function ProgramPanel({ program }: { program: Program }) {
  const [open, setOpen] = useState(false)
  const { data: units = [], isLoading } = useAdminUnits(open ? program.id : undefined)

  return (
    <Card>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 text-left"
      >
        <span className="text-2xl">{program.emoji ?? '📚'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{program.title}</p>
          <p className="text-xs text-gray-400 truncate">{program.slug}</p>
        </div>
        <span className="text-gray-400 text-sm flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          {isLoading ? (
            <Skeleton lines={3} />
          ) : units.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No units yet.</p>
          ) : (
            <div>
              {units.map(u => (
                <UnitRow key={u.id} unit={u} programId={program.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function AdminContent() {
  usePageTitle('Content Editor')
  const { data: programs = [], isLoading } = useAdminPrograms()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
        <p className="text-gray-500 mt-1">Edit programs and units. Click a program to expand its units.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-6">No programs found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {programs.map(p => <ProgramPanel key={p.id} program={p} />)}
        </div>
      )}
    </div>
  )
}
