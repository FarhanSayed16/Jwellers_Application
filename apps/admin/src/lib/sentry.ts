/**
 * Optional Sentry for admin (Next.js).
 * Set NEXT_PUBLIC_SENTRY_DSN to enable; empty = console-only no-op.
 * Full @sentry/nextjs wizard can replace this later — see docs/phase24/SENTRY.md
 */
export function initAdminSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) return;
  // Placeholder until @sentry/nextjs is wired with the project DSN.
  if (typeof window !== 'undefined') {
    console.info('[admin] Sentry DSN configured — install @sentry/nextjs to activate (see docs/phase24/SENTRY.md)');
  }
}

export function captureAdminException(err: unknown, context?: Record<string, unknown>) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[admin]', err, context);
    }
    return;
  }
  console.error('[admin][sentry-pending]', err, context);
}
