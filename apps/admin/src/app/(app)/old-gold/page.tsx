'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { OldGoldAdmin } from '@/components/oldGold/OldGoldAdmin';

export default function OldGoldPage() {
  return (
    <div>
      <PageHeader title="Old-gold exchange" description="Deduction percent for exchange estimates." />
      <FeatureGate
        flag="oldGoldExchange"
        fallback={
          <EmptyState
            title="Old-gold exchange is off"
            description="Enable FEATURE_OLD_GOLD_EXCHANGE for this client."
          />
        }
      >
        <OldGoldAdmin />
      </FeatureGate>
    </div>
  );
}
