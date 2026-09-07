import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function CatalogHubPage() {
  return (
    <div>
      <PageHeader title="Catalog" description="Manage categories and jewellery items." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/catalog/categories"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-primary)]"
        >
          <h2 className="font-display text-xl">Categories</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Root categories, subcategories, cover images, soft-delete.
          </p>
        </Link>
        <Link
          href="/catalog/items"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-primary)]"
        >
          <h2 className="font-display text-xl">Items</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Create and edit pieces, media, status, archive and restore.
          </p>
        </Link>
      </div>
    </div>
  );
}
