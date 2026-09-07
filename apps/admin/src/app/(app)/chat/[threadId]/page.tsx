import { PageHeader } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { ChatInbox } from '../ChatInbox';

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return (
    <FeatureGate flag="chat">
      <div>
        <PageHeader
          title="Chat"
          description="Customer conversations — poll refreshes every few seconds."
        />
        <ChatInbox initialThreadId={threadId} />
      </div>
    </FeatureGate>
  );
}
