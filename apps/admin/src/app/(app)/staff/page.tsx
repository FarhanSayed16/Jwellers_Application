import { PageHeader } from '@/components/PageHeader';
import { OwnerGuard } from '@/components/OwnerGuard';
import { StaffManager } from '@/components/staff/StaffManager';

export default function StaffPage() {
  return (
    <OwnerGuard>
      <PageHeader title="Staff" description="Create and deactivate staff accounts. Owner only." />
      <StaffManager />
    </OwnerGuard>
  );
}
