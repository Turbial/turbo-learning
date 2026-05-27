// data/useSubscription.ts — active subscription status / tier / expiry.
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type Subscription = { tier: 'free' | 'premium'; status: string; current_period_end: string | null };

export function useSubscription(userId?: string) {
  return useQuery<Subscription>({
    queryKey: ['subscription', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions').select('tier,status,current_period_end')
        .eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data ?? { tier: 'free', status: 'none', current_period_end: null };
    },
  });
}
export const useIsPremium = (userId?: string) => {
  const { data } = useSubscription(userId);
  return data?.tier === 'premium' && data?.status === 'active';
};
