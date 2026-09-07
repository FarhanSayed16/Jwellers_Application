'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { isMediaConfiguredError, uploadAdminImage } from '@/lib/upload';

const TOKEN_KEYS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'textPrimary',
  'textSecondary',
  'border',
  'success',
  'warning',
  'error',
] as const;

type Theme = Record<(typeof TOKEN_KEYS)[number], string>;

type ShopConfig = {
  shopName: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactPhone?: string;
  contactEmail?: string | null;
  gstNumber?: string | null;
  bisRegistrationNumber?: string | null;
  gstPercentDefault?: number;
  makingChargeDefault?: { type: 'percent' | 'flat'; value: number };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
    whatsapp?: string;
  };
  themeLight?: Theme;
  themeDark?: Theme;
};

const defaultTheme = (seed: Partial<Theme> = {}): Theme => ({
  primary: '#1F4B3F',
  secondary: '#3D7A6A',
  accent: '#C9A227',
  background: '#F7F5F0',
  surface: '#FFFFFF',
  textPrimary: '#14201C',
  textSecondary: '#5A6B65',
  border: '#D9D3C7',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#C62828',
  ...seed,
});

export function BrandingForm() {
  const [cfg, setCfg] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.get<ShopConfig>('/admin/shop-config');
        setCfg({
          ...data,
          themeLight: defaultTheme(data.themeLight),
          themeDark: defaultTheme({
            primary: '#5EBFAB',
            background: '#0E1513',
            surface: '#1A2420',
            textPrimary: '#F3F6F5',
            textSecondary: '#A8B5B0',
            border: '#2A3531',
            ...data.themeDark,
          }),
          makingChargeDefault: data.makingChargeDefault || { type: 'percent', value: 12 },
          address: data.address || {},
          socialLinks: data.socialLinks || {},
        });
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load shop config');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLogo(file: File | null) {
    if (!file || !cfg) return;
    try {
      const uploaded = await uploadAdminImage(file, 'branding');
      setCfg({ ...cfg, logoUrl: uploaded.url });
    } catch (err) {
      if (isMediaConfiguredError(err)) {
        setError('Cloudinary not configured — paste a logo URL instead.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!cfg) return;
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      await api.patch('/admin/shop-config', {
        shopName: cfg.shopName,
        logoUrl: cfg.logoUrl || undefined,
        faviconUrl: cfg.faviconUrl || undefined,
        contactPhone: cfg.contactPhone || undefined,
        contactEmail: cfg.contactEmail?.trim() ? cfg.contactEmail.trim() : null,
        gstNumber: cfg.gstNumber || null,
        bisRegistrationNumber: cfg.bisRegistrationNumber || null,
        gstPercentDefault: cfg.gstPercentDefault,
        makingChargeDefault: cfg.makingChargeDefault,
        address: cfg.address,
        socialLinks: cfg.socialLinks,
        themeLight: cfg.themeLight,
        themeDark: cfg.themeDark,
      });
      setToast('Branding saved. Customers see updates after refresh.');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;
  if (!cfg) return <p className="text-sm text-[var(--color-error)]">{error || 'No config'}</p>;

  const light = cfg.themeLight!;

  return (
    <form onSubmit={onSave} className="space-y-8">
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      {toast ? <p className="text-sm text-[var(--color-success)]">{toast}</p> : null}

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Identity</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            Shop name
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={cfg.shopName || ''} onChange={(e) => setCfg({ ...cfg, shopName: e.target.value })} required />
          </label>
          <label className="space-y-1 text-sm">
            Contact phone
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={cfg.contactPhone || ''} onChange={(e) => setCfg({ ...cfg, contactPhone: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm">
            Contact email
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={cfg.contactEmail || ''} onChange={(e) => setCfg({ ...cfg, contactEmail: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm">
            GST number
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={cfg.gstNumber || ''} onChange={(e) => setCfg({ ...cfg, gstNumber: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm">
            BIS registration
            <input className="w-full rounded border border-[var(--color-border)] px-3 py-2" value={cfg.bisRegistrationNumber || ''} onChange={(e) => setCfg({ ...cfg, bisRegistrationNumber: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            Logo URL
            <div className="flex flex-wrap gap-2">
              <input className="min-w-[200px] flex-1 rounded border border-[var(--color-border)] px-3 py-2" value={cfg.logoUrl || ''} onChange={(e) => setCfg({ ...cfg, logoUrl: e.target.value })} />
              <label className="cursor-pointer rounded border px-3 py-2 text-sm">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => void onLogo(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(['line1', 'line2', 'city', 'state', 'pincode', 'country'] as const).map((key) => (
            <label key={key} className="space-y-1 text-sm">
              Address {key}
              <input
                className="w-full rounded border border-[var(--color-border)] px-3 py-2"
                value={cfg.address?.[key] || ''}
                onChange={(e) => setCfg({ ...cfg, address: { ...cfg.address, [key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {(['themeLight', 'themeDark'] as const).map((themeKey) => (
          <div key={themeKey} className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="font-display text-lg">{themeKey === 'themeLight' ? 'Light theme' : 'Dark theme'}</h2>
            <div className="grid grid-cols-2 gap-2">
              {TOKEN_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                  <input
                    type="color"
                    value={(cfg[themeKey] as Theme)[key]}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        [themeKey]: { ...(cfg[themeKey] as Theme), [key]: e.target.value },
                      })
                    }
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4" style={{ background: light.background, color: light.textPrimary }}>
        <h2 className="font-display text-lg" style={{ color: light.primary }}>Preview</h2>
        <p className="mt-1 text-sm" style={{ color: light.textSecondary }}>
          Mini phone mock using light tokens
        </p>
        <div className="mx-auto mt-4 w-48 rounded-3xl border p-3 shadow-sm" style={{ background: light.surface, borderColor: light.border }}>
          <div className="rounded-xl px-3 py-6 text-center text-white" style={{ background: light.primary }}>
            {cfg.shopName || 'Shop'}
          </div>
          <button type="button" className="mt-3 w-full rounded-lg py-2 text-sm text-white" style={{ background: light.accent }}>
            Enquire
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Defaults & social</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            Making type
            <select
              className="w-full rounded border border-[var(--color-border)] px-3 py-2"
              value={cfg.makingChargeDefault?.type || 'percent'}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  makingChargeDefault: {
                    type: e.target.value as 'percent' | 'flat',
                    value: cfg.makingChargeDefault?.value ?? 12,
                  },
                })
              }
            >
              <option value="percent">percent</option>
              <option value="flat">flat</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Making value
            <input
              type="number"
              className="w-full rounded border border-[var(--color-border)] px-3 py-2"
              value={cfg.makingChargeDefault?.value ?? 12}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  makingChargeDefault: {
                    type: cfg.makingChargeDefault?.type || 'percent',
                    value: Number(e.target.value),
                  },
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            GST %
            <input
              type="number"
              className="w-full rounded border border-[var(--color-border)] px-3 py-2"
              value={cfg.gstPercentDefault ?? 3}
              onChange={(e) => setCfg({ ...cfg, gstPercentDefault: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(['whatsapp', 'instagram', 'facebook', 'youtube', 'website'] as const).map((key) => (
            <label key={key} className="space-y-1 text-sm">
              {key}
              <input
                className="w-full rounded border border-[var(--color-border)] px-3 py-2"
                value={cfg.socialLinks?.[key] || ''}
                onChange={(e) => setCfg({ ...cfg, socialLinks: { ...cfg.socialLinks, [key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </section>

      <button type="submit" disabled={saving} className="rounded bg-[var(--color-primary)] px-4 py-2.5 text-sm text-white disabled:opacity-60">
        {saving ? 'Saving…' : 'Save branding'}
      </button>
    </form>
  );
}
