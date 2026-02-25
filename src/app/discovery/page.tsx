import { PageHeader } from "@/components/layout/page-header";
import { DiscoveryBoard } from "@/components/discovery/discovery-board";
import { getSignals } from "@/lib/actions/signals";
import { getProblems } from "@/lib/actions/problems";

export default async function DiscoveryPage() {
  const [signals, problems] = await Promise.all([
    getSignals(),
    getProblems(),
  ]);

  return (
    <div>
      <PageHeader
        title="Discovery"
        description="Capture signals, validate problems — from observation to alignment"
      />
      <DiscoveryBoard signals={signals} problems={problems} />
    </div>
  );
}
