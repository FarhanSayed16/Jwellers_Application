'use client';

import { PageHeader, EmptyState } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { BoardsAdmin } from '@/components/boards/BoardsAdmin';

export default function BoardsPage() {
  return (
    <div>
      <PageHeader title="Curated boards" description="Home occasion rows for the customer app." />
      <FeatureGate
        flag="curatedBoards"
        fallback={
          <EmptyState
            title="Curated boards are off"
            description="Enable FEATURE_CURATED_BOARDS for this client."
          />
        }
      >
        <BoardsAdmin />
      </FeatureGate>
    </div>
  );
}
