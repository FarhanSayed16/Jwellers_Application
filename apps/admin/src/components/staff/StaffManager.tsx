'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';

type AdminRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'owner' | 'staff';
  isActive: boolean;
  lastLoginAt: string | null;
};

export function StaffManager() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    const data = await api.get<{ admins: AdminRow[] }>('/admin/staff');
    setAdmins(data.admins);
  }

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof ApiClientError ? err.message : 'Failed to load staff'),
    );
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setToast(null);
    try {
      await api.post('/admin/staff', {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        password,
      });
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setToast('Staff user created');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    }
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this staff user?')) return;
    await api.patch(`/admin/staff/${id}`, { isActive: false });
    await load();
  }

  async function activate(id: string) {
    await api.patch(`/admin/staff/${id}`, { isActive: true });
    await load();
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      {toast ? <p className="text-sm text-[var(--color-success)]">{toast}</p> : null}

      <form onSubmit={onCreate} className="space-y-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg">Invite staff</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="rounded border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="rounded border border-[var(--color-border)] px-3 py-2 text-sm" type="password" placeholder="Temporary password (min 10)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
        </div>
        <button type="submit" className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white">
          Create staff
        </button>
      </form>

      <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
        {admins.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">
                {a.name}{' '}
                <span className="text-xs capitalize text-[var(--color-text-secondary)]">({a.role})</span>
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {a.email || a.phone || '—'} · {a.isActive ? 'active' : 'inactive'}
              </p>
            </div>
            {a.role === 'staff' ? (
              a.isActive ? (
                <button type="button" className="text-[var(--color-error)]" onClick={() => void deactivate(a.id)}>
                  Deactivate
                </button>
              ) : (
                <button type="button" className="text-[var(--color-success)]" onClick={() => void activate(a.id)}>
                  Activate
                </button>
              )
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
