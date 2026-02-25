"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Map,
  Package,
  Layers,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Plus,
  Link2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { GraphNode, GraphEdge, GraphNodeType } from "@/lib/actions/graph";
import {
  linkProblemToRoadmapItem,
  linkObjectiveToRoadmapItem,
  updateRoadmapItem,
} from "@/lib/actions/roadmap-items";
import { cn } from "@/lib/utils";

interface NodeDetailPanelProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  edges: GraphEdge[];
}

const ICONS: Record<GraphNodeType, typeof Target> = {
  objective: Target,
  initiative: Map,
  epic: Package,
  feature: Layers,
  problem: AlertTriangle,
  signal: MessageSquare,
};

const TYPE_COLORS: Record<GraphNodeType, string> = {
  objective: "text-purple-400",
  initiative: "text-blue-400",
  epic: "text-green-400",
  feature: "text-cyan-400",
  problem: "text-amber-400",
  signal: "text-gray-400",
};

function getLinkedNodes(
  nodeId: string,
  edges: GraphEdge[],
  allNodes: GraphNode[]
) {
  const connected = edges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => {
      const otherId = e.source === nodeId ? e.target : e.source;
      const other = allNodes.find((n) => n.id === otherId);
      return other ? { node: other, edgeType: e.type } : null;
    })
    .filter(Boolean) as { node: GraphNode; edgeType: string }[];
  return connected;
}

function getDetailLink(node: GraphNode): string | null {
  switch (node.type) {
    case "objective":
      return "/objectives";
    case "initiative":
    case "epic":
    case "feature":
      return "/roadmap";
    case "problem":
      return `/problems/${node.entityId}`;
    case "signal":
      return "/inbox";
    default:
      return null;
  }
}

export function NodeDetailPanel({ node, allNodes, edges }: NodeDetailPanelProps) {
  const [pending, startTransition] = useTransition();
  const [linkType, setLinkType] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
        <div className="text-center">
          <Link2 className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
          <p>Select a node to see details</p>
        </div>
      </div>
    );
  }

  const Icon = ICONS[node.type];
  const linked = getLinkedNodes(node.id, edges, allNodes);
  const detailLink = getDetailLink(node);

  // Determine what link types can be added
  const canLinkTo: { label: string; type: string; options: GraphNode[] }[] = [];

  if (node.type === "initiative" || node.type === "epic" || node.type === "feature") {
    const linkedProblemIds = new Set(
      linked.filter((l) => l.node.type === "problem").map((l) => l.node.entityId)
    );
    const availableProblems = allNodes.filter(
      (n) => n.type === "problem" && !linkedProblemIds.has(n.entityId)
    );
    if (availableProblems.length > 0) {
      canLinkTo.push({ label: "Link Problem", type: "problem", options: availableProblems });
    }
  }

  if (node.type === "initiative") {
    const linkedObjIds = new Set(
      linked.filter((l) => l.node.type === "objective").map((l) => l.node.entityId)
    );
    const availableObjectives = allNodes.filter(
      (n) => n.type === "objective" && !linkedObjIds.has(n.entityId)
    );
    if (availableObjectives.length > 0) {
      canLinkTo.push({
        label: "Link Objective",
        type: "objective",
        options: availableObjectives,
      });
    }
  }

  if (node.type === "epic") {
    const hasParent = linked.some(
      (l) => l.edgeType === "contains" && l.node.type === "initiative"
    );
    if (!hasParent) {
      const availableInitiatives = allNodes.filter(
        (n) => n.type === "initiative"
      );
      if (availableInitiatives.length > 0) {
        canLinkTo.push({
          label: "Set Parent Initiative",
          type: "parentInitiative",
          options: availableInitiatives,
        });
      }
    }
  }

  if (node.type === "feature") {
    const hasParent = linked.some(
      (l) => l.edgeType === "contains" && l.node.type === "epic"
    );
    if (!hasParent) {
      const availableEpics = allNodes.filter(
        (n) => n.type === "epic"
      );
      if (availableEpics.length > 0) {
        canLinkTo.push({
          label: "Set Parent Epic",
          type: "parentEpic",
          options: availableEpics,
        });
      }
    }
  }

  function handleAddLink() {
    if (!selectedId || !linkType || !node) return;

    startTransition(async () => {
      try {
        if (linkType === "problem") {
          await linkProblemToRoadmapItem(node.entityId, selectedId);
        } else if (linkType === "objective") {
          await linkObjectiveToRoadmapItem(node.entityId, selectedId);
        } else if (linkType === "parentInitiative" || linkType === "parentEpic") {
          await updateRoadmapItem(node.entityId, { parentId: selectedId });
        }
        toast.success("Link added");
        setLinkType(null);
        setSelectedId("");
      } catch {
        toast.error("Failed to add link");
      }
    });
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn("h-4 w-4", TYPE_COLORS[node.type])} />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {node.type}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-tight">{node.label}</h3>
          {node.status && (
            <Badge variant="outline" className="mt-2 text-xs capitalize">
              {node.status}
            </Badge>
          )}
        </div>

        {/* Orphan warning */}
        {node.isOrphan && (
          <div className="rounded-md border border-red-500/30 bg-red-950/30 p-3">
            <p className="text-xs text-red-400 font-medium">
              ⚠ Missing required links
            </p>
            <p className="text-xs text-red-400/70 mt-1">
              {node.type === "problem" &&
                "Accepted problem needs at least one linked Initiative, Epic, or Feature."}
              {node.type === "initiative" &&
                "Committed initiative needs linked Objective(s) and Accepted Problem(s)."}
              {node.type === "epic" &&
                "Committed epic needs a parent Initiative and Accepted Problem(s)."}
              {node.type === "feature" &&
                "Committed feature needs a parent Epic and Accepted Problem(s)."}
            </p>
          </div>
        )}

        {/* Meta */}
        {Object.keys(node.meta).length > 0 && (
          <div className="space-y-1">
            {Object.entries(node.meta).map(([key, value]) =>
              value != null ? (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ) : null
            )}
          </div>
        )}

        <Separator />

        {/* Linked nodes */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Connections ({linked.length})
          </h4>
          {linked.length === 0 ? (
            <p className="text-xs text-muted-foreground">No connections</p>
          ) : (
            <div className="space-y-1.5">
              {linked.map(({ node: linkedNode, edgeType }) => {
                const LIcon = ICONS[linkedNode.type];
                return (
                  <div
                    key={linkedNode.id}
                    className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5"
                  >
                    <LIcon
                      className={cn(
                        "h-3 w-3 shrink-0",
                        TYPE_COLORS[linkedNode.type]
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {linkedNode.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {edgeType.replace("_", " ")}
                      </p>
                    </div>
                    {linkedNode.isOrphan && (
                      <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add link controls */}
        {canLinkTo.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Add Link
              </h4>
              <div className="space-y-2">
                {canLinkTo.map((link) => (
                  <div key={link.type}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-7"
                      onClick={() => {
                        setLinkType(linkType === link.type ? null : link.type);
                        setSelectedId("");
                      }}
                    >
                      <Plus className="mr-1.5 h-3 w-3" />
                      {link.label}
                    </Button>
                    {linkType === link.type && (
                      <div className="mt-1.5 space-y-1.5">
                        <Select value={selectedId} onValueChange={setSelectedId}>
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {link.options.map((opt) => (
                              <SelectItem key={opt.entityId} value={opt.entityId}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={handleAddLink}
                          disabled={!selectedId || pending}
                        >
                          {pending ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <Link2 className="mr-1.5 h-3 w-3" />
                          )}
                          Confirm
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Open detail link */}
        {detailLink && (
          <>
            <Separator />
            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
              <Link href={detailLink}>
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Open Detail
              </Link>
            </Button>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
