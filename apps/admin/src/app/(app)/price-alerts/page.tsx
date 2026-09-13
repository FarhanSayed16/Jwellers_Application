'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';

function AlertsInner() {
  const [rows, setRows] = useState<
    {
      id: string;
      purity: string;
      belowAmount: number;
      status: string;
      triggeredRate: number | null;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{
          alerts: {
            id: string;
            purity: string;
            belowAmount: number;
            status: string;
            triggeredRate: number | null;
          }[];
        }>('/admin/price-alerts');
        setRows(data.alerts);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Failed to load');
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-[var(--color-error)]">{error}</p>;

  return (
    <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
      {rows.map((a) => (
        <li key={a.id} className="px-4 py-3 text-sm">
          {a.purity} below ₹{a.belowAmount} · <strong>{a.status}</strong>
          {a.triggeredRate != null ? ` @ ₹${a.triggeredRate}` : ''}
        </li>
      ))}
      {rows.length === 0 && (
        <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No price alerts yet.</li>
      )}
    </ul>
  );
}

export default function PriceAlertsPage() {
  return (
    <div>
      <PageHeader title="Price alerts" description="Customer thresholds that fire when rates drop." />
      <FeatureGate
        flag="priceAlerts"
        fallback={
          <EmptyState
            title="Price alerts are off"
            description="Enable FEATURE_PRICE_ALERTS for this client."
          />
        }
      >
        <AlertsInner />
      </FeatureGate>
    </div>
  );
}
