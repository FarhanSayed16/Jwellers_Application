'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Offer = {
  id: string;
  title: string;
  description: string | null;
  bannerImageUrl: string | null;
  validFrom: string | null;
  validTill: string | null;
  isActive: boolean;
  sortOrder: number;
};

export function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTill, setValidTill] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.get<{ offers: Offer[] }>('/admin/offers');
      setOffers(data.offers);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load offers');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/admin/offers', {
        title: title.trim(),
        description: description.trim() || undefined,
        bannerImageUrl: bannerImageUrl.trim() || undefined,
        validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
        validTill: validTill ? new Date(validTill).toISOString() : undefined,
        isActive: true,
      });
      setTitle('');
      setDescription('');
      setBannerImageUrl('');
      setValidFrom('');
      setValidTill('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    }
  }

  async function toggle(offer: Offer) {
    await api.patch(`/admin/offers/${offer.id}`, { isActive: !offer.isActive });
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Soft-delete this offer?')) return;
    await api.delete(`/admin/offers/${id}`);
    await load();
  }

  async function broadcastWa(offer: Offer) {
    setError(null);
    try {
      const data = await api.post<{
        broadcast: { status: string; dryRun: boolean; recipientCount: number };
      }>('/admin/whatsapp-business/broadcast/offer', { offerId: offer.id });
      const b = data.broadcast;
      alert(
        b.dryRun
          ? `WA offer broadcast dry-run (${b.recipientCount} recipients).`
          : `WA offer broadcast ${b.status} (${b.recipientCount} recipients).`,
      );
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Broadcast failed (is FEATURE_WHATSAPP_BUSINESS_API on?)',
      );
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <form onSubmit={onCreate} className="space-y-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">New offer</h2>
        <input className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Banner image URL" value={bannerImageUrl} onChange={(e) => setBannerImageUrl(e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            Valid from
            <input type="datetime-local" className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            Valid till
            <input type="datetime-local" className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={validTill} onChange={(e) => setValidTill(e.target.value)} />
          </label>
        </div>
        <button type="submit" className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white">
          Create offer
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {offers.map((offer) => (
          <article key={offer.id} className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{offer.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {offer.isActive ? 'Active' : 'Inactive'}
                  {offer.validFrom ? ` · from ${new Date(offer.validFrom).toLocaleDateString('en-IN')}` : ''}
                  {offer.validTill ? ` · till ${new Date(offer.validTill).toLocaleDateString('en-IN')}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button type="button" className="text-[var(--color-primary)]" onClick={() => void toggle(offer)}>
                  Toggle
                </button>
                <button type="button" className="text-[var(--color-primary)]" onClick={() => void broadcastWa(offer)}>
                  WA broadcast
                </button>
                <button type="button" className="text-[var(--color-error)]" onClick={() => void remove(offer.id)}>
                  Delete
                </button>
              </div>
            </div>
            {offer.description ? <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{offer.description}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
