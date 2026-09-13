'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LegalShell } from '@/components/legal/LegalShell';
import {
  analyticsCookiesAllowed,
  getCookieConsent,
  setCookieConsent,
} from '@/components/legal/CookieConsentBanner';

export default function CookiePreferencesClient() {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setAnalytics(analyticsCookiesAllowed());
    setConsent(getCookieConsent());
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setCookieConsent(analytics ? 'accepted' : 'essential_only', analytics);
    setConsent(analytics ? 'accepted' : 'essential_only');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <LegalShell title="Cookie preferences">
      <p className="text-[var(--color-text-secondary,#5A6B65)]">
        Essential cookies (admin session) are always required. Optional analytics
        cookies are <strong className="text-[var(--color-text-primary,#14201C)]">off by default</strong> and
        must not load until you enable them below.
      </p>

      {/* Current status badge */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border,#D9D3C7)] bg-[var(--color-background,#F7F5F0)] px-4 py-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${consent ? 'bg-[var(--color-success,#2E7D32)]' : 'bg-[var(--color-warning,#ED6C02)]'}`} />
        <span className="text-[var(--color-text-secondary,#5A6B65)]">
          Current consent:{' '}
          <span className="font-medium text-[var(--color-text-primary,#14201C)]">
            {consent === 'accepted' ? 'All accepted' : consent === 'essential_only' ? 'Essential only' : 'Not set'}
          </span>
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {/* Essential cookie card */}
        <div className="rounded-xl border border-[var(--color-border,#D9D3C7)] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#1F4B3F)]/10 text-[var(--color-primary,#1F4B3F)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary,#14201C)]">
                  Essential cookies
                </h3>
                <span className="rounded-full bg-[var(--color-primary,#1F4B3F)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary,#1F4B3F)]">
                  Always on
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary,#5A6B65)]">
                Session flag for authenticated admin routes. Required to keep you signed in securely.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics cookie card */}
        <label className="block cursor-pointer rounded-xl border border-[var(--color-border,#D9D3C7)] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[var(--color-primary,#1F4B3F)]/30 hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A227]/10 text-[#C9A227]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary,#14201C)]">
                  Analytics cookies
                </h3>
                {/* Custom toggle */}
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <div className={`h-6 w-11 rounded-full transition-colors duration-200 ${analytics ? 'bg-[var(--color-primary,#1F4B3F)]' : 'bg-gray-200'}`}>
                    <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${analytics ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary,#5A6B65)]">
                Optional usage analytics. Only active if the Shop later adds a consented script.
                No analytics script ships in the default template.
              </p>
            </div>
          </div>
        </label>

        {/* Save button + status */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-primary,#1F4B3F)] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[var(--color-primary,#1F4B3F)]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-primary,#1F4B3F)]/30 active:scale-[0.98]"
          >
            Save preferences
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-success,#2E7D32)]" role="status">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Preferences saved
            </div>
          )}
        </div>
      </form>
    </LegalShell>
  );
}
