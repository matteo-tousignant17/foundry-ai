import { PageHeader } from "@/components/layout/page-header";
import { GraphLoader } from "@/components/graph/graph-loader";
import { getGraphData } from "@/lib/actions/graph";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const data = await getGraphData();

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <PageHeader
        title="Strategy Graph"
        description="Visualize how objectives, roadmap items, problems, and signals connect"
      />
      <div className="flex-1 min-h-0 mt-4">
        <GraphLoader data={data} />
      </div>
    </div>
  );
}
