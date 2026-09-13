'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { InvoicesAdmin } from '@/components/billing/InvoicesAdmin';

export default function InvoicesPage() {
  return (
    <div>
      <PageHeader title="Invoices" description="Digital billing estimates and share links." />
      <FeatureGate
        flag="digitalBilling"
        fallback={
          <EmptyState
            title="Digital billing is off"
            description="Enable FEATURE_DIGITAL_BILLING for this client."
          />
        }
      >
        <InvoicesAdmin />
      </FeatureGate>
    </div>
  );
}
