'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Board = {
  id: string;
  title: string;
  itemIds: string[];
  sortOrder: number;
  isActive: boolean;
};

export function BoardsAdmin() {
  const [rows, setRows] = useState<Board[]>([]);
  const [title, setTitle] = useState('Bridal picks');
  const [itemIds, setItemIds] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ boards: Board[] }>('/admin/boards');
      setRows(data.boards);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load boards');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setBusy(true);
    try {
      await api.post('/admin/boards', {
        title,
        itemIds: itemIds
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        sortOrder: rows.length,
        isActive: true,
      });
      setItemIds('');
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/admin/boards/${id}`);
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Delete failed');
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Curated Home rows. Paste item IDs (comma-separated) from the catalog.
      </p>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <div className="grid gap-3 rounded border border-[var(--color-border)] p-4 md:grid-cols-2">
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board title"
        />
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          value={itemIds}
          onChange={(e) => setItemIds(e.target.value)}
          placeholder="Item IDs"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-60 md:w-fit"
        >
          Add board
        </button>
      </div>
      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
        {rows.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-[var(--color-text-secondary)]">
                {b.itemIds.length} items · {b.isActive ? 'active' : 'hidden'}
              </p>
            </div>
            <button
              type="button"
              className="rounded border border-[var(--color-border)] px-3 py-1"
              onClick={() => void remove(b.id)}
            >
              Delete
            </button>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No boards yet.</li>
        )}
      </ul>
    </div>
  );
}
