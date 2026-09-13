'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';

function ReferralsInner() {
  const [stats, setStats] = useState<{
    totalReferred: number;
    topReferrers: { phone: string; name: string | null; referrals: number; referralCode: string | null }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{
          totalReferred: number;
          topReferrers: {
            phone: string;
            name: string | null;
            referrals: number;
            referralCode: string | null;
          }[];
        }>('/admin/referrals/stats');
        setStats(data);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Failed to load');
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-[var(--color-error)]">{error}</p>;
  if (!stats) return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm">
        Total referred customers: <strong>{stats.totalReferred}</strong>
      </p>
      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
        {stats.topReferrers.map((r, i) => (
          <li key={i} className="px-4 py-3 text-sm">
            {r.name || r.phone} · code {r.referralCode || '—'} · {r.referrals} referral(s)
          </li>
        ))}
        {stats.topReferrers.length === 0 && (
          <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No referrals yet.</li>
        )}
      </ul>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <div>
      <PageHeader title="Referrals" description="Who brought new customers." />
      <FeatureGate
        flag="referrals"
        fallback={
          <EmptyState
            title="Referrals are off"
            description="Enable FEATURE_REFERRALS for this client."
          />
        }
      >
        <ReferralsInner />
      </FeatureGate>
    </div>
  );
}
