'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, ApiClientError, clearTokens } from '@/lib/api';

const FLAG_LABELS: Record<string, string> = {
  chat: 'Chat',
  whatsapp: 'WhatsApp',
  rateHistory: 'Rate history',
  sizeGuide: 'Size guide',
  offers: 'Offers',
  customRequests: 'Custom requests',
  hallmark: 'Hallmark',
  digitalBilling: 'Digital billing',
  razorpayPayments: 'Razorpay payments',
  oldGoldExchange: 'Old-gold exchange',
  itemQr: 'Item QR / print tags',
  shareRateCard: 'Share rate card',
  appointments: 'Appointments',
  storeMode: 'Store mode (tablet)',
  curatedBoards: 'Curated Home boards',
  analytics: 'Analytics',
  crmLight: 'CRM-lite',
  schemes: 'Schemes',
  referrals: 'Referrals',
  priceAlerts: 'Price alerts',
  rateApi: 'Rate API',
  whatsappBusinessApi: 'WhatsApp Business API',
  multiBranch: 'Multi-branch (not shipped)',
  offlineCatalog: 'Offline catalog (not shipped)',
  i18n: 'i18n (not shipped)',
};
export function SettingsPanel() {
  const { admin, features, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setToast(null);
    try {
      await api.post('/auth/admin/password/change', { currentPassword, newPassword });
      setToast('Password updated. Please sign in again.');
      await clearTokens();
      setTimeout(() => {
        window.location.href = '/login';
      }, 800);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Change failed');
    }
  }

  const flagEntries = Object.entries(features || {}).filter(
    ([k, v]) => typeof v === 'boolean' && FLAG_LABELS[k],
  );

  return (
    <div className="space-y-8">
      <section className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Profile</h2>
        <p className="mt-2 text-sm">{admin?.name}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {admin?.email || admin?.phone || '—'} · {admin?.role}
        </p>
      </section>

      <form onSubmit={onChangePassword} className="space-y-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Change password</h2>
        {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
        {toast ? <p className="text-sm text-[var(--color-success)]">{toast}</p> : null}
        <input
          type="password"
          className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="New password (min 10)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={10}
        />
        <button type="submit" className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white">
          Update password
        </button>
      </form>

      <section className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Feature modules</h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Read-only — contact support to change sold modules.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {flagEntries.map(([key, on]) => (
            <li key={key} className="flex justify-between border-b border-[var(--color-border)] py-2 last:border-0">
              <span>{FLAG_LABELS[key] || key}</span>
              <span className={on ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}>
                {on ? 'ON' : 'OFF'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="rounded border border-[var(--color-border)] px-4 py-2 text-sm"
        onClick={() => void logout().then(() => {
          window.location.href = '/login';
        })}
      >
        Sign out
      </button>
    </div>
  );
}
