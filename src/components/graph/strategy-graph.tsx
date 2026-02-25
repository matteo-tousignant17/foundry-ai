"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CustomGraphNode, type GraphNodeData } from "./graph-node";
import { GraphFilters } from "./graph-filters";
import { NodeDetailPanel } from "./node-detail-panel";
import ELK from "elkjs/lib/elk.bundled.js";
import type { GraphData, GraphNode as GNode, GraphNodeType } from "@/lib/actions/graph";

// ─── Layout ─────────────────────────────────────────────

const NODE_WIDTH = 170;
const NODE_HEIGHT = 70;

const EDGE_COLORS: Record<string, string> = {
  aligns_to: "#a855f7",
  contains: "#06b6d4",
  justified_by: "#f59e0b",
  derived_from: "#6b7280",
};

const elk = new ELK();

async function getLayoutedElements(
  graphNodes: GNode[],
  graphEdges: GraphData["edges"]
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "30",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.padding": "[top=40,left=40,bottom=40,right=40]",
    },
    children: graphNodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: graphEdges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layouted = await elk.layout(elkGraph);

  const posMap = new Map<string, { x: number; y: number }>();
  for (const child of layouted.children ?? []) {
    posMap.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  const nodes: Node[] = graphNodes.map((node) => {
    const pos = posMap.get(node.id) ?? { x: 0, y: 0 };
    return {
      id: node.id,
      type: "graphNode",
      position: { x: pos.x, y: pos.y },
      data: {
        nodeType: node.type,
        label: node.label,
        status: node.status,
        isOrphan: node.isOrphan,
        entityId: node.entityId,
        meta: node.meta,
      } satisfies GraphNodeData,
    };
  });

  const edges: Edge[] = graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "default",
    animated: edge.type === "justified_by",
    style: { stroke: EDGE_COLORS[edge.type] ?? "#6b7280", strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 12,
      height: 12,
      color: EDGE_COLORS[edge.type] ?? "#6b7280",
    },
    label: edge.type.replace("_", " "),
    labelStyle: { fontSize: 9, fill: "#9ca3af" },
    labelBgStyle: { fill: "transparent" },
  }));

  return { nodes, edges };
}

// ─── Component ──────────────────────────────────────────

const nodeTypes = { graphNode: CustomGraphNode };

interface StrategyGraphProps {
  data: GraphData;
}

export function StrategyGraph({ data }: StrategyGraphProps) {
  // Filters
  const allObjectives = useMemo(
    () =>
      data.nodes
        .filter((n) => n.type === "objective")
        .map((n) => ({ id: n.entityId, name: n.label })),
    [data.nodes]
  );

  const ALL_TYPES = useMemo(
    () =>
      new Set<GraphNodeType>([
        "objective",
        "initiative",
        "epic",
        "feature",
        "problem",
        "signal",
      ]),
    []
  );
  const ALL_STATUSES = useMemo(
    () => new Set(data.nodes.map((n) => n.status).filter(Boolean) as string[]),
    [data.nodes]
  );

  const [activeTypes, setActiveTypes] = useState<Set<GraphNodeType>>(
    new Set(["objective", "initiative", "epic", "feature", "problem", "signal"])
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [activeObjectives, setActiveObjectives] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);

  // Init statuses from data on mount
  useEffect(() => {
    setActiveStatuses(
      new Set(data.nodes.map((n) => n.status).filter(Boolean) as string[])
    );
  }, [data.nodes]);

  // Filtering logic
  const filteredData = useMemo(() => {
    let filteredNodes = data.nodes.filter((n) => {
      if (!activeTypes.has(n.type)) return false;
      if (n.status && activeStatuses.size > 0 && !activeStatuses.has(n.status))
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!n.label.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // If objective filter is active, show only nodes connected to those objectives
    if (activeObjectives.size > 0) {
      const objectiveNodeIds = new Set(
        data.nodes
          .filter(
            (n) => n.type === "objective" && activeObjectives.has(n.entityId)
          )
          .map((n) => n.id)
      );

      const connectedIds = new Set<string>(objectiveNodeIds);
      let changed = true;
      while (changed) {
        changed = false;
        for (const edge of data.edges) {
          if (connectedIds.has(edge.target) && !connectedIds.has(edge.source)) {
            connectedIds.add(edge.source);
            changed = true;
          }
          if (connectedIds.has(edge.source) && !connectedIds.has(edge.target)) {
            connectedIds.add(edge.target);
            changed = true;
          }
        }
      }

      filteredNodes = filteredNodes.filter((n) => connectedIds.has(n.id));
    }

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [data, activeTypes, activeStatuses, activeObjectives, searchQuery]);

  // Layout (async because dagre is dynamically imported)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    let cancelled = false;
    getLayoutedElements(filteredData.nodes, filteredData.edges).then(
      ({ nodes: n, edges: e }) => {
        if (!cancelled) {
          setNodes(n);
          setEdges(e);
          setLayoutReady(true);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [filteredData, setNodes, setEdges]);

  // Selection
  const selectedNode = useMemo(
    () => data.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [data.nodes, selectedNodeId]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Filter toggles
  function toggleType(type: GraphNodeType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function toggleStatus(status: string) {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function toggleObjective(id: string) {
    setActiveObjectives((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setActiveTypes(new Set(ALL_TYPES));
    setActiveStatuses(new Set(ALL_STATUSES));
    setActiveObjectives(new Set());
    setSearchQuery("");
  }

  const hasActiveFilters =
    activeTypes.size !== ALL_TYPES.size ||
    activeStatuses.size !== ALL_STATUSES.size ||
    activeObjectives.size > 0 ||
    searchQuery.length > 0;

  return (
    <div className="h-full rounded-lg border overflow-hidden">
      <GraphFilters
        objectives={allObjectives}
        activeObjectives={activeObjectives}
        onToggleObjective={toggleObjective}
        activeTypes={activeTypes}
        onToggleType={toggleType}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={75} minSize={50}>
          {!layoutReady ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Computing layout...
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              colorMode="dark"
              className="bg-background"
            >
              <Background gap={20} size={1} />
              <Controls
                showInteractive={false}
                className="!bg-muted !border-border !shadow-sm [&>button]:!bg-muted [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent"
              />
              <MiniMap
                nodeColor={(node) => {
                  const d = node.data as GraphNodeData;
                  const colors: Record<string, string> = {
                    objective: "#a855f7",
                    initiative: "#3b82f6",
                    epic: "#22c55e",
                    feature: "#06b6d4",
                    problem: "#f59e0b",
                    signal: "#6b7280",
                  };
                  return colors[d.nodeType] ?? "#6b7280";
                }}
                maskColor="rgba(0,0,0,0.6)"
                className="!bg-muted/80 !border-border"
              />
              {filteredData.nodes.length === 0 && (
                <Panel position="top-center">
                  <div className="mt-20 text-center text-sm text-muted-foreground">
                    No nodes match your filters
                  </div>
                </Panel>
              )}
            </ReactFlow>
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <NodeDetailPanel
            node={selectedNode}
            allNodes={data.nodes}
            edges={data.edges}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
