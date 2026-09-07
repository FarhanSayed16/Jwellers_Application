import { PageHeader } from '@/components/PageHeader';
import { ItemForm } from '@/components/catalog/ItemForm';

export default function NewItemPage() {
  return (
    <div>
      <PageHeader title="Add item" description="Create a catalog piece with media and pricing fields." />
      <ItemForm />
    </div>
  );
}
