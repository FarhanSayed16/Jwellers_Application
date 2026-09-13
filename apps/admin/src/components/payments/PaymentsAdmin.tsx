'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Payment = {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountRupees: number;
  status: string;
  createdAt: string;
};

export function PaymentsAdmin() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ payments: Payment[] }>('/admin/payments');
      setRows(data.payments);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load payments');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markPaid(id: string) {
    setBusyId(id);
    try {
      await api.post(`/admin/payments/${id}/mark-paid`);
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Mark paid failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Advance / booking payments via Razorpay. Orders can be created from the customer app when the
        module is on. Without live keys, the API uses mock order ids for demos.
      </p>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
        {rows.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">
                ₹{p.amountRupees.toFixed(2)} · {p.status}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {p.razorpayOrderId}
                {p.razorpayPaymentId ? ` · ${p.razorpayPaymentId}` : ''}
              </p>
            </div>
            {(p.status === 'created' || p.status === 'pending') && (
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => void markPaid(p.id)}
                className="shrink-0 rounded border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface)] disabled:opacity-50"
              >
                {busyId === p.id ? '…' : 'Mark paid'}
              </button>
            )}
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No payments yet.</li>
        )}
      </ul>
    </div>
  );
}
