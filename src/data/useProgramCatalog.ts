// data/useProgramCatalog.ts — all programs + this user's enrollment status.
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type CatalogItem = { id: string; slug: string; title: string; subtitle: string | null; enrolled: boolean; comingSoon?: boolean };

const COMING_SOON_SLUGS = new Set(['duo', 'ai-for-everyone']);

export function useProgramCatalog(userId?: string) {
  return useQuery<CatalogItem[]>({
    queryKey: ['program-catalog', userId],
    queryFn: async () => {
      const { data: programs, error } = await supabase.from('programs').select('id,slug,title,subtitle');
      if (error) throw error;
      let enrolledIds = new Set<string>();
      if (userId) {
        const { data: en } = await supabase.from('enrollments').select('program_id').eq('user_id', userId);
        enrolledIds = new Set((en ?? []).map(e => e.program_id));
      }
      return (programs ?? []).map(p => ({ ...p, enrolled: enrolledIds.has(p.id), comingSoon: COMING_SOON_SLUGS.has(p.slug) }));
    },
  });
}
