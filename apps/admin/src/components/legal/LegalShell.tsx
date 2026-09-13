import type { ReactNode } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/cookie-preferences', label: 'Preferences' },
  { href: '/legal/faq', label: 'FAQ' },
  { href: '/legal/support', label: 'Support' },
  { href: '/legal/delete-account', label: 'Delete account' },
] as const;

export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background,#F7F5F0)] text-[var(--color-text-primary,#14201C)]">
      <header className="border-b border-[var(--color-border,#D9D3C7)] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <p className="font-semibold tracking-tight">Shop Legal</p>
          <nav className="flex flex-wrap gap-3 text-sm" aria-label="Legal">
            {NAV.map((item) => (
              <Link key={item.href} className="underline-offset-2 hover:underline" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">{title}</h1>
        <article className="prose prose-neutral max-w-none space-y-4 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </article>
        <p className="mt-10 text-xs text-[var(--color-text-secondary,#5A6B65)]">
          Template for Demo / client shops. Have counsel review before Play production listing.
          Last updated: 12 Sep 2026.
        </p>
      </main>
    </div>
  );
}
