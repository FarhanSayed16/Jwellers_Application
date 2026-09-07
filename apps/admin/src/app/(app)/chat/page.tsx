import { PageHeader } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { ChatInbox } from './ChatInbox';

export default function ChatPage() {
  return (
    <FeatureGate flag="chat">
      <div>
        <PageHeader
          title="Chat"
          description="Customer conversations — poll refreshes every few seconds."
        />
        <ChatInbox />
      </div>
    </FeatureGate>
  );
}
