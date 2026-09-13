'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { SchemesAdmin } from '@/components/schemes/SchemesAdmin';

export default function SchemesPage() {
  return (
    <div>
      <PageHeader title="Schemes" description="Making-charge offers for the customer app." />
      <FeatureGate
        flag="schemes"
        fallback={
          <EmptyState title="Schemes are off" description="Enable FEATURE_SCHEMES for this client." />
        }
      >
        <SchemesAdmin />
      </FeatureGate>
    </div>
  );
}
