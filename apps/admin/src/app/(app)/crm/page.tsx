'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { CrmAdmin } from '@/components/crm/CrmAdmin';

export default function CrmPage() {
  return (
    <div>
      <PageHeader title="CRM-lite" description="Customer tags and enquiry follow-ups." />
      <FeatureGate
        flag="crmLight"
        fallback={
          <EmptyState title="CRM-lite is off" description="Enable FEATURE_CRM_LIGHT for this client." />
        }
      >
        <CrmAdmin />
      </FeatureGate>
    </div>
  );
}
