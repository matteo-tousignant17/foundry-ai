export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { PrdList } from "@/components/prds/prd-list";
import { getPrds } from "@/lib/actions/prds";
import { getRoadmapItems } from "@/lib/actions/roadmap-items";

export default async function PrdsPage() {
  const [prds, roadmapItems] = await Promise.all([
    getPrds(),
    getRoadmapItems(),
  ]);

  return (
    <div>
      <PageHeader
        title="PRDs"
        description="Product requirement documents"
      />
      <PrdList
        prds={prds}
        roadmapItems={roadmapItems.map((i) => ({ id: i.id, title: i.title }))}
      />
    </div>
  );
}
