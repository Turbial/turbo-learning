/**
 * Turbo Learning — Stripe Integration
 * Uses @turbial/payments patterns via Supabase Edge Functions.
 *
 * Architecture: Client → Supabase Edge Function → Stripe API
 * The secret key never ships to the client.
 *
 * Edge Functions:
 *   - create-checkout  (from @turbial/payments/deno/create-checkout)
 *   - stripe-webhook   (from @turbial/payments/deno/stripe-webhook)
 *
 * See: shared-tools/integrations/payment/ for the reusable library.
 */

import { Linking } from 'react-native';
import { supabase } from '../data/supabase';

/**
 * Start a Stripe Checkout session for the given plan.
 * Calls the create-checkout edge function, then opens the Stripe Checkout URL.
 *
 * @param planId - plan slug (e.g. 'premium_monthly', 'premium_annual')
 * @param testMode - if true, uses test cards and $1 charges
 * @returns the Stripe Checkout URL
 */
export async function startCheckout(
  planId: string,
  testMode = false,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { plan_id: planId, test_mode: testMode },
  });

  if (error) throw error;

  const url: string | undefined = (data as { url?: string })?.url;
  if (!url) throw new Error('No checkout URL returned from edge function');

  // Open Stripe Checkout (handles both native and web)
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    throw new Error('Could not open payment page');
  }

  return url;
}

/**
 * Cancel the user's active subscription.
 */
export async function cancelSubscription(): Promise<void> {
  const { error } = await supabase.functions.invoke('cancel-subscription');
  if (error) throw error;
}

/**
 * Open the Stripe Customer Portal for managing payment methods and billing.
 */
export async function openCustomerPortal(): Promise<string> {
  const { data, error } = await supabase.functions.invoke(
    'create-portal-session',
  );

  if (error) throw error;

  const url: string | undefined = (data as { url?: string })?.url;
  if (!url) throw new Error('No portal URL returned');

  await Linking.openURL(url);
  return url;
}
