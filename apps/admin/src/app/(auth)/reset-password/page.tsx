'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

function ResetForm() {
  const search = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(search.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/admin/password/reset', { token: token.trim(), newPassword }, false);
      setOk(true);
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <h1 className="font-display text-2xl text-[var(--color-primary)]">Reset password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm">Reset token</span>
          <input
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm">New password (min 10)</span>
          <input
            type="password"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={10}
            required
          />
        </label>
        {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
        {ok ? <p className="text-sm text-[var(--color-success)]">Password updated. Redirecting…</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2.5 text-sm text-white disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Update password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm">Loading…</p>}>
      <ResetForm />
    </Suspense>
  );
}
