import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { legalPageMetadata } from '@/lib/legalMeta';

export const metadata: Metadata = legalPageMetadata({
  title: 'Terms of use | Retailer Legal',
  description:
    'Terms for using the jewellery shop catalogue and enquiry app. Rates are indicative unless invoiced.',
  path: '/legal/terms',
});

export default function TermsOfUsePage() {
  return (
    <LegalShell title="Terms of use">
      <p>
        By using this customer app you agree to these terms with the jewellery retailer (the{' '}
        <strong>Shop</strong>).
      </p>

      <h2>Catalogue & rates</h2>
      <p>
        Product listings, weights, and making charges are provided by the Shop for browsing and
        enquiry. Displayed gold/silver rates and calculated quotes are <strong>indicative</strong>{' '}
        unless the Shop issues a formal invoice. Stock is not guaranteed.
      </p>

      <h2>Hallmark</h2>
      <p>
        When hallmark / HUID information is shown, it is as provided by the Shop. Confirm HUID on
        the official BIS Care app or portal before purchase. This app does not independently
        certify hallmark authenticity.
      </p>

      <h2>Conduct</h2>
      <p>
        Do not abuse OTP, spam chat/enquiries, or upload unlawful content. The Shop may suspend
        access for misuse.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, the Shop and platform providers are not liable for
        indirect losses arising from use of the catalogue or message features. Purchase contracts
        are between you and the Shop.
      </p>

      <h2>Changes</h2>
      <p>
        Terms may be updated; continued use after posting changes constitutes acceptance of the
        updated terms where permitted by law.
      </p>
    </LegalShell>
  );
}
