'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Coins, Gem, MessageSquare, Plus } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/PageHeader';
import { api, ApiClientError } from '@/lib/api';
import type { DashboardStats, RateLatest } from '@/lib/types';

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rate, setRate] = useState<RateLatest['rate'] | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [dash, latest] = await Promise.all([
          api.get<DashboardStats>('/admin/dashboard'),
          api.get<RateLatest>('/rates/latest', false),
        ]);
        if (cancelled) return;
        setStats(dash);
        setRate(latest.rate);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Today’s rates, store pulse, and quick actions."
      />

      {error ? (
        <EmptyState
          title="Couldn’t load dashboard"
          description={error}
          action={
            <button
              type="button"
              className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          }
        />
      ) : null}

      {!error && loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : null}

      {!error && !loading ? (
        <div className="space-y-6">
          {/* Rates card */}
          {rate ? (
            <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl text-[var(--color-text-primary)]">
                    Today’s rates
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Effective {new Date(rate.effectiveAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <Link
                  href="/rates"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-primary)]"
                >
                  <Coins size={16} />
                  Update rates
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ['24K', rate.gold24kPerGram],
                  ['22K', rate.gold22kPerGram],
                  ['18K', rate.gold18kPerGram],
                  ['Silver', rate.silverPerGram],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="rounded-[var(--radius-sm)] bg-[var(--color-background)] px-3 py-3"
                  >
                    <p className="text-xs text-[var(--color-text-secondary)]">{label}/g</p>
                    <p className="mt-1 text-lg font-medium text-[var(--color-text-primary)]">
                      {formatMoney(value as number)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState
              title="No rates set yet"
              description="Publish today’s gold and silver rates so the app calculator and home screen stay accurate."
              action={
                <Link
                  href="/rates"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
                >
                  <Coins size={16} />
                  Set today’s rate
                </Link>
              }
            />
          )}

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Active items', value: stats?.items.active ?? 0, href: '/catalog' },
              { label: 'Open enquiries', value: stats?.enquiries.open ?? 0, href: '/enquiries' },
              { label: 'Open chats', value: stats?.chats.open ?? 0, href: '/chat' },
              { label: 'Categories', value: stats?.categories.total ?? 0, href: '/catalog' },
            ].map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)]"
              >
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                <p className="mt-2 font-display text-3xl text-[var(--color-text-primary)]">
                  {card.value}
                </p>
              </Link>
            ))}
          </section>

          {/* Needs attention */}
          {(stats?.enquiries.open ?? 0) > 0 || (stats?.chats.open ?? 0) > 0 ? (
            <section className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/40 bg-[var(--color-surface)] p-5">
              <h2 className="font-display text-lg">Needs attention</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
                {(stats?.enquiries.open ?? 0) > 0 ? (
                  <li>
                    <Link href="/enquiries" className="text-[var(--color-primary)] hover:underline">
                      {stats!.enquiries.open} open enquir{stats!.enquiries.open === 1 ? 'y' : 'ies'}
                    </Link>
                  </li>
                ) : null}
                {(stats?.chats.open ?? 0) > 0 ? (
                  <li>
                    <Link href="/chat" className="text-[var(--color-primary)] hover:underline">
                      {stats!.chats.open} open chat thread{stats!.chats.open === 1 ? '' : 's'}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}

          {/* Quick actions */}
          <section>
            <h2 className="mb-3 font-display text-lg">Quick actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/rates"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
              >
                <Coins size={16} />
                Set today’s rate
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
              >
                <Plus size={16} />
                Add item
              </Link>
              <Link
                href="/enquiries"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
              >
                <MessageSquare size={16} />
                Enquiries
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
              >
                <Gem size={16} />
                Catalog
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
