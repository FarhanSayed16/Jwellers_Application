'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Customer = {
  id: string;
  phone: string;
  name: string | null;
  tags: string[];
};

type FollowUp = {
  id: string;
  customerId: string;
  message: string;
  status: string;
  followUpAt: string | null;
  overdue: boolean;
  createdAt: string;
};

export function CrmAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tagDraft, setTagDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, f] = await Promise.all([
        api.get<{ customers: Customer[] }>('/admin/crm/customers'),
        api.get<{ enquiries: FollowUp[] }>('/admin/crm/follow-ups'),
      ]);
      setCustomers(c.customers);
      setFollowUps(f.enquiries);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load CRM');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTags(id: string) {
    const tags = (tagDraft[id] ?? '')
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await api.patch(`/admin/crm/customers/${id}/tags`, { tags });
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Tag update failed');
    }
  }

  async function snooze(id: string) {
    const when = new Date(Date.now() + 2 * 86400000).toISOString();
    try {
      await api.patch(`/admin/enquiries/${id}/follow-up`, {
        followUpAt: when,
        followUpNote: 'Snoozed +2 days',
      });
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Follow-up failed');
    }
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <section>
        <h3 className="mb-2 font-display text-lg">Follow-ups due</h3>
        <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
          {followUps.map((e) => (
            <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {e.status} {e.overdue ? '· overdue' : ''}
                </p>
                <p className="text-[var(--color-text-secondary)]">{e.message}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Created {new Date(e.createdAt).toLocaleString()}
                  {e.followUpAt ? ` · due ${new Date(e.followUpAt).toLocaleString()}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="rounded border border-[var(--color-border)] px-3 py-1"
                onClick={() => void snooze(e.id)}
              >
                Snooze 2d
              </button>
            </li>
          ))}
          {followUps.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No follow-ups due.</li>
          )}
        </ul>
      </section>
      <section>
        <h3 className="mb-2 font-display text-lg">Customers & tags</h3>
        <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
          {customers.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
              <div className="min-w-[140px]">
                <p className="font-medium">{c.name || 'Guest'}</p>
                <p className="text-[var(--color-text-secondary)]">{c.phone}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {c.tags.length ? c.tags.join(', ') : 'no tags'}
                </p>
              </div>
              <input
                className="min-w-[180px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-3 py-1"
                placeholder="VIP, bridal, …"
                defaultValue={c.tags.join(', ')}
                onChange={(e) => setTagDraft((d) => ({ ...d, [c.id]: e.target.value }))}
              />
              <button
                type="button"
                className="rounded border border-[var(--color-border)] px-3 py-1"
                onClick={() => void saveTags(c.id)}
              >
                Save tags
              </button>
            </li>
          ))}
          {customers.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No customers yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
