'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin error boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background,#F7F5F0)] px-4 text-center text-[var(--color-text-primary,#14201C)]">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary,#5A6B65)]">
        500
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-text-secondary,#5A6B65)]">
        The admin page failed to render. Try again, or go back to the dashboard.
        {error.digest ? (
          <>
            <br />
            <span className="font-mono text-xs">Ref: {error.digest}</span>
          </>
        ) : null}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-[var(--color-primary,#1F4B3F)] px-4 py-2 text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded border border-[var(--color-border,#D9D3C7)] px-4 py-2">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
