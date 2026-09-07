'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/rates': 'Rates',
  '/catalog/items/new': 'Add item',
  '/catalog/items': 'Items',
  '/catalog/categories': 'Categories',
  '/catalog': 'Catalog',
  '/enquiries': 'Enquiries',
  '/custom-requests': 'Custom requests',
  '/chat': 'Chat',
  '/offers': 'Offers',
  '/branding': 'Branding',
  '/staff': 'Staff',
  '/settings': 'Settings',
};

export function AppShell({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/login');
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>
      </div>
    );
  }

  const title =
    Object.entries(TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => (path === '/' ? pathname === '/' : pathname.startsWith(path)))?.[1] ??
    'Admin';

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
