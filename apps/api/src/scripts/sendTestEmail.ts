/**
 * Sends one verification email via Resend (SendGrid fallback).
 * Usage: npx tsx src/scripts/sendTestEmail.ts
 */
import { env } from '../config/env';
import { sendEmail, resolveNotifyRecipients } from '../services/email';

async function main() {
  const to = resolveNotifyRecipients(env.EMAIL_NOTIFY_TO || env.EMAIL_REPLY_TO);
  if (to.length === 0) {
    console.error('[mail:test] no EMAIL_NOTIFY_TO / EMAIL_REPLY_TO');
    process.exit(1);
  }

  const result = await sendEmail({
    to,
    subject: `[${env.CLIENT_SLUG}] Jewellery API email check`,
    text: [
      `This is a connectivity test from the Ratnaraj Jewellers API.`,
      ``,
      `Client: ${env.CLIENT_SLUG}`,
      `Mail provider preference: ${env.MAIL_PROVIDER}`,
      `Time: ${new Date().toISOString()}`,
      ``,
      `If you received this, Resend/SendGrid delivery is working.`,
    ].join('\n'),
  });

  console.log(JSON.stringify({ to, result }, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error('[mail:test] failed', err instanceof Error ? err.message : err);
  process.exit(1);
});
