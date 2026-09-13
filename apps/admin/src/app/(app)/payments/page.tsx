'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { PaymentsAdmin } from '@/components/payments/PaymentsAdmin';

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" description="Razorpay advances and booking payments." />
      <FeatureGate
        flag="razorpayPayments"
        fallback={
          <EmptyState
            title="Payments is off"
            description="Enable FEATURE_RAZORPAY_PAYMENTS for this client."
          />
        }
      >
        <PaymentsAdmin />
      </FeatureGate>
    </div>
  );
}
