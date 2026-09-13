import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { legalPageMetadata } from '@/lib/legalMeta';

export const metadata: Metadata = legalPageMetadata({
  title: 'Support | Retailer Legal',
  description: 'How to contact the jewellery shop for app support, account help, and store enquiries.',
  path: '/legal/support',
});

export default function SupportPage() {
  return (
    <LegalShell title="Support">
      <p>
        This white-label app is operated by the jewellery retailer (the <strong>Shop</strong>).
        For customer help, contact the Shop directly — not the platform template vendor.
      </p>

      <h2>Customers (mobile app)</h2>
      <ul>
        <li>Use in-app Chat (if enabled) or Enquire on an item</li>
        <li>WhatsApp / phone from the Shop’s About or contact strip in the app</li>
        <li>Play Store listing “support email” (when published)</li>
        <li>
          Or email the address configured as <code>LEGAL_SUPPORT_EMAIL</code> on the Shop’s API
        </li>
      </ul>

      <h2>Retailer staff (admin)</h2>
      <ul>
        <li>Owner/staff login issues: contact your implementation partner under AMC</li>
        <li>Hosting / SMS wallet / Play Console: Client-owned vendor accounts (see handoff pack)</li>
      </ul>

      <h2>Account deletion</h2>
      <p>
        Prefer <a className="underline" href="/legal/delete-account">Delete account</a> instructions
        or the in-app Account → Delete account flow.
      </p>

      <h2>Response expectations</h2>
      <p>
        Store enquiries and chat are answered by Shop staff during business hours. Platform AMC
        SLAs (if purchased) cover software defects, not product stock or gold rate disputes.
      </p>
    </LegalShell>
  );
}
