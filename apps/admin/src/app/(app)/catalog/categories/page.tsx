import { PageHeader } from '@/components/PageHeader';
import { CategoryManager } from '@/components/catalog/CategoryManager';

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader title="Categories" description="Two-level tree: category → subcategory." />
      <CategoryManager />
    </div>
  );
}
