'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { AppointmentsAdmin } from '@/components/appointments/AppointmentsAdmin';

export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader title="Appointments" description="Store visit bookings." />
      <FeatureGate
        flag="appointments"
        fallback={
          <EmptyState
            title="Appointments are off"
            description="Enable FEATURE_APPOINTMENTS for this client."
          />
        }
      >
        <AppointmentsAdmin />
      </FeatureGate>
    </div>
  );
}
