import { PageHeader } from '@/components/PageHeader';
import { RateForm } from '@/components/rates/RateForm';

export default function RatesPage() {
  return (
    <div>
      <PageHeader
        title="Rates"
        description="Publish today’s gold and silver rates. Each save creates a history point."
      />
      <RateForm />
    </div>
  );
}
