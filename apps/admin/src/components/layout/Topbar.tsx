'use client';

import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Topbar({
  title,
  onMenu,
}: {
  title: string;
  onMenu: () => void;
}) {
  const { admin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded p-1.5 text-[var(--color-text-secondary)] md:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-display text-lg text-[var(--color-text-primary)]">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{admin?.name}</p>
          <p className="text-xs capitalize text-[var(--color-text-secondary)]">{admin?.role}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout().then(() => {
            window.location.href = '/login';
          })}
          className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
