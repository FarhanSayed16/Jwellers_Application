'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'jwellers_cookie_consent';
const ANALYTICS_KEY = 'jwellers_analytics_cookies';

export type CookieConsentValue = 'accepted' | 'essential_only' | null;

export function getCookieConsent(): CookieConsentValue {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'accepted' || v === 'essential_only') return v;
  return null;
}

export function analyticsCookiesAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ANALYTICS_KEY) === '1' && getCookieConsent() === 'accepted';
}

export function setCookieConsent(value: 'accepted' | 'essential_only', analytics: boolean) {
  localStorage.setItem(CONSENT_KEY, value);
  localStorage.setItem(ANALYTICS_KEY, analytics ? '1' : '0');
  window.dispatchEvent(new Event('jwellers-cookie-consent'));
}

/**
 * Essential-first banner. Analytics stay OFF unless user opts in via Preferences.
 * Safe to show even when no marketing scripts exist yet.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border,#D9D3C7)] bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-primary,#14201C)]">
          We use an essential session cookie for admin login.{' '}
          <Link href="/legal/cookies" className="underline underline-offset-2">
            Cookie policy
          </Link>
          . Optional analytics cookies stay off unless you enable them.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/legal/cookie-preferences"
            className="rounded border border-[var(--color-border,#D9D3C7)] px-3 py-2"
          >
            Preferences
          </Link>
          <button
            type="button"
            className="rounded border border-[var(--color-border,#D9D3C7)] px-3 py-2"
            onClick={() => {
              setCookieConsent('essential_only', false);
              setVisible(false);
            }}
          >
            Essential only
          </button>
          <button
            type="button"
            className="rounded bg-[var(--color-primary,#1F4B3F)] px-3 py-2 text-white"
            onClick={() => {
              setCookieConsent('accepted', false);
              setVisible(false);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
