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
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  function dismiss(action: () => void) {
    setClosing(true);
    setTimeout(() => {
      action();
      setVisible(false);
    }, 300);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-out ${
        closing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Frosted glass backdrop */}
      <div className="border-t border-white/20 bg-gradient-to-r from-[#1a3a30]/95 via-[#1F4B3F]/95 to-[#1a3a30]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Icon + Text */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A227]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/95">
                  We value your privacy
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                  We use an essential session cookie for admin login.{' '}
                  <Link
                    href="/legal/cookies"
                    className="text-[#C9A227] underline underline-offset-2 transition-colors hover:text-[#e0c35a]"
                  >
                    Cookie policy
                  </Link>
                  . Optional analytics cookies stay off unless you enable them.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <Link
                href="/legal/cookie-preferences"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Preferences
              </Link>
              <button
                type="button"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white"
                onClick={() =>
                  dismiss(() => setCookieConsent('essential_only', false))
                }
              >
                Essential only
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#C9A227] px-5 py-2.5 text-xs font-semibold text-[#1a1a0a] shadow-lg shadow-[#C9A227]/20 transition-all duration-200 hover:bg-[#e0c35a] hover:shadow-[#C9A227]/30 active:scale-[0.97]"
                onClick={() =>
                  dismiss(() => setCookieConsent('accepted', false))
                }
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
