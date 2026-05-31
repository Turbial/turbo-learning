// integrations/paypal.ts — PayPal checkout + subscription management (client side).

import { Linking } from 'react-native';

const PAYPAL_CLIENT_ID =
  process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID ?? "";

// Load the PayPal SDK script dynamically (web only)
export function loadPayPalScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).paypal) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.head.appendChild(script);
  });
}

/**
 * Create a PayPal subscription. The plan ID should be set up in PayPal dashboard.
 * For now, we use a simple one-time checkout flow via the Supabase edge function.
 */
export async function startPayPalCheckout(planSlug: string): Promise<void> {
  // Redirect to Supabase edge function that creates a PayPal order
  const supabase = (await import("../data/supabase")).supabase;

  const { data, error } = await supabase.functions.invoke("paypal-checkout", {
    body: { plan_slug: planSlug },
  });

  if (error) throw new Error(error.message);
  if (!data?.url) throw new Error("No PayPal checkout URL returned");

  // Redirect to PayPal (web: window.location, native: Linking)
  if (typeof window !== "undefined") {
    window.location.href = data.url;
  } else {
    await Linking.openURL(data.url);
  }
}

/**
 * Check if PayPal is available (client ID configured).
 */
export function isPayPalAvailable(): boolean {
  return PAYPAL_CLIENT_ID.length > 0;
}
