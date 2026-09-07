'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/** Blocks staff from owner-only routes (branding / staff). */
export function OwnerGuard({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!admin) {
      router.replace('/login');
      return;
    }
    if (admin.role !== 'owner') {
      setBlocked(true);
      router.replace('/');
    }
  }, [admin, loading, router]);

  if (loading || !admin || admin.role !== 'owner') {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-secondary)]">
        {blocked ? 'Owner access required. Redirecting…' : 'Checking permissions…'}
      </div>
    );
  }

  return <>{children}</>;
}
