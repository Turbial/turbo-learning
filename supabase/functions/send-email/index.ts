// supabase/functions/send-email — transactional email via Resend
// Body: { template: string, to: string, data: Record<string, string> }
// Templates: welcome, payment_receipt, streak_at_risk, password_reset

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "noreply@turbolearning.app";
const FROM_NAME = "Turbo Learning";

interface EmailRequest {
  template: "welcome" | "payment_receipt" | "streak_at_risk" | "password_reset";
  to: string;
  data: Record<string, string>;
}

function buildEmail(template: EmailRequest["template"], data: Record<string, string>): { subject: string; html: string } {
  switch (template) {
    case "welcome":
      return {
        subject: "Welcome to Turbo Learning 🚀",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>Welcome, ${data.name ?? "there"}!</h2>
            <p>You're now part of Turbo Learning. Your AI skills journey starts today.</p>
            <p>Complete Day 1 to earn your first badge and start your streak.</p>
            <a href="https://turbolearning.app" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">Start learning →</a>
            <p style="color:#6b7280;font-size:13px;margin-top:24px">You're receiving this because you signed up for Turbo Learning.</p>
          </div>
        `,
      };

    case "payment_receipt":
      return {
        subject: "Your Turbo Learning receipt",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>Receipt confirmed ✅</h2>
            <p>Thank you for subscribing to <strong>${data.plan ?? "Turbo Learning Pro"}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Plan</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${data.plan ?? "Pro"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Amount</td><td style="padding:8px 0;font-weight:600">${data.amount ?? ""}</td></tr>
            </table>
            <p>Your subscription is now active. Happy learning!</p>
            <p style="color:#6b7280;font-size:13px">Need help? Reply to this email.</p>
          </div>
        `,
      };

    case "streak_at_risk":
      return {
        subject: `${data.name ?? "Hey"}, your ${data.streakDays ?? ""}-day streak is at risk 🔥`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>Don't lose your streak!</h2>
            <p>Hi ${data.name ?? "there"}, your <strong>${data.streakDays ?? ""}-day streak</strong> expires tonight. Complete today's lesson to keep it going.</p>
            <a href="https://turbolearning.app" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">Continue learning →</a>
            <p style="color:#6b7280;font-size:13px;margin-top:24px">You can manage notification preferences in your profile settings.</p>
          </div>
        `,
      };

    case "password_reset":
      return {
        subject: "Reset your Turbo Learning password",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>Reset your password</h2>
            <p>Click the link below to reset your Turbo Learning password. This link expires in 1 hour.</p>
            <a href="${data.resetUrl ?? "#"}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">Reset password →</a>
            <p style="color:#6b7280;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      };

    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body: EmailRequest = await req.json();
    const { template, to, data } = body;

    if (!template || !to) {
      return new Response(JSON.stringify({ error: "template and to are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { subject, html } = buildEmail(template, data ?? {});

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — email not sent");
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no_api_key" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error ${res.status}: ${err}`);
    }

    const result = await res.json();
    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
