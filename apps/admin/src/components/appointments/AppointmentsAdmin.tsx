'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Appointment = {
  id: string;
  name: string;
  phone: string;
  preferredAt: string;
  partySize: number;
  note: string | null;
  status: string;
  adminNote: string | null;
};

export function AppointmentsAdmin() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ appointments: Appointment[] }>('/admin/appointments');
      setRows(data.appointments);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load appointments');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Update failed');
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Store visit bookings from the customer app. Confirm or cancel from here.
      </p>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
        {rows.map((a) => (
          <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">
                {a.name} · {a.phone}
              </p>
              <p className="text-[var(--color-text-secondary)]">
                {new Date(a.preferredAt).toLocaleString()} · party {a.partySize} · {a.status}
              </p>
              {a.note && <p className="mt-1 text-[var(--color-text-secondary)]">{a.note}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['confirmed', 'completed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 capitalize"
                  onClick={() => void setStatus(a.id, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No appointments yet.</li>
        )}
      </ul>
    </div>
  );
}
