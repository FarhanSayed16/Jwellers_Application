'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type CustomRequest = {
  id: string;
  customerId: string;
  description: string;
  referenceImageUrls: string[];
  budgetHint: string | null;
  status: string;
  createdAt: string;
};

export function CustomRequestsInbox() {
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState<CustomRequest[]>([]);
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const q = status ? `?status=${status}` : '';
      const data = await api.get<{ customRequests: CustomRequest[] }>(`/admin/custom-requests${q}`);
      setRows(data.customRequests);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function setReqStatus(id: string, next: string) {
    const res = await api.patch<{ customRequest: CustomRequest }>(`/admin/custom-requests/${id}`, {
      status: next,
    });
    setSelected(res.customRequest);
    await load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {['', 'new', 'in_progress', 'quoted', 'closed'].map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded px-3 py-1.5 text-sm ${status === s ? 'bg-[var(--color-primary)] text-white' : 'border border-[var(--color-border)]'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
        <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-[var(--color-background)]"
                onClick={() => setSelected(row)}
              >
                <p className="text-sm font-medium">{row.status}</p>
                <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{row.description}</p>
              </button>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No custom requests.</li>
          ) : null}
        </ul>
      </div>
      <aside className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        {selected ? (
          <div className="space-y-3 text-sm">
            <h3 className="font-display text-lg">Detail</h3>
            <p className="whitespace-pre-wrap">{selected.description}</p>
            {selected.budgetHint ? <p>Budget: {selected.budgetHint}</p> : null}
            <div className="flex flex-wrap gap-2">
              {selected.referenceImageUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                </a>
              ))}
            </div>
            <label className="block space-y-1">
              Status
              <select
                className="w-full rounded border border-[var(--color-border)] px-3 py-2"
                value={selected.status}
                onChange={(e) => void setReqStatus(selected.id, e.target.value)}
              >
                <option value="new">new</option>
                <option value="in_progress">in_progress</option>
                <option value="quoted">quoted</option>
                <option value="closed">closed</option>
              </select>
            </label>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">Select a request</p>
        )}
      </aside>
    </div>
  );
}
