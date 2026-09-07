'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Enquiry = {
  id: string;
  customerId: string;
  itemId: string | null;
  message: string;
  status: string;
  assignedTo: string | null;
  channel: string;
  createdAt: string;
};

type Staff = { id: string; name: string; role: string; isActive: boolean };

export function EnquiriesInbox() {
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const q = status ? `?status=${status}` : '';
      const data = await api.get<{ enquiries: Enquiry[] }>(`/admin/enquiries${q}`);
      setRows(data.enquiries);
      try {
        const s = await api.get<{ admins: Staff[] }>('/admin/staff');
        setStaff(s.admins.filter((a) => a.isActive));
      } catch {
        // staff list is owner-only; staff role can still manage status without assign list
        setStaff([]);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function patch(id: string, body: { status?: string; assignedTo?: string | null }) {
    const res = await api.patch<{ enquiry: Enquiry }>(`/admin/enquiries/${id}`, body);
    setSelected(res.enquiry);
    await load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {['', 'new', 'in_progress', 'closed', 'converted'].map((s) => (
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
                <p className="text-sm font-medium">{row.status} · {row.channel}</p>
                <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{row.message}</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {new Date(row.createdAt).toLocaleString('en-IN')}
                </p>
              </button>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No enquiries.</li>
          ) : null}
        </ul>
      </div>

      <aside className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        {selected ? (
          <div className="space-y-3 text-sm">
            <h3 className="font-display text-lg">Detail</h3>
            <p className="whitespace-pre-wrap">{selected.message}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Customer: {selected.customerId}
              {selected.itemId ? ` · Item: ${selected.itemId}` : ''}
            </p>
            <label className="block space-y-1">
              Status
              <select
                className="w-full rounded border border-[var(--color-border)] px-3 py-2"
                value={selected.status}
                onChange={(e) => void patch(selected.id, { status: e.target.value })}
              >
                <option value="new">new</option>
                <option value="in_progress">in_progress</option>
                <option value="closed">closed</option>
                <option value="converted">converted</option>
              </select>
            </label>
            {staff.length > 0 ? (
              <label className="block space-y-1">
                Assign
                <select
                  className="w-full rounded border border-[var(--color-border)] px-3 py-2"
                  value={selected.assignedTo || ''}
                  onChange={(e) =>
                    void patch(selected.id, { assignedTo: e.target.value || null })
                  }
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">Select an enquiry</p>
        )}
      </aside>
    </div>
  );
}
