// integrations/email.ts — transactional email (onboarding drip, receipts, streak alerts).
// Thin client → an edge function / your email provider. Set the provider key server-side.
import { supabase } from '../data/supabase';

export type EmailTemplate = 'welcome' | 'payment_receipt' | 'streak_at_risk' | 'password_reset';

export async function sendEmail(template: EmailTemplate, to: string, data?: Record<string, unknown>) {
  const { error } = await supabase.functions.invoke('send-email', { body: { template, to, data } });
  if (error) throw error;
}
