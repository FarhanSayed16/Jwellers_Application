'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { AnalyticsAdmin } from '@/components/analytics/AnalyticsAdmin';

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Views, wishlists, enquiries, and most-viewed items." />
      <FeatureGate
        flag="analytics"
        fallback={
          <EmptyState
            title="Analytics is off"
            description="Enable FEATURE_ANALYTICS for this client."
          />
        }
      >
        <AnalyticsAdmin />
      </FeatureGate>
    </div>
  );
}
