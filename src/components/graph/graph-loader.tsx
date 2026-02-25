"use client";

import dynamic from "next/dynamic";
import type { GraphData } from "@/lib/actions/graph";

const StrategyGraph = dynamic(
  () =>
    import("@/components/graph/strategy-graph").then((m) => m.StrategyGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Loading graph...
      </div>
    ),
  }
);

export function GraphLoader({ data }: { data: GraphData }) {
  return <StrategyGraph data={data} />;
}
