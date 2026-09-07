import { PageHeader } from '@/components/PageHeader';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Profile, password, and feature modules." />
      <SettingsPanel />
    </div>
  );
}
