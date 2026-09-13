import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { legalPageMetadata } from '@/lib/legalMeta';

export const metadata: Metadata = legalPageMetadata({
  title: 'Cookie policy | Retailer Legal',
  description:
    'Cookies used by the retailer admin web app, including the session cookie required for login.',
  path: '/legal/cookies',
});

export default function CookiePolicyPage() {
  return (
    <LegalShell title="Cookie policy">
      <p>
        This policy applies to the <strong>retailer admin website</strong> (Next.js). The customer
        Flutter app does not use browser cookies.
      </p>

      <h2>Essential cookies</h2>
      <ul>
        <li>
          <code>jwellers_admin_session</code> — short flag that the browser has an admin session so
          middleware can protect private routes. Set on successful login; cleared on logout.
        </li>
      </ul>
      <p>
        Access and refresh tokens for the admin API are stored in browser{' '}
        <code>localStorage</code> for the current MVP (documented risk). Prefer rotating to
        httpOnly cookies in a future hardening pass.
      </p>

      <h2>Analytics / advertising cookies</h2>
      <p>
        By default this template does <strong>not</strong> load Google Analytics, Meta Pixel, or
        similar. If a Shop adds marketing analytics later, a consent banner and preference control
        must be added before non-essential cookies are set.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can clear site cookies and local storage from your browser settings. Clearing them will
        sign you out of admin. Or open{' '}
        <a className="underline" href="/legal/cookie-preferences">
          Cookie preferences
        </a>{' '}
        to choose essential-only vs optional analytics.
      </p>

      <h2>Related</h2>
      <ul>
        <li>
          <a className="underline" href="/legal/privacy">
            Privacy policy
          </a>
        </li>
      </ul>
    </LegalShell>
  );
}
