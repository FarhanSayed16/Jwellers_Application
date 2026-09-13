import type { ReactNode } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/legal/privacy', label: 'Privacy', icon: '🔒' },
  { href: '/legal/terms', label: 'Terms', icon: '📄' },
  { href: '/legal/cookies', label: 'Cookies', icon: '🍪' },
  { href: '/legal/cookie-preferences', label: 'Preferences', icon: '⚙️' },
  { href: '/legal/faq', label: 'FAQ', icon: '❓' },
  { href: '/legal/support', label: 'Support', icon: '💬' },
  { href: '/legal/delete-account', label: 'Delete account', icon: '🗑️' },
] as const;

export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-background,#F7F5F0)] to-white text-[var(--color-text-primary,#14201C)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border,#D9D3C7)]/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/legal/privacy" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary,#1F4B3F)] text-xs font-bold text-white">
                JW
              </div>
              <p className="text-sm font-semibold tracking-tight">Shop Legal</p>
            </Link>
            <nav className="flex flex-wrap gap-1 text-xs" aria-label="Legal">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-lg px-3 py-2 text-[var(--color-text-secondary,#5A6B65)] transition-all duration-150 hover:bg-[var(--color-primary,#1F4B3F)]/5 hover:text-[var(--color-primary,#1F4B3F)]"
                  href={item.href}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary,#14201C)] sm:text-4xl">
            {title}
          </h1>
          <div className="mt-3 h-1 w-12 rounded-full bg-[#C9A227]" />
        </div>
        <article className="prose prose-neutral max-w-none space-y-4 text-sm leading-relaxed [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight [&_ul]:list-disc [&_ul]:pl-5 [&_code]:rounded [&_code]:bg-[var(--color-background,#F7F5F0)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-medium [&_a]:text-[var(--color-primary,#1F4B3F)] [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:text-[#C9A227]">
          {children}
        </article>
        <div className="mt-12 border-t border-[var(--color-border,#D9D3C7)]/60 pt-6">
          <p className="text-xs text-[var(--color-text-secondary,#5A6B65)]">
            Template for Demo / client shops. Have counsel review before Play production listing.
            Last updated: 12 Sep 2026.
          </p>
        </div>
      </main>
    </div>
  );
}
