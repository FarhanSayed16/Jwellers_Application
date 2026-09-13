'use client';

import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background,#F7F5F0)] px-4 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary,#5A6B65)]">
        Maintenance
      </p>
      <h1 className="mt-2 text-3xl font-semibold">We’ll be back shortly</h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-text-secondary,#5A6B65)]">
        The admin site or API is in maintenance mode. Retry in a few minutes. If this persists,
        contact your implementation partner.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded bg-[var(--color-primary,#1F4B3F)] px-4 py-2 text-white"
        >
          Retry
        </button>
        <Link href="/legal/support" className="rounded border border-[var(--color-border,#D9D3C7)] px-4 py-2">
          Support
        </Link>
      </div>
    </div>
  );
}
