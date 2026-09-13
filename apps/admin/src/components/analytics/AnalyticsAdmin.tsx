'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Summary = {
  windowDays: number;
  events: Record<string, number>;
  pulse: { wishlistTotal: number; enquiryOpen: number };
};

type MostViewed = {
  source: string;
  items: { itemId: string; sku: string; title: string; views: number }[];
};

export function AnalyticsAdmin() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [most, setMost] = useState<MostViewed | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, m] = await Promise.all([
          api.get<{ summary: Summary }>('/admin/analytics/summary'),
          api.get<MostViewed>('/admin/analytics/most-viewed?limit=10'),
        ]);
        setSummary(s.summary);
        setMost(m);
        setError(null);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Failed to load analytics');
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-[var(--color-error)]">{error}</p>;
  if (!summary || !most) {
    return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;
  }

  const maxViews = Math.max(1, ...most.items.map((i) => i.views));

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Last {summary.windowDays} days · source for ranking: {most.source}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary.events).map(([k, v]) => (
          <div key={k} className="rounded border border-[var(--color-border)] p-4">
            <p className="text-xs uppercase text-[var(--color-text-secondary)]">{k.replace('_', ' ')}</p>
            <p className="mt-1 text-2xl font-medium">{v}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-3 font-display text-lg">Most viewed items</h3>
        <ul className="space-y-2">
          {most.items.map((item) => (
            <li key={item.itemId} className="text-sm">
              <div className="mb-1 flex justify-between gap-2">
                <span>
                  {item.title} <span className="text-[var(--color-text-secondary)]">({item.sku})</span>
                </span>
                <span className="font-medium">{item.views}</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-[var(--color-background)]">
                <div
                  className="h-full bg-[var(--color-primary)]"
                  style={{ width: `${(item.views / maxViews) * 100}%` }}
                />
              </div>
            </li>
          ))}
          {most.items.length === 0 && (
            <li className="text-[var(--color-text-secondary)]">No views yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
