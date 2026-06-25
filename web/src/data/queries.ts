import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// ─── Types ───
export interface UserProfile {
  id: string
  name?: string
  email?: string
  goal?: string
  daily_mins?: number
  learn_time?: string
  onboarded?: boolean
  streak: number
  shield_count?: number
  xp: number
  level: number
}

export interface Unit {
  id: string
  program_id: string
  order_num: number
  title: string
  emoji?: string
  goal?: string
  week?: number
}

export interface Program {
  id: string
  slug: string
  title: string
  emoji?: string
  description?: string
}

// ─── Profile ───
export function useProfile() {
  return useQuery<UserProfile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') return null
      if (error) throw error
      return data as UserProfile
    },
    staleTime: 60_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

// ─── Program ───
export function useProgram(slug: string) {
  return useQuery<Program>({
    queryKey: ['program', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data as Program
    },
    staleTime: 10 * 60_000,
    enabled: !!slug,
  })
}

export function useActiveProgramSlug() {
  return useQuery<string | null>({
    queryKey: ['activeProgramSlug'],
    queryFn: async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      if (!u) return null
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('program_id, programs!inner(slug)')
        .eq('user_id', u.id)
        .limit(1)
        .single()
      const row = enrollment as { programs?: { slug: string } } | null
      return row?.programs?.slug ?? null
    },
    staleTime: 10 * 60_000,
  })
}

// ─── Units ───
export function useUnits(programId: string | undefined) {
  return useQuery<Unit[]>({
    queryKey: ['units', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('program_id', programId)
        .order('order_num', { ascending: true })
      if (error) throw error
      return (data ?? []) as Unit[]
    },
    enabled: !!programId,
    staleTime: 10 * 60_000,
  })
}

// ─── Unit by ID ───
export function useUnit(unitId: string | undefined) {
  return useQuery<Unit>({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .single()
      if (error) throw error
      return data as Unit
    },
    enabled: !!unitId,
    staleTime: 10 * 60_000,
  })
}

// ─── Lesson progress map ───
export function useLessonProgressMap(userId: string | undefined) {
  return useQuery<Set<string>>({
    queryKey: ['lessonProgressMap', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, lessons(unit_id)')
        .eq('user_id', userId)
      if (error) throw error
      const map = new Set<string>()
      ;(data ?? []).forEach((row: any) => {
        const lessons = Array.isArray(row.lessons) ? row.lessons[0] : row.lessons
        if (lessons?.unit_id) map.add(lessons.unit_id)
      })
      return map
    },
    enabled: !!userId,
  })
}

// ─── Complete lesson ───
export function useCompleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      unitId,
      xpEarned = 50,
      score = 100,
    }: {
      unitId: string
      xpEarned?: number
      score?: number
    }) => {
      const { data, error } = await supabase.rpc('complete_lesson', {
        p_unit_id: unitId,
        p_xp_earned: xpEarned,
        p_score: score,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['lessonProgressMap'] })
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })
}

// ─── Badges ───
export function useBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ['badges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, badges(*)')
        .eq('user_id', userId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useAllBadges() {
  return useQuery({
    queryKey: ['all-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('slug, name, icon, unlock_condition')
      if (error) throw error
      return (data ?? []) as Array<{
        slug: string
        name: string
        icon: string | null
        unlock_condition: string | null
      }>
    },
    staleTime: 10 * 60_000,
  })
}

// ─── Payment history ───
export function usePaymentHistory(userId?: string) {
  return useQuery({
    queryKey: ['payment-history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history')
        .select('id, amount_cents, currency, status, stripe_payment_intent, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as Array<{
        id: string
        amount_cents: number
        currency: string
        status: string
        stripe_payment_intent: string | null
        created_at: string
      }>
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  })
}

// ─── Portfolio responses ───
export function usePortfolioResponses(userId?: string) {
  return useQuery({
    queryKey: ['portfolio', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('step_responses')
        .select('id, step_id, lesson_id, response, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return (data ?? []) as Array<{
        id: string
        step_id: string
        lesson_id: string | null
        response: unknown
        created_at: string
      }>
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  })
}

// ─── All programs ───
export function useAllPrograms() {
  return useQuery<Program[]>({
    queryKey: ['all-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, slug, title, emoji, description')
        .order('id', { ascending: true })
      if (error) throw error
      return (data ?? []) as Program[]
    },
    staleTime: 10 * 60_000,
  })
}

// ─── Enroll in program ───
export function useEnrollInProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (programId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      // Upsert — one enrollment per user; replace if switching
      const { error } = await supabase
        .from('enrollments')
        .upsert({ user_id: user.id, program_id: programId }, { onConflict: 'user_id' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeProgramSlug'] })
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

// ─── Lesson notes ───
export function useLessonNotes(userId?: string, unitId?: string) {
  return useQuery({
    queryKey: ['lessonNotes', userId, unitId ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('lesson_notes')
        .select('id, unit_id, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (unitId) q = q.eq('unit_id', unitId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Array<{ id: string; unit_id: string | null; content: string; created_at: string }>
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

// ─── Save note ───
export function useSaveNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ unitId, content }: { unitId?: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('lesson_notes')
        .insert({ user_id: user.id, unit_id: unitId ?? null, content })
      if (error) throw error
    },
    onSuccess: (_, { unitId: _unitId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessonNotes'] })
    },
  })
}

// ─── Delete note ───
export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('lesson_notes').delete().eq('id', noteId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonNotes'] })
    },
  })
}
