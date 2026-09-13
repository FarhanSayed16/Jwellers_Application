'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { api, ApiClientError } from '@/lib/api';
import type { Category, Item } from '@/lib/catalogTypes';
import { CsvImportPanel } from '@/components/catalog/CsvImportPanel';

export default function ItemsListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      if (categoryId) params.set('categoryId', categoryId);
      if (includeDeleted) params.set('includeDeleted', 'true');
      params.set('limit', '50');
      const [list, cats] = await Promise.all([
        api.get<{ items: Item[]; total: number }>(`/admin/items?${params}`),
        api.get<{ categories: Category[] }>('/categories?includeInactive=true', false),
      ]);
      setItems(list.items);
      setCategories((cats.categories || []).filter((c) => !c.parentId));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function restore(id: string) {
    await api.post(`/items/${id}/restore`);
    await load();
  }

  async function softDelete(id: string) {
    if (!confirm('Archive / soft-delete this item? It will leave the public catalog.')) return;
    await api.delete(`/items/${id}`);
    await load();
  }

  async function cloneItem(id: string) {
    try {
      const data = await api.post<{ item: Item }>(`/items/${id}/clone`, {});
      window.location.href = `/catalog/items/${data.item.id}`;
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Clone failed');
    }
  }

  return (
    <div>
      <PageHeader
        title="Items"
        description="Filter, edit, archive, and restore catalog pieces."
        action={
          <Link
            href="/catalog/items/new"
            className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
          >
            Add item
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Search title / SKU"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="sold">sold</option>
          <option value="archived">archived</option>
        </select>
        <select
          className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />
          Include deleted
        </label>
        <button type="button" onClick={() => void load()} className="rounded border px-3 py-2 text-sm">
          Apply
        </button>
      </div>

      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

      <div className="mb-6">
        <CsvImportPanel />
      </div>

      {loading ? <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-3 py-2">Thumb</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Purity</th>
                <th className="px-3 py-2">Weight</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const thumb = item.images.find((i) => i.isPrimary)?.url || item.images[0]?.url;
                return (
                  <tr key={item.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-2">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={`${item.title} (${item.sku})`}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{item.sku}</td>
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2">{item.purity}</td>
                    <td className="px-3 py-2">{item.netWeightGrams ?? '—'}</td>
                    <td className="px-3 py-2">{item.status}{item.deletedAt ? ' (deleted)' : ''}</td>
                    <td className="px-3 py-2 text-xs">
                      {item.isFeatured ? 'featured ' : ''}
                      {item.isNewArrival ? 'new' : ''}
                    </td>
                    <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                      <Link href={`/catalog/items/${item.id}`} className="text-[var(--color-primary)]">
                        Edit
                      </Link>
                      {!item.deletedAt ? (
                        <button
                          type="button"
                          className="text-[var(--color-primary)]"
                          onClick={() => void cloneItem(item.id)}
                        >
                          Clone
                        </button>
                      ) : null}
                      {item.deletedAt ? (
                        <button type="button" className="text-[var(--color-success)]" onClick={() => void restore(item.id)}>
                          Restore
                        </button>
                      ) : (
                        <button type="button" className="text-[var(--color-error)]" onClick={() => void softDelete(item.id)}>
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-medium">No search results</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                No items match these filters. Clear search or change status/category, then Apply.
              </p>
              <button
                type="button"
                className="mt-3 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                onClick={() => {
                  setQ('');
                  setStatus('');
                  setCategoryId('');
                  setIncludeDeleted(false);
                  void load();
                }}
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
