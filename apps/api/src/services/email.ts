import { env } from '../config/env';

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; provider: 'resend' | 'sendgrid'; id?: string }
  | { ok: false; reason: string };

function normalizeTo(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((s) => s.trim()).filter(Boolean);
}

async function sendViaResend(input: SendEmailInput, to: string[]): Promise<SendEmailResult> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'RESEND_API_KEY missing' };
  const from = env.EMAIL_FROM?.trim();
  if (!from) return { ok: false, reason: 'EMAIL_FROM missing' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<pre style="font-family:sans-serif">${escapeHtml(input.text)}</pre>`,
      reply_to: (input.replyTo ?? env.EMAIL_REPLY_TO) || undefined,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    return { ok: false, reason: `resend HTTP ${res.status}: ${body.message ?? 'error'}` };
  }
  return { ok: true, provider: 'resend', id: body.id };
}

async function sendViaSendgrid(input: SendEmailInput, to: string[]): Promise<SendEmailResult> {
  const apiKey = env.SENDGRID_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'SENDGRID_API_KEY missing' };

  const fromEmail = env.SENDGRID_FROM_EMAIL?.trim() || extractEmail(env.EMAIL_FROM);
  const fromName = env.SENDGRID_FROM_NAME?.trim() || 'Ratnaraj Jewellers';
  if (!fromEmail) return { ok: false, reason: 'SENDGRID_FROM_EMAIL / EMAIL_FROM missing' };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: to.map((email) => ({ email })) }],
      from: { email: fromEmail, name: fromName },
      reply_to: (input.replyTo ?? env.EMAIL_REPLY_TO)
        ? { email: input.replyTo ?? env.EMAIL_REPLY_TO }
        : undefined,
      subject: input.subject,
      content: [
        { type: 'text/plain', value: input.text },
        {
          type: 'text/html',
          value: input.html ?? `<pre style="font-family:sans-serif">${escapeHtml(input.text)}</pre>`,
        },
      ],
    }),
  });

  if (res.status === 202 || res.status === 200) {
    return { ok: true, provider: 'sendgrid' };
  }
  const text = await res.text().catch(() => '');
  return { ok: false, reason: `sendgrid HTTP ${res.status}: ${text.slice(0, 200)}` };
}

function extractEmail(from?: string): string | undefined {
  if (!from) return undefined;
  const m = from.match(/<([^>]+)>/);
  return (m?.[1] ?? from).trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Prefer Resend (verified domain), fall back to SendGrid.
 * Never throws — callers treat mail as best-effort.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = normalizeTo(input.to);
  if (to.length === 0) return { ok: false, reason: 'no recipients' };

  const provider = (env.MAIL_PROVIDER || 'resend').toLowerCase();
  const order: Array<'resend' | 'sendgrid'> =
    provider === 'sendgrid' ? ['sendgrid', 'resend'] : ['resend', 'sendgrid'];

  const errors: string[] = [];
  for (const p of order) {
    try {
      const result = p === 'resend' ? await sendViaResend(input, to) : await sendViaSendgrid(input, to);
      if (result.ok) return result;
      errors.push(result.reason);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  return { ok: false, reason: errors.join(' | ') || 'mail providers unavailable' };
}

export function resolveNotifyRecipients(shopEmail?: string | null): string[] {
  const configured = env.EMAIL_NOTIFY_TO?.trim();
  if (configured) {
    return configured.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (shopEmail && !shopEmail.endsWith('.local')) {
    return [shopEmail];
  }
  const reply = env.EMAIL_REPLY_TO?.trim();
  return reply ? [reply] : [];
}
