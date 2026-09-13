'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Scheme = {
  id: string;
  title: string;
  description: string | null;
  makingPercentOverride: number | null;
  startAt: string;
  endAt: string;
  isActive: boolean;
};

export function SchemesAdmin() {
  const [rows, setRows] = useState<Scheme[]>([]);
  const [title, setTitle] = useState('Festival making offer');
  const [making, setMaking] = useState('8');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ schemes: Scheme[] }>('/admin/schemes');
      setRows(data.schemes);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load schemes');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    try {
      const startAt = new Date().toISOString();
      const endAt = new Date(Date.now() + 30 * 86400000).toISOString();
      await api.post('/admin/schemes', {
        title,
        makingPercentOverride: Number(making),
        startAt,
        endAt,
        isActive: true,
      });
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Create failed');
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-24 rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          value={making}
          onChange={(e) => setMaking(e.target.value)}
          placeholder="Making %"
        />
        <button
          type="button"
          onClick={() => void create()}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
        >
          Add scheme (30 days)
        </button>
      </div>
      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
        {rows.map((s) => (
          <li key={s.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{s.title}</p>
            <p className="text-[var(--color-text-secondary)]">
              Making {s.makingPercentOverride ?? '—'}% · {s.isActive ? 'active' : 'off'} · until{' '}
              {new Date(s.endAt).toLocaleDateString()}
            </p>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No schemes yet.</li>
        )}
      </ul>
    </div>
  );
}
