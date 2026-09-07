import { PageHeader } from '@/components/PageHeader';
import { OwnerGuard } from '@/components/OwnerGuard';
import { BrandingForm } from '@/components/branding/BrandingForm';

export default function BrandingPage() {
  return (
    <OwnerGuard>
      <PageHeader
        title="Branding"
        description="Shop identity, themes, defaults, and social links. Owner only."
      />
      <BrandingForm />
    </OwnerGuard>
  );
}
