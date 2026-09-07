'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(emailOrPhone.trim(), password);
      const next = search.get('next') || '/';
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'ACCOUNT_LOCKED') {
          setError('Account temporarily locked. Try again later.');
        } else {
          setError(err.message || 'Invalid email/phone or password');
        }
      } else {
        setError('Unable to sign in. Check that the API is running.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
        Demo Jewellers
      </p>
      <h1 className="font-display mt-2 text-3xl text-[var(--color-primary)]">Retailer Admin</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Sign in with your owner or staff account.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--color-text-primary)]">Email or phone</span>
          <input
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--color-text-primary)]">Password</span>
          <input
            type="password"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <p className="rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
        <Link href="/forgot-password" className="text-[var(--color-primary)] underline-offset-2 hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-[var(--color-text-secondary)]">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
