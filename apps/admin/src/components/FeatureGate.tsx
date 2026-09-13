'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

function DisabledModuleFallback({ flag }: { flag: string }) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm">
      <p className="font-medium">Module unavailable (403)</p>
      <p className="mt-1 text-[var(--color-text-secondary)]">
        Feature <code>{flag}</code> is disabled for this client, or you lack permission.
      </p>
      <Link href="/forbidden" className="mt-3 inline-block text-[var(--color-primary)] underline-offset-2 hover:underline">
        Why am I seeing this?
      </Link>
    </div>
  );
}

export function FeatureGate({
  flag,
  children,
  fallback,
}: {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { features } = useAuth();
  if (!features) return <>{fallback ?? <DisabledModuleFallback flag={flag} />}</>;
  const enabled = Boolean(features[flag]);
  if (!enabled) return <>{fallback ?? <DisabledModuleFallback flag={flag} />}</>;
  return <>{children}</>;
}

export function OwnerOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { admin } = useAuth();
  if (admin?.role !== 'owner') {
    return (
      <>
        {fallback ?? (
          <div className="rounded border border-[var(--color-border)] p-6 text-sm">
            Owner role required.{' '}
            <Link href="/forbidden" className="text-[var(--color-primary)] underline-offset-2 hover:underline">
              Details
            </Link>
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}
