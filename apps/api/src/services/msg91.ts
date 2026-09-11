import { env, isProd } from '../config/env';
import { AppError } from '../utils/errors';

/**
 * Send OTP SMS via MSG91 Flow/template API.
 * Non-production without keys: skip send (caller may return devOtp).
 * Production without keys: fail closed.
 */
export async function sendOtpSms(phoneE164: string, otp: string): Promise<'sent' | 'skipped'> {
  const authKey = env.MSG91_AUTH_KEY?.trim();
  const templateId = env.MSG91_TEMPLATE_ID?.trim();

  if (!authKey || !templateId) {
    if (isProd) {
      throw new AppError(
        503,
        'SMS_NOT_CONFIGURED',
        'OTP SMS provider is not configured for this environment',
      );
    }
    return 'skipped';
  }

  // MSG91 expects 10-digit mobile for many templates; strip +91
  const mobile = phoneE164.replace(/^\+91/, '');

  const res = await globalThis.fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: authKey,
    },
    body: JSON.stringify({
      template_id: templateId,
      short_url: '0',
      recipients: [
        {
          mobiles: `91${mobile}`,
          // Common MSG91 template var names — client templates may differ
          otp,
          VAR1: otp,
        },
      ],
      sender: env.MSG91_SENDER_ID || undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AppError(502, 'SMS_SEND_FAILED', 'Failed to send OTP SMS', {
      status: res.status,
      // never include otp or full provider body with secrets
      providerHint: text.slice(0, 120),
    });
  }

  return 'sent';
}
