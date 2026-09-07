'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { OffersAdmin } from '@/components/offers/OffersAdmin';

export default function OffersPage() {
  return (
    <div>
      <PageHeader title="Offers" description="Promotions and validity windows." />
      <FeatureGate
        flag="offers"
        fallback={<EmptyState title="Offers is off" description="This module is disabled for this client." />}
      >
        <OffersAdmin />
      </FeatureGate>
    </div>
  );
}
