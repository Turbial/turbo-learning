// data/useSubscription.ts — active subscription status / tier / expiry.
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export interface Subscription {
  tier: 'free' | 'premium';
  status: string;
  plan_id: string | null;
  plan_slug: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  paypal_subscription_id: string | null;
  current_period_end: string | null;
}

export function useSubscription(userId?: string) {
  return useQuery<Subscription>({
    queryKey: ['subscription', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status, plan_id, plan_slug, stripe_customer_id, stripe_subscription_id, paypal_subscription_id, current_period_end')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return (
        data ?? {
          tier: 'free',
          status: 'none',
          plan_id: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          paypal_subscription_id: null,
          current_period_end: null,
        }
      );
    },
  });
}

export const useIsPremium = (userId?: string) => {
  const { data } = useSubscription(userId);
  return data?.tier === 'premium' && data?.status === 'active';
};
