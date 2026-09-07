import { EmptyState, PageHeader } from '@/components/PageHeader';

export default function ComingSoon({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        title={`${title} arrives in ${phase}`}
        description="Navigation is ready; this screen will be implemented in the next admin phases."
      />
    </div>
  );
}
