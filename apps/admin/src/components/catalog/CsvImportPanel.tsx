'use client';

import { FormEvent, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

const TEMPLATE = `sku,title,categorySlug,subcategorySlug,metal,purity,netWeightGrams,grossWeightGrams,status,isNewArrival,isFeatured,huid,description
RR-RING-001,Classic Gold Ring,gold,rings,gold,22K,3.2,3.5,draft,true,false,,Sample import row
`;

export function CsvImportPanel() {
  const [csv, setCsv] = useState(TEMPLATE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post<{
        created: number;
        skipped: number;
        errors: Array<{ row: number; message: string }>;
      }>('/items/import', { csv });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'items-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg">CSV import</h2>
        <button type="button" className="text-sm text-[var(--color-primary)]" onClick={downloadTemplate}>
          Download template
        </button>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">
        categorySlug must match an existing root category. Duplicate SKUs are skipped. Max 500 rows.
      </p>
      <textarea
        className="min-h-[140px] w-full rounded border border-[var(--color-border)] px-3 py-2 font-mono text-xs"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-primary)]">
        Upload file
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setCsv(await file.text());
          }}
        />
      </label>
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      {result ? (
        <p className="text-sm text-[var(--color-success)]">
          Created {result.created}, skipped {result.skipped}
          {result.errors.length ? `, ${result.errors.length} row error(s)` : ''}.
        </p>
      ) : null}
      {result?.errors?.length ? (
        <ul className="max-h-32 overflow-auto text-xs text-[var(--color-error)]">
          {result.errors.slice(0, 20).map((err) => (
            <li key={`${err.row}-${err.message}`}>
              Row {err.row}: {err.message}
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {busy ? 'Importing…' : 'Import CSV'}
      </button>
    </form>
  );
}
