import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

interface Team {
  id: string
  name: string
  owner_id: string
  invite_code: string
}

interface TeamMember {
  user_id: string
  role: string
  profiles: { name?: string; email?: string; xp: number; streak: number } | Array<{ name?: string; email?: string; xp: number; streak: number }>
}

function useMyTeam(userId?: string) {
  return useQuery<(Team & { isOwner: boolean }) | null>({
    queryKey: ['myTeam', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, role, teams!inner(id, name, owner_id, invite_code)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const team = Array.isArray(data.teams) ? data.teams[0] : data.teams as Team
      return { ...team, isOwner: team.owner_id === userId }
    },
    staleTime: 30_000,
  })
}

function useTeamMembers(teamId?: string) {
  return useQuery<TeamMember[]>({
    queryKey: ['teamMembers', teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('user_id, role, profiles!inner(name, email, xp, streak)')
        .eq('team_id', teamId)
        .order('user_id')
      if (error) throw error
      return (data ?? []) as TeamMember[]
    },
    staleTime: 30_000,
  })
}

export default function Team() {
  usePageTitle('Team')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

  const { data: team, isLoading: teamLoading } = useMyTeam(user?.id)
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(team?.id)

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated')
      const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()
      const { data: newTeam, error: teamErr } = await supabase
        .from('teams')
        .insert({ name, owner_id: user.id, invite_code: inviteCode })
        .select('id')
        .single()
      if (teamErr) throw teamErr
      const { error: memberErr } = await supabase
        .from('team_members')
        .insert({ team_id: newTeam.id, user_id: user.id, role: 'owner' })
      if (memberErr) throw memberErr
      return newTeam
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeam'] })
      success('Team created!')
    },
    onError: () => error('Could not create team. Try again.'),
  })

  const joinTeam = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('Not authenticated')
      const { data: teamData, error: findErr } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', code.toUpperCase())
        .single()
      if (findErr || !teamData) throw new Error('Team not found. Check the code and try again.')
      const { error: joinErr } = await supabase
        .from('team_members')
        .insert({ team_id: teamData.id, user_id: user.id, role: 'member' })
      if (joinErr) throw joinErr
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeam'] })
      success('Joined team!')
    },
    onError: (e: Error) => error(e.message || 'Could not join team.'),
  })

  async function copyInviteCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (teamLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 mt-1">Learn together and track your team's progress.</p>
      </div>

      {!team ? (
        <>
          {/* Create team */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Create a team</h2>
            <p className="text-sm text-gray-500 mb-4">Start a team for your company or study group.</p>
            <div className="flex gap-2">
              <input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Team name…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => teamName.trim() && createTeam.mutate(teamName.trim())}
                disabled={!teamName.trim() || createTeam.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {createTeam.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </Card>

          {/* Join team */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Join a team</h2>
            <p className="text-sm text-gray-500 mb-4">Enter the 6-character invite code from your team owner.</p>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => joinCode.length === 6 && joinTeam.mutate(joinCode)}
                disabled={joinCode.length !== 6 || joinTeam.isPending}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {joinTeam.isPending ? 'Joining…' : 'Join'}
              </button>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Team header */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{team.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {team.isOwner ? 'You own this team' : 'Member'}
                </p>
              </div>
              <span className="text-3xl" aria-hidden="true">🏢</span>
            </div>
            {team.isOwner && (
              <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Invite code</p>
                  <p className="font-mono font-bold text-gray-900 tracking-widest">{team.invite_code}</p>
                </div>
                <button
                  onClick={() => copyInviteCode(team.invite_code)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {copiedCode ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
          </Card>

          {/* Members */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Members ({members.length})</h2>
            </div>
            {membersLoading ? (
              <Skeleton lines={3} />
            ) : members.length === 0 ? (
              <EmptyState icon="👥" title="No members yet" description="Share your invite code to add team members." />
            ) : (
              <div className="space-y-2">
                {members.map(m => {
                  const prof = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
                  return (
                    <div key={m.user_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                        {(prof?.name || prof?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{prof?.name || prof?.email || 'Member'}</p>
                        {m.role === 'owner' && (
                          <span className="text-xs text-green-600 font-medium">Owner</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 text-right">
                        <div>
                          <p className="text-sm font-bold text-green-600">{(prof?.xp ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">XP</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-orange-500">{prof?.streak ?? 0}🔥</p>
                          <p className="text-xs text-gray-400">Streak</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
