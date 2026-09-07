import { PageHeader } from '@/components/PageHeader';
import { EnquiriesInbox } from '@/components/leads/EnquiriesInbox';

export default function EnquiriesPage() {
  return (
    <div>
      <PageHeader title="Enquiries" description="Customer leads inbox — status and assignment." />
      <EnquiriesInbox />
    </div>
  );
}
