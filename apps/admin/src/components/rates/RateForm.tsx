'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import type { RatePoint } from '@/lib/catalogTypes';
import type { RateLatest } from '@/lib/types';
import { EmptyState } from '@/components/PageHeader';

function pctChange(prev: number, next: number) {
  if (prev === 0) return next === 0 ? 0 : 100;
  return Math.abs((next - prev) / prev) * 100;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
}

export function RateForm() {
  const [latest, setLatest] = useState<RatePoint | null>(null);
  const [history, setHistory] = useState<RatePoint[]>([]);
  const [gold24k, setGold24k] = useState('');
  const [gold22k, setGold22k] = useState('');
  const [gold18k, setGold18k] = useState('');
  const [silver, setSilver] = useState('');
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmForce, setConfirmForce] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [latestRes, histRes] = await Promise.all([
        api.get<RateLatest>('/rates/latest', false),
        api.get<{ points: RatePoint[] }>('/rates/history?limit=30', false),
      ]);
      setLatest(latestRes.rate as RatePoint | null);
      setHistory([...histRes.points].reverse()); // newest first for table
      if (latestRes.rate) {
        setGold24k(String(latestRes.rate.gold24kPerGram));
        setGold22k(String(latestRes.rate.gold22kPerGram));
        setGold18k(String(latestRes.rate.gold18kPerGram));
        setSilver(String(latestRes.rate.silverPerGram));
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const parsed = useMemo(() => {
    const n = (s: string) => Number(s);
    return {
      gold24kPerGram: n(gold24k),
      gold22kPerGram: n(gold22k),
      gold18kPerGram: n(gold18k),
      silverPerGram: n(silver),
    };
  }, [gold24k, gold22k, gold18k, silver]);

  const largeLocal = useMemo(() => {
    if (!latest) return false;
    return (
      pctChange(latest.gold24kPerGram, parsed.gold24kPerGram) >= 5 ||
      pctChange(latest.gold22kPerGram, parsed.gold22kPerGram) >= 5 ||
      pctChange(latest.gold18kPerGram, parsed.gold18kPerGram) >= 5 ||
      pctChange(latest.silverPerGram, parsed.silverPerGram) >= 5
    );
  }, [latest, parsed]);

  async function save(force: boolean) {
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const values = Object.values(parsed);
      if (values.some((v) => !Number.isFinite(v) || v <= 0)) {
        throw new Error('All rates must be numbers greater than 0');
      }
      await api.post('/rates', {
        ...parsed,
        note: note.trim() || undefined,
        force: force || undefined,
      });
      if (notify) {
        const notifyRes = await api.post<{
          notify: { attempted: number; successCount: number; configured: boolean; dryRun?: boolean };
        }>('/rates/notify', {});
        const n = notifyRes.notify;
        setToast(
          n.configured
            ? `Rates saved. Push sent to ${n.attempted} device(s) (${n.successCount} accepted).`
            : 'Rates saved. Push skipped — FCM is not configured on the API.',
        );
      } else {
        setToast('Rates saved successfully.');
      }
      setConfirmForce(false);
      setNote('');
      await load();
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'LARGE_RATE_CHANGE') {
        setConfirmForce(true);
        setError('One or more rates changed by ≥5%. Confirm to force-save.');
      } else {
        setError(err instanceof ApiClientError ? err.message : err instanceof Error ? err.message : 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (largeLocal && !confirmForce) {
      setConfirmForce(true);
      setError('Large change detected (≥5% vs latest). Confirm below to save.');
      return;
    }
    void save(confirmForce || largeLocal);
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-secondary)]">Loading rates…</p>;
  }

  return (
    <div className="space-y-8">
      {toast ? (
        <p className="rounded-[var(--radius-sm)] bg-green-50 px-3 py-2 text-sm text-[var(--color-success)]">
          {toast}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <h2 className="font-display text-xl">Set today’s rate</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Values are ₹ per gram. Saving appends a new snapshot (history preserved).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['24K gold', gold24k, setGold24k],
            ['22K gold', gold22k, setGold22k],
            ['18K gold', gold18k, setGold18k],
            ['Silver', silver, setSilver],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="block space-y-1.5">
              <span className="text-sm">{label as string}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
                value={value as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              />
            </label>
          ))}
        </div>
        <label className="mt-4 block space-y-1.5">
          <span className="text-sm">Note (optional)</span>
          <input
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          Notify customers (push)
        </label>

        {confirmForce ? (
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-warning)] bg-orange-50 p-3 text-sm">
            <p className="text-[var(--color-warning)]">Confirm large rate change before saving.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-white disabled:opacity-60"
                onClick={() => void save(true)}
              >
                {saving ? 'Saving…' : 'Force save'}
              </button>
              <button
                type="button"
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-2"
                onClick={() => {
                  setConfirmForce(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2.5 text-sm text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save rates'}
          </button>
        )}
      </form>

      {latest ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Current latest: {formatMoney(latest.gold22kPerGram)} /g 22K · effective{' '}
          {new Date(latest.effectiveAt).toLocaleString('en-IN')}
        </p>
      ) : (
        <EmptyState title="No rates yet" description="Save your first rate snapshot above." />
      )}

      <section>
        <h2 className="mb-3 font-display text-xl">History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">No history points.</p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-3 py-2">Effective</th>
                  <th className="px-3 py-2">24K</th>
                  <th className="px-3 py-2">22K</th>
                  <th className="px-3 py-2">18K</th>
                  <th className="px-3 py-2">Silver</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(row.effectiveAt).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2">{formatMoney(row.gold24kPerGram)}</td>
                    <td className="px-3 py-2">{formatMoney(row.gold22kPerGram)}</td>
                    <td className="px-3 py-2">{formatMoney(row.gold18kPerGram)}</td>
                    <td className="px-3 py-2">{formatMoney(row.silverPerGram)}</td>
                    <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
