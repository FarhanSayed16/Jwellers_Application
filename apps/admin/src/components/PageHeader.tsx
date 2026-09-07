import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
      <h3 className="font-display text-lg text-[var(--color-text-primary)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
