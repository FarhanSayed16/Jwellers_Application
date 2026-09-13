import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { legalPageMetadata } from '@/lib/legalMeta';

export const metadata: Metadata = legalPageMetadata({
  title: 'FAQ | Retailer Legal',
  description: 'Common questions about the jewellery shop app: login, rates, wishlist, and account deletion.',
  path: '/legal/faq',
});

export default function FaqPage() {
  return (
    <LegalShell title="Frequently asked questions">
      <h2>How do I log in to the customer app?</h2>
      <p>
        Enter your mobile number and verify the one-time code (OTP) sent by SMS. Dev/demo builds may
        use a fixed test OTP when configured by the Shop.
      </p>

      <h2>Are gold rates a final price?</h2>
      <p>
        Rates shown in the app are set by the Shop and are indicative unless a tax invoice is
        issued. Making charges, GST, and stock availability can change the final amount.
      </p>

      <h2>How do I enquire about a piece?</h2>
      <p>
        Open the item and use Enquire, Chat (if enabled), or WhatsApp. The Shop will respond during
        business hours.
      </p>

      <h2>How do I delete my account?</h2>
      <p>
        In the app: Account → Delete account (confirm as prompted). Or follow{' '}
        <a className="underline" href="/legal/delete-account">
          Delete account
        </a>
        .
      </p>

      <h2>Do you take payment in the app?</h2>
      <p>
        Only if the Shop enabled online advances (Razorpay). Otherwise payment is handled in-store
        or as the Shop instructs.
      </p>

      <h2>Who do I contact for help?</h2>
      <p>
        See <a className="underline" href="/legal/support">Support</a>.
      </p>
    </LegalShell>
  );
}
