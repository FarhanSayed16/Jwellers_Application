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

  useEffect(() => {
    setAnalytics(analyticsCookiesAllowed());
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setCookieConsent(analytics ? 'accepted' : 'essential_only', analytics);
    setSaved(true);
  }

  return (
    <LegalShell title="Cookie preferences">
      <p>
        Essential cookies (admin session) are always required to use the retailer admin site.
        Optional analytics cookies are <strong>off by default</strong> and must not load until you
        enable them below (and a marketing script is configured).
      </p>
      <p className="text-xs text-[var(--color-text-secondary)]">
        Current consent: {getCookieConsent() ?? 'not set'}
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked disabled className="mt-1" />
          <span>
            <strong>Essential</strong> — session flag for authenticated admin routes (always on).
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
          />
          <span>
            <strong>Analytics</strong> — optional usage analytics (only if the Shop later adds a
            consented script). No script ships in the default template.
          </span>
        </label>
        <button
          type="submit"
          className="rounded bg-[var(--color-primary,#1F4B3F)] px-4 py-2 text-sm text-white"
        >
          Save preferences
        </button>
        {saved ? (
          <p className="text-sm text-[var(--color-success,#2E7D32)]" role="status">
            Preferences saved.
          </p>
        ) : null}
      </form>
    </LegalShell>
  );
}
