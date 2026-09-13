import type { Metadata } from 'next';
import { legalPageMetadata } from '@/lib/legalMeta';
import CookiePreferencesClient from '@/components/legal/CookiePreferencesClient';

export const metadata: Metadata = legalPageMetadata({
  title: 'Cookie preferences | Retailer Legal',
  description: 'Choose essential vs optional analytics cookies for the retailer admin website.',
  path: '/legal/cookie-preferences',
});

export default function CookiePreferencesPage() {
  return <CookiePreferencesClient />;
}
