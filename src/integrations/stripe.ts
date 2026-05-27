// integrations/stripe.ts — checkout + subscription management (client side).
// Checkout sessions are created server-side by the create-checkout edge fn so
// the secret key never ships to the client. Set EXPO_PUBLIC_API_URL.
import { Linking } from 'react-native';
import { supabase } from '../data/supabase';

export async function startCheckout(plan: 'monthly' | 'annual') {
  const { data, error } = await supabase.functions.invoke('create-checkout', { body: { plan } });
  if (error) throw error;
  const url = (data as { url?: string })?.url;
  if (url) await Linking.openURL(url); // hosted Stripe Checkout
  return url;
}
export async function cancelSubscription() {
  const { error } = await supabase.functions.invoke('cancel-subscription');
  if (error) throw error;
}
