export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { ProblemList } from "@/components/problems/problem-list";
import { SuggestionBanner } from "@/components/shared/suggestion-banner";
import { getProblems } from "@/lib/actions/problems";
import { getSignals } from "@/lib/actions/signals";
import { getOrphanCounts } from "@/lib/actions/graph";

export default async function ProblemsPage() {
  const [problems, signals, orphans] = await Promise.all([
    getProblems(),
    getSignals(),
    getOrphanCounts(),
  ]);

  const newSignalCount = signals.filter((s) => s.status === "new").length;

  return (
    <div>
      <PageHeader
        title="Problems"
        description="Evidence-backed problem statements"
      />
      <SuggestionBanner
        count={newSignalCount}
        message="new signals could generate problems. Analyze them to extract evidence."
        actionLabel="Review Inbox"
        actionHref="/inbox"
      />
      <SuggestionBanner
        count={orphans.problems}
        message="accepted problems have no linked roadmap item."
        actionLabel="View in Graph"
        actionHref="/graph"
      />
      <ProblemList problems={problems} />
    </div>
  );
}
