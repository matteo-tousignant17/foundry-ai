import { PageHeader } from "@/components/layout/page-header";
import { SignalList } from "@/components/signals/signal-list";
import { getSignals } from "@/lib/actions/signals";

export default async function InboxPage() {
  const signals = await getSignals();

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Paste and triage voice-of-customer signals"
      />
      <SignalList signals={signals} />
    </div>
  );
}
