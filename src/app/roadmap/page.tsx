export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { RoadmapTable } from "@/components/roadmap/roadmap-table";
import { SuggestionBanner } from "@/components/shared/suggestion-banner";
import { getRoadmapItems } from "@/lib/actions/roadmap-items";
import { getReleases } from "@/lib/actions/releases";
import { getOrphanCounts } from "@/lib/actions/graph";

export default async function RoadmapPage() {
  const [items, orphans, releases] = await Promise.all([
    getRoadmapItems(),
    getOrphanCounts(),
    getReleases(),
  ]);

  const unscoredCount = items.filter((i) => i.score === null).length;
  const orphanItemCount = orphans.initiatives + orphans.epics + orphans.features;

  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="Stack-ranked initiatives, epics, and features"
      />
      <SuggestionBanner
        count={unscoredCount}
        message="roadmap items are unscored. Use AI to suggest RICE scores."
        actionLabel="Score Items"
        actionHref="/roadmap"
      />
      <SuggestionBanner
        count={orphanItemCount}
        message="committed items are missing required links (objectives or problems)."
        actionLabel="View in Graph"
        actionHref="/graph"
      />
      <RoadmapTable items={items} releases={releases} />
    </div>
  );
}
