'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type Invoice = {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  gstTotal: number;
  status: string;
  pdfUrl: string | null;
  shareText: string;
  createdAt: string;
};

export function InvoicesAdmin() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [desc, setDesc] = useState('Jewellery item');
  const [total, setTotal] = useState('10000');
  const [gst, setGst] = useState('300');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ invoices: Invoice[] }>('/admin/invoices');
      setRows(data.invoices);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load invoices');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setBusy(true);
    try {
      const lineTotal = Number(total);
      const gstAmount = Number(gst);
      await api.post('/admin/invoices', {
        status: 'issued',
        lineItems: [
          {
            description: desc,
            gstAmount,
            lineTotal,
          },
        ],
      });
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  function shareWhatsApp(text: string) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Proforma / estimate invoices. Have a CA review GST fields before using as a tax invoice.
      </p>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <div className="grid gap-3 rounded border border-[var(--color-border)] p-4 md:grid-cols-4">
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm md:col-span-2"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Line description"
        />
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="Line total ₹"
        />
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
          placeholder="GST ₹"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-60 md:col-span-4 md:w-fit"
        >
          Create &amp; issue
        </button>
      </div>
      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
        {rows.map((inv) => (
          <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{inv.invoiceNumber}</p>
              <p className="text-[var(--color-text-secondary)]">
                ₹{inv.grandTotal.toFixed(2)} · {inv.status}
              </p>
            </div>
            <div className="flex gap-2">
              {inv.pdfUrl && (
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-[var(--color-border)] px-3 py-1"
                >
                  Open PDF/HTML
                </a>
              )}
              <button
                type="button"
                className="rounded border border-[var(--color-border)] px-3 py-1"
                onClick={() => shareWhatsApp(inv.shareText)}
              >
                WhatsApp
              </button>
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">No invoices yet.</li>
        )}
      </ul>
    </div>
  );
}
