// integrations/stripe.ts — checkout + subscription management (client side).
// Checkout sessions are created server-side by the create-checkout edge fn so
// the secret key never ships to the client.
import { Linking } from 'react-native';
import { supabase } from '../data/supabase';

/**
 * Start a Stripe Checkout session for the given plan.
 * @param planId - the plan ID from the plans table (e.g. 'premium_monthly', 'premium_annual')
 * @returns the Stripe Checkout URL
 */
export async function startCheckout(planId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { plan_id: planId },
  });

  if (error) throw error;

  const url = (data as { url?: string })?.url;
  if (!url) throw new Error('No checkout URL returned');

  // Open Stripe Checkout in browser (handles both native and web)
  await Linking.openURL(url);

  return url;
}

/**
 * Cancel the user's active subscription via the cancel-subscription edge function.
 */
export async function cancelSubscription(): Promise<void> {
  const { error } = await supabase.functions.invoke('cancel-subscription');
  if (error) throw error;
}
