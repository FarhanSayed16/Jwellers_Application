'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Quote = {
  id: string;
  customerId: string | null;
  metal: string;
  purity: string;
  weightGrams: number;
  estimatedValue: number;
  deductionPercent: number;
  createdAt: string;
};

export function OldGoldAdmin() {
  const [percent, setPercent] = useState('8');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfg, list] = await Promise.all([
        api.get<{ exchangeDeductionPercent: number }>('/old-gold/config'),
        api.get<{ quotes: Quote[] }>('/admin/old-gold/quotes'),
      ]);
      setPercent(String(cfg.exchangeDeductionPercent));
      setQuotes(list.quotes);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    try {
      const data = await api.patch<{ exchangeDeductionPercent: number }>('/admin/old-gold/config', {
        exchangeDeductionPercent: Number(percent),
      });
      setPercent(String(data.exchangeDeductionPercent));
      setMessage('Saved deduction percent');
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Save failed');
    }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-md space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Customers see an estimated exchange value = weight × today&apos;s rate × (1 − deduction%).
        </p>
        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        {message && <p className="text-sm text-[var(--color-success)]">{message}</p>}
        <label className="block text-sm">
          Deduction %
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => void save()}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
        >
          Save
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg">Recent customer quotes</h2>
        <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
          {quotes.map((q) => (
            <li key={q.id} className="px-4 py-3 text-sm">
              <p className="font-medium">
                {q.metal} {q.purity} · {q.weightGrams}g → ₹{q.estimatedValue.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Deduction {q.deductionPercent}% · {new Date(q.createdAt).toLocaleString()}
                {q.customerId ? ` · customer ${q.customerId.slice(-6)}` : ''}
              </p>
            </li>
          ))}
          {quotes.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">
              No saved quotes yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
