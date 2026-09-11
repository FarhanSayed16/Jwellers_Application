'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import type { Category, Item, ItemImage } from '@/lib/catalogTypes';
import { ImageUploader } from './ImageUploader';
import { FeatureGate } from '@/components/FeatureGate';
import { isMediaConfiguredError, uploadAdminImage } from '@/lib/upload';

type FormState = {
  sku: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  metal: 'gold' | 'silver' | 'other';
  purity: '24K' | '22K' | '18K' | 'other';
  huid: string;
  hallmarkImageUrl: string;
  grossWeightGrams: string;
  netWeightGrams: string;
  makingType: 'inherit' | 'percent' | 'flat';
  makingValue: string;
  stoneDetails: string;
  sizeInfo: string;
  tags: string;
  isNewArrival: boolean;
  isFeatured: boolean;
  status: 'draft' | 'active' | 'sold' | 'archived';
  images: ItemImage[];
};

const empty: FormState = {
  sku: '',
  title: '',
  description: '',
  categoryId: '',
  subcategoryId: '',
  metal: 'gold',
  purity: '22K',
  huid: '',
  hallmarkImageUrl: '',
  grossWeightGrams: '',
  netWeightGrams: '',
  makingType: 'inherit',
  makingValue: '',
  stoneDetails: '',
  sizeInfo: '',
  tags: '',
  isNewArrival: false,
  isFeatured: false,
  status: 'draft',
  images: [],
};

function fromItem(item: Item): FormState {
  return {
    sku: item.sku,
    title: item.title,
    description: item.description || '',
    categoryId: item.categoryId,
    subcategoryId: item.subcategoryId || '',
    metal: item.metal as FormState['metal'],
    purity: item.purity as FormState['purity'],
    huid: item.huid || '',
    hallmarkImageUrl: item.hallmarkImageUrl || '',
    grossWeightGrams: item.grossWeightGrams != null ? String(item.grossWeightGrams) : '',
    netWeightGrams: item.netWeightGrams != null ? String(item.netWeightGrams) : '',
    makingType: item.makingCharge.type,
    makingValue: item.makingCharge.value != null ? String(item.makingCharge.value) : '',
    stoneDetails: item.stoneDetails || '',
    sizeInfo: item.sizeInfo || '',
    tags: (item.tags || []).join(', '),
    isNewArrival: item.isNewArrival,
    isFeatured: item.isFeatured,
    status: item.status,
    images: item.images || [],
  };
}

export function ItemForm({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty);
  const [roots, setRoots] = useState<Category[]>([]);
  const [loading, setLoading] = useState(Boolean(itemId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const subcats = useMemo(() => {
    const root = roots.find((r) => r.id === form.categoryId);
    return root?.children || [];
  }, [roots, form.categoryId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await api.get<{ tree: Category[] }>('/categories?tree=true&includeInactive=true', false);
        if (!cancelled) setRoots(cats.tree || []);
        if (itemId) {
          const res = await api.get<{ item: Item }>(`/admin/items/${itemId}`);
          if (!cancelled) setForm(fromItem(res.item));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload() {
    const makingCharge =
      form.makingType === 'inherit'
        ? { type: 'inherit' as const }
        : {
            type: form.makingType,
            value: Number(form.makingValue),
          };

    return {
      sku: form.sku.trim(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      images: form.images,
      metal: form.metal,
      purity: form.purity,
      huid: form.huid.trim() || undefined,
      hallmarkImageUrl: form.hallmarkImageUrl.trim() || undefined,
      grossWeightGrams: form.grossWeightGrams ? Number(form.grossWeightGrams) : undefined,
      netWeightGrams: form.netWeightGrams ? Number(form.netWeightGrams) : undefined,
      makingCharge,
      stoneDetails: form.stoneDetails.trim() || undefined,
      sizeInfo: form.sizeInfo.trim() || undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isNewArrival: form.isNewArrival,
      isFeatured: form.isFeatured,
      status: form.status,
    };
  }

  async function onSubmit(e: FormEvent, addAnother = false) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      if (!form.categoryId) throw new Error('Category is required');
      if (form.images.length < 1) throw new Error('Add at least one image');
      const payload = buildPayload();
      if (itemId) {
        await api.patch(`/items/${itemId}`, payload);
        setToast('Item updated');
      } else {
        const res = await api.post<{ item: Item }>('/items', payload);
        setToast('Item created');
        if (addAnother) {
          setForm({ ...empty, categoryId: form.categoryId, subcategoryId: form.subcategoryId });
        } else {
          router.replace(`/catalog/items/${res.item.id}`);
        }
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!itemId || !confirm('Soft-delete this item?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      router.replace('/catalog/items');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;

  return (
    <form className="space-y-8" onSubmit={(e) => void onSubmit(e)}>
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      {toast ? <p className="text-sm text-[var(--color-success)]">{toast}</p> : null}

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Basics</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            Title
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" required value={form.title} onChange={(e) => set('title', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            SKU
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" required value={form.sku} onChange={(e) => set('sku', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            Category
            <select className="w-full rounded border border-[var(--color-border)] px-3 py-2" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
              <option value="">Select…</option>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Subcategory
            <select className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.subcategoryId} onChange={(e) => set('subcategoryId', e.target.value)}>
              <option value="">— None —</option>
              {subcats.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Status
            <select className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.status} onChange={(e) => set('status', e.target.value as FormState['status'])}>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="sold">sold</option>
              <option value="archived">archived</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Metal</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            Metal
            <select className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.metal} onChange={(e) => set('metal', e.target.value as FormState['metal'])}>
              <option value="gold">gold</option>
              <option value="silver">silver</option>
              <option value="other">other</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Purity
            <select className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.purity} onChange={(e) => set('purity', e.target.value as FormState['purity'])}>
              <option value="24K">24K</option>
              <option value="22K">22K</option>
              <option value="18K">18K</option>
              <option value="other">other</option>
            </select>
          </label>
          <FeatureGate flag="hallmark">
            <>
              <label className="space-y-1 text-sm">
                HUID
                <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.huid} onChange={(e) => set('huid', e.target.value)} placeholder="Hallmark Unique ID" />
              </label>
              <label className="space-y-1 text-sm md:col-span-1">
                Hallmark stamp image URL
                <div className="flex flex-wrap gap-2">
                  <input className="min-w-[160px] flex-1 rounded border border-[var(--color-border)] px-3 py-2" value={form.hallmarkImageUrl} onChange={(e) => set('hallmarkImageUrl', e.target.value)} />
                  <label className="cursor-pointer rounded border border-[var(--color-border)] px-3 py-2 text-sm">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const uploaded = await uploadAdminImage(file, 'items');
                          set('hallmarkImageUrl', uploaded.url);
                        } catch (err) {
                          if (isMediaConfiguredError(err)) {
                            setError('Cloudinary not configured — paste a hallmark image URL.');
                          } else {
                            setError(err instanceof Error ? err.message : 'Upload failed');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Shows as hallmark stamp — not a “verified” claim.</p>
              </label>
            </>
          </FeatureGate>
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Weight & making</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            Gross grams
            <input type="number" step="0.001" className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.grossWeightGrams} onChange={(e) => set('grossWeightGrams', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            Net grams
            <input type="number" step="0.001" className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.netWeightGrams} onChange={(e) => set('netWeightGrams', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            Making charge
            <select className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.makingType} onChange={(e) => set('makingType', e.target.value as FormState['makingType'])}>
              <option value="inherit">inherit shop default</option>
              <option value="percent">percent</option>
              <option value="flat">flat ₹</option>
            </select>
          </label>
          {form.makingType !== 'inherit' ? (
            <label className="space-y-1 text-sm">
              Making value
              <input type="number" step="0.01" className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.makingValue} onChange={(e) => set('makingValue', e.target.value)} required />
            </label>
          ) : null}
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Media</h2>
        <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
      </section>

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Merchandising</h2>
        <label className="block space-y-1 text-sm">
          Description
          <textarea className="w-full rounded border border-[var(--color-border)] px-3 py-2" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            Stone details
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.stoneDetails} onChange={(e) => set('stoneDetails', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            Size info
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.sizeInfo} onChange={(e) => set('sizeInfo', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            Tags (comma-separated)
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isNewArrival} onChange={(e) => set('isNewArrival', e.target.checked)} />
            New arrival
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
            Featured
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {!itemId ? (
          <button
            type="button"
            disabled={saving}
            className="rounded border border-[var(--color-border)] px-4 py-2 text-sm"
            onClick={(e) => void onSubmit(e as unknown as FormEvent, true)}
          >
            Save & add another
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={saving}
              className="rounded border border-[var(--color-border)] px-4 py-2 text-sm"
              onClick={async () => {
                if (!itemId) return;
                setSaving(true);
                try {
                  const data = await api.post<{ item: Item }>(`/items/${itemId}/clone`, {});
                  router.push(`/catalog/items/${data.item.id}`);
                } catch (err) {
                  setError(err instanceof ApiClientError ? err.message : 'Clone failed');
                } finally {
                  setSaving(false);
                }
              }}
            >
              Clone item
            </button>
            <button type="button" className="rounded border border-[var(--color-error)] px-4 py-2 text-sm text-[var(--color-error)]" onClick={() => void onDelete()}>
              Soft-delete
            </button>
          </>
        )}
      </div>
    </form>
  );
}
