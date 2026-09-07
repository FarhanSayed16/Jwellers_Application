'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { features } = useAuth();
  if (!features) return <>{fallback}</>;
  const enabled = Boolean(features[flag]);
  if (!enabled) return <>{fallback}</>;
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
  if (admin?.role !== 'owner') return <>{fallback}</>;
  return <>{children}</>;
}
