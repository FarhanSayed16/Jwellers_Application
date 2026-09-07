'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Coins,
  Gem,
  MessageSquare,
  MessagesSquare,
  Tag,
  Palette,
  Users,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { FeatureGate, OwnerOnly } from '@/components/FeatureGate';
import { useAuth } from '@/lib/auth';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  ownerOnly?: boolean;
  feature?: string;
};

const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rates', label: 'Rates', icon: Coins },
  { href: '/catalog', label: 'Catalog', icon: Gem },
  { href: '/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/custom-requests', label: 'Custom requests', icon: Sparkles, feature: 'customRequests' },
  { href: '/chat', label: 'Chat', icon: MessagesSquare, feature: 'chat' },
  { href: '/offers', label: 'Offers', icon: Tag, feature: 'offers' },
  { href: '/branding', label: 'Branding', icon: Palette, ownerOnly: true },
  { href: '/staff', label: 'Staff', icon: Users, ownerOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { admin } = useAuth();

  const linkClass = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return [
      'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors',
      active
        ? 'bg-[var(--color-primary)] text-white'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]',
    ].join(' ');
  };

  const content = (
    <aside className="flex h-full w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
        <div>
          <p className="font-display text-lg text-[var(--color-primary)]">Retailer Admin</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {admin?.name ?? 'Jewellery shop'}
          </p>
        </div>
        <button
          type="button"
          className="rounded p-1 text-[var(--color-text-secondary)] md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const node = (
            <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={onClose}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
          if (item.ownerOnly) {
            return (
              <OwnerOnly key={item.href}>
                {item.feature ? <FeatureGate flag={item.feature}>{node}</FeatureGate> : node}
              </OwnerOnly>
            );
          }
          if (item.feature) {
            return (
              <FeatureGate key={item.href} flag={item.feature}>
                {node}
              </FeatureGate>
            );
          }
          return node;
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden md:block">{content}</div>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close overlay"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 z-50 shadow-lg">{content}</div>
        </div>
      ) : null}
    </>
  );
}
