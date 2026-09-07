'use client';

import { PageHeader } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { CustomRequestsInbox } from '@/components/leads/CustomRequestsInbox';
import { EmptyState } from '@/components/PageHeader';

export default function CustomRequestsPage() {
  return (
    <div>
      <PageHeader title="Custom requests" description="Bespoke enquiry workflow." />
      <FeatureGate
        flag="customRequests"
        fallback={
          <EmptyState
            title="Custom requests is off"
            description="This module is disabled for this client."
          />
        }
      >
        <CustomRequestsInbox />
      </FeatureGate>
    </div>
  );
}
