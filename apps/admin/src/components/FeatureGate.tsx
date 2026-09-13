'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

/** Human-friendly labels for feature flag keys */
const FEATURE_LABELS: Record<string, { label: string; description: string }> = {
  analytics: {
    label: 'Analytics Dashboard',
    description: 'Track customer engagement, popular items, and sales trends with visual reports.',
  },
  crmLight: {
    label: 'CRM & Customer Insights',
    description: 'View customer profiles, purchase history, and engagement timeline.',
  },
  schemes: {
    label: 'Savings Schemes',
    description: 'Create and manage monthly gold savings schemes for your customers.',
  },
  referrals: {
    label: 'Referral Program',
    description: 'Grow your customer base with a built-in referral and rewards system.',
  },
  priceAlerts: {
    label: 'Price Alerts',
    description: 'Let customers set rate alerts and get notified when gold prices drop.',
  },
  digitalBilling: {
    label: 'Digital Invoicing',
    description: 'Generate and share professional digital invoices with your customers.',
  },
  razorpayPayments: {
    label: 'Online Payments',
    description: 'Accept booking advances and payments online via Razorpay integration.',
  },
  oldGoldExchange: {
    label: 'Old Gold Exchange',
    description: 'Estimate old gold value and manage exchange quotes in-store.',
  },
  appointments: {
    label: 'Appointments',
    description: 'Let customers book store visits and manage your appointment calendar.',
  },
  offers: {
    label: 'Offers & Promotions',
    description: 'Create seasonal offers and promotional banners for your catalog.',
  },
  customRequests: {
    label: 'Custom Requests',
    description: 'Accept custom jewellery design requests with images from customers.',
  },
  chat: {
    label: 'Live Chat',
    description: 'Chat directly with customers through the mobile app in real time.',
  },
  curatedBoards: {
    label: 'Curated Boards',
    description: 'Create themed collections and showcase curated product boards.',
  },
  hallmark: {
    label: 'Hallmark Verification',
    description: 'Track and display BIS hallmark certification on your catalog items.',
  },
  storeMode: {
    label: 'Store Mode',
    description: 'Turn any tablet into a self-serve catalog kiosk for your showroom.',
  },
};

function DisabledModuleFallback({ flag }: { flag: string }) {
  const info = FEATURE_LABELS[flag];
  const label = info?.label ?? flag;
  const description = info?.description ?? 'This module is not included in your current plan.';

  return (
    <div className="group relative overflow-hidden rounded-xl border border-dashed border-[var(--color-border,#D9D3C7)] bg-gradient-to-br from-[var(--color-surface,#fff)] to-[var(--color-background,#F7F5F0)] p-5 transition-all duration-300 hover:border-[#C9A227]/40 hover:shadow-md">
      {/* Decorative corner gradient */}
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#C9A227]/5 transition-transform duration-300 group-hover:scale-150" />

      <div className="relative flex items-start gap-4">
        {/* Lock icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#C9A227]/10 text-[#C9A227] transition-colors duration-200 group-hover:bg-[#C9A227]/15">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          {/* Feature name + badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary,#14201C)]">
              {label}
            </h4>
            <span className="rounded-full bg-[#C9A227]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C9A227]">
              Premium
            </span>
          </div>

          {/* Description */}
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary,#5A6B65)]">
            {description}
          </p>

          {/* CTA link */}
          <Link
            href="/forbidden"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary,#1F4B3F)] transition-colors duration-150 hover:text-[#C9A227]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Learn how to unlock this feature
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FeatureGate({
  flag,
  children,
  fallback,
}: {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { features } = useAuth();
  if (!features) return <>{fallback ?? <DisabledModuleFallback flag={flag} />}</>;
  const enabled = Boolean(features[flag]);
  if (!enabled) return <>{fallback ?? <DisabledModuleFallback flag={flag} />}</>;
  return <>{children}</>;
}

export function OwnerOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { admin } = useAuth();
  if (admin?.role !== 'owner') {
    return (
      <>
        {fallback ?? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-border,#D9D3C7)] bg-[var(--color-surface,#fff)] p-4 text-sm">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#1F4B3F)]/10 text-[var(--color-primary,#1F4B3F)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-[var(--color-text-secondary,#5A6B65)]">
              Owner role required.{' '}
              <Link href="/forbidden" className="font-medium text-[var(--color-primary,#1F4B3F)] underline-offset-2 hover:underline">
                Details
              </Link>
            </span>
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}
