import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { legalPageMetadata } from '@/lib/legalMeta';

export const metadata: Metadata = legalPageMetadata({
  title: 'Delete account | Retailer Legal',
  description: 'How to delete your customer account and personal data from the jewellery shop app.',
  path: '/legal/delete-account',
});

export default function DeleteAccountWebPage() {
  return (
    <LegalShell title="Delete account / personal data">
      <p>
        Google Play requires a clear way to request account and data deletion. Use either path
        below.
      </p>

      <h2>In the mobile app (fastest)</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Open the app and sign in with OTP.</li>
        <li>Go to <strong>Account → Delete account</strong>.</li>
        <li>Read the notice, type <strong>DELETE</strong>, and confirm.</li>
      </ol>
      <p>
        This anonymizes your phone number, revokes sessions, deactivates push tokens, and clears
        your wishlist. You can create a new account later with the same phone.
      </p>

      <h2>Without the app (web / email)</h2>
      <p>
        Email the Shop support address from the Play listing with subject{' '}
        <strong>“Delete my account”</strong> and include the phone number used to sign in. We aim
        to complete deletion within <strong>30 days</strong> of a verified request.
      </p>

      <h2>What we may retain</h2>
      <p>
        Business records such as invoices (if digital billing is enabled) or enquiry/chat history
        needed for legal or tax purposes may be retained as required by applicable law, without
        keeping your phone number as an active login.
      </p>
    </LegalShell>
  );
}
