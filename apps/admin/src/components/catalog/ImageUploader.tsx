'use client';

import { useState } from 'react';
import { GripVertical, Star, Trash2, Upload } from 'lucide-react';
import { isMediaConfiguredError, uploadAdminImage } from '@/lib/upload';
import type { ItemImage } from '@/lib/catalogTypes';

export function ImageUploader({
  images,
  onChange,
}: {
  images: ItemImage[];
  onChange: (images: ItemImage[]) => void;
}) {
  const [urlDraft, setUrlDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setPrimary(index: number) {
    onChange(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  }

  function remove(index: number) {
    const next = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      sortOrder: i,
      isPrimary: images.length <= 1 ? true : img.isPrimary,
    }));
    if (next.length && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    try {
      // validate URL
      void new URL(url);
    } catch {
      setError('Enter a valid image URL');
      return;
    }
    const next = [
      ...images,
      {
        url,
        publicId: null,
        sortOrder: images.length,
        isPrimary: images.length === 0,
      },
    ];
    onChange(next);
    setUrlDraft('');
    setError(null);
  }

  async function onFile(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded: ItemImage[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadAdminImage(file, 'items');
        uploaded.push({
          url: result.url,
          publicId: result.publicId,
          sortOrder: images.length + uploaded.length,
          isPrimary: images.length + uploaded.length === 0,
        });
      }
      const merged = [...images, ...uploaded].map((img, i) => ({ ...img, sortOrder: i }));
      if (merged.length && !merged.some((i) => i.isPrimary)) merged[0].isPrimary = true;
      onChange(merged);
    } catch (err) {
      if (isMediaConfiguredError(err)) {
        setError('Cloudinary is not configured. Paste image URLs below instead.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[var(--radius-sm)] border border-[var(--color-accent)]/40 bg-[var(--color-background)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
        Image tip: aim for ~1500×1500+, plain background, multiple angles. JPEG/PNG/WebP.
      </div>
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
        <Upload size={16} />
        {busy ? 'Uploading…' : 'Upload images'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => void onFile(e.target.files)}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[220px] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Or paste image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm"
        >
          Add URL
        </button>
      </div>

      <ul className="space-y-2">
        {images.map((img, index) => (
          <li
            key={`${img.url}-${index}`}
            className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-14 w-14 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-[var(--color-text-secondary)]">{img.url}</p>
              {img.isPrimary ? (
                <p className="text-xs text-[var(--color-primary)]">Primary</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Move up" onClick={() => move(index, -1)}>
                <GripVertical size={16} className="text-[var(--color-text-secondary)]" />
              </button>
              <button
                type="button"
                className="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                onClick={() => setPrimary(index)}
                title="Set primary"
              >
                <Star size={16} fill={img.isPrimary ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                className="rounded p-1 text-[var(--color-error)]"
                onClick={() => remove(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
