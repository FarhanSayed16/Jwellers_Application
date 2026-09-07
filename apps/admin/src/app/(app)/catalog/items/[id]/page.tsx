import { PageHeader } from '@/components/PageHeader';
import { ItemForm } from '@/components/catalog/ItemForm';

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageHeader title="Edit item" description={`Item ID ${id}`} />
      <ItemForm itemId={id} />
    </div>
  );
}
