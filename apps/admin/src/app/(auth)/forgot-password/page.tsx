'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setResetToken(null);
    setSubmitting(true);
    try {
      const data = await api.post<{ message: string; resetToken: string | null }>(
        '/auth/admin/password/forgot',
        { emailOrPhone: emailOrPhone.trim() },
        false,
      );
      setMessage(data.message);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <h1 className="font-display text-2xl text-[var(--color-primary)]">Forgot password</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Owner accounts can request a reset. In development the API may return a reset token
        directly.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm">Email or phone</span>
          <input
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--color-success)]">{message}</p> : null}
        {resetToken ? (
          <p className="break-all rounded bg-[var(--color-background)] p-3 text-xs text-[var(--color-text-secondary)]">
            Dev reset token:{' '}
            <Link
              className="text-[var(--color-primary)] underline"
              href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
            >
              Continue to reset
            </Link>
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2.5 text-sm text-white disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Request reset'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-[var(--color-primary)]">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
