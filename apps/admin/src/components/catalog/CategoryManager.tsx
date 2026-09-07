'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { isMediaConfiguredError, uploadAdminImage } from '@/lib/upload';
import type { Category } from '@/lib/catalogTypes';
import { EmptyState } from '@/components/PageHeader';

export function CategoryManager() {
  const [tree, setTree] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ tree: Category[] }>('/categories?tree=true&includeInactive=true', false);
      setTree(data.tree || []);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const roots = tree;

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/categories', {
        name: name.trim(),
        parentId: parentId || null,
        coverImageUrl: coverUrl.trim() || undefined,
      });
      setName('');
      setParentId('');
      setCoverUrl('');
      setToast('Category created');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    }
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.patch(`/categories/${editing.id}`, {
        name: editing.name,
        coverImageUrl: editing.coverImageUrl,
        isActive: editing.isActive,
        sortOrder: editing.sortOrder,
      });
      setEditing(null);
      setToast('Category updated');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Soft-delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setToast('Category deleted');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
    }
  }

  async function onCoverFile(file: File | null, target: 'create' | 'edit') {
    if (!file) return;
    try {
      const uploaded = await uploadAdminImage(file, 'items');
      if (target === 'create') setCoverUrl(uploaded.url);
      else if (editing) setEditing({ ...editing, coverImageUrl: uploaded.url });
    } catch (err) {
      if (isMediaConfiguredError(err)) {
        setError('Cloudinary not configured — paste a cover URL instead.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;

  return (
    <div className="space-y-6">
      {toast ? <p className="text-sm text-[var(--color-success)]">{toast}</p> : null}
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

      <form
        onSubmit={onCreate}
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3"
      >
        <h2 className="font-display text-lg">Add category</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            Name
            <input
              className="w-full rounded border border-[var(--color-border)] px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            Parent (optional subcategory)
            <select
              className="w-full rounded border border-[var(--color-border)] px-3 py-2"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">— Root category —</option>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            Cover image URL
            <div className="flex flex-wrap gap-2">
              <input
                className="min-w-[200px] flex-1 rounded border border-[var(--color-border)] px-3 py-2"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
              <label className="cursor-pointer rounded border border-[var(--color-border)] px-3 py-2 text-sm">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onCoverFile(e.target.files?.[0] ?? null, 'create')}
                />
              </label>
            </div>
          </label>
        </div>
        <button type="submit" className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white">
          Create
        </button>
      </form>

      {roots.length === 0 ? (
        <EmptyState title="No categories" description="Create a root category to start the catalog." />
      ) : (
        <ul className="space-y-3">
          {roots.map((root) => (
            <li
              key={root.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{root.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">/{root.slug}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button type="button" className="text-[var(--color-primary)]" onClick={() => setEditing(root)}>
                    Edit
                  </button>
                  <button type="button" className="text-[var(--color-error)]" onClick={() => void onDelete(root.id)}>
                    Delete
                  </button>
                </div>
              </div>
              {root.children?.length ? (
                <ul className="mt-3 space-y-2 border-l border-[var(--color-border)] pl-4">
                  {root.children.map((child) => (
                    <li key={child.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>
                        {child.name}{' '}
                        <span className="text-xs text-[var(--color-text-secondary)]">/{child.slug}</span>
                      </span>
                      <span className="flex gap-2">
                        <button type="button" className="text-[var(--color-primary)]" onClick={() => setEditing(child)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-[var(--color-error)]"
                          onClick={() => void onDelete(child.id)}
                        >
                          Delete
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <form
          onSubmit={onSaveEdit}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md space-y-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5">
            <h3 className="font-display text-lg">Edit category</h3>
            <input
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <input
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              placeholder="Cover URL"
              value={editing.coverImageUrl || ''}
              onChange={(e) => setEditing({ ...editing, coverImageUrl: e.target.value || null })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white">
                Save
              </button>
              <button type="button" className="rounded border px-4 py-2 text-sm" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
