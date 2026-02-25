"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Target, Map, Package, Layers, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphNodeType } from "@/lib/actions/graph";

const NODE_STYLES: Record<
  GraphNodeType,
  { bg: string; border: string; icon: typeof Target; label: string }
> = {
  objective: {
    bg: "bg-purple-950/50",
    border: "border-purple-700/50",
    icon: Target,
    label: "Objective",
  },
  initiative: {
    bg: "bg-blue-950/50",
    border: "border-blue-700/50",
    icon: Map,
    label: "Initiative",
  },
  epic: {
    bg: "bg-green-950/50",
    border: "border-green-700/50",
    icon: Package,
    label: "Epic",
  },
  feature: {
    bg: "bg-cyan-950/50",
    border: "border-cyan-700/50",
    icon: Layers,
    label: "Feature",
  },
  problem: {
    bg: "bg-amber-950/50",
    border: "border-amber-700/50",
    icon: AlertTriangle,
    label: "Problem",
  },
  signal: {
    bg: "bg-gray-900/50",
    border: "border-gray-600/50",
    icon: MessageSquare,
    label: "Signal",
  },
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-gray-400",
  draft: "bg-gray-400",
  shaped: "bg-blue-400",
  proposed: "bg-yellow-400",
  accepted: "bg-green-400",
  rejected: "bg-red-400",
  committed: "bg-blue-400",
  "in-progress": "bg-yellow-400",
  done: "bg-green-400",
  processed: "bg-blue-400",
  discarded: "bg-red-400",
};

export interface GraphNodeData {
  nodeType: GraphNodeType;
  label: string;
  status: string | null;
  isOrphan: boolean;
  entityId: string;
  meta: Record<string, unknown>;
  [key: string]: unknown;
}

function GraphNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as GraphNodeData;
  const style = NODE_STYLES[nodeData.nodeType];
  const Icon = style.icon;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div
        className={cn(
          "rounded-lg border px-3 py-2 min-w-[140px] max-w-[200px] shadow-sm transition-all",
          style.bg,
          style.border,
          selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
          nodeData.isOrphan &&
            "ring-2 ring-red-500/70 ring-offset-1 ring-offset-background animate-pulse"
        )}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {style.label}
          </span>
          {nodeData.status && (
            <span
              className={cn(
                "ml-auto h-2 w-2 rounded-full shrink-0",
                STATUS_DOT[nodeData.status] ?? "bg-gray-400"
              )}
              title={nodeData.status}
            />
          )}
        </div>
        <p className="text-xs font-medium leading-tight line-clamp-2 text-foreground">
          {nodeData.label}
        </p>
        {nodeData.isOrphan && (
          <Badge
            variant="outline"
            className="mt-1.5 text-[9px] border-red-500/50 text-red-400 px-1 py-0"
          >
            Missing links
          </Badge>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </>
  );
}

export const CustomGraphNode = memo(GraphNodeComponent);
