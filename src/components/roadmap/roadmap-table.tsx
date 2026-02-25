"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Map as MapIcon,
  Plus,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { ScoreBadge } from "@/components/shared/score-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RoadmapItemForm } from "./roadmap-item-form";
import { ScoreSuggestionSheet } from "./score-suggestion";
import { deleteRoadmapItem, updateRoadmapItem } from "@/lib/actions/roadmap-items";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  targetMonth: string | null;
  effortSize: string | null;
  reach: number | null;
  impact: number | null;
  confidence: number | null;
  effort: number | null;
  score: number | null;
  parentId: string | null;
  releaseId: string | null;
  release: { id: string; name: string } | null;
  roadmapItemProblems: { id: string; problem: { id: string; title: string } }[];
  roadmapItemObjectives: { id: string; objective: { id: string; name: string } }[];
}

interface TreeNode {
  item: RoadmapItem;
  children: TreeNode[];
  depth: number;
}

interface RoadmapTableProps {
  items: RoadmapItem[];
  releases?: { id: string; name: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  proposed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  committed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const TYPE_COLORS: Record<string, string> = {
  initiative: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  epic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  feature: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
};

function buildTree(items: RoadmapItem[]): TreeNode[] {
  const initiativeMap = new Map<string, TreeNode>();
  const epicMap = new Map<string, TreeNode>();
  const orphans: TreeNode[] = [];

  // Pass 1: initiatives (depth 0)
  for (const item of items) {
    if (item.type === "initiative") {
      initiativeMap.set(item.id, { item, children: [], depth: 0 });
    }
  }

  // Pass 2: epics (depth 1) — attach to initiatives
  for (const item of items) {
    if (item.type === "epic") {
      const epicNode: TreeNode = { item, children: [], depth: 1 };
      epicMap.set(item.id, epicNode);
      if (item.parentId && initiativeMap.has(item.parentId)) {
        initiativeMap.get(item.parentId)!.children.push(epicNode);
      } else {
        orphans.push(epicNode);
      }
    }
  }

  // Pass 3: features (depth 2) — attach to epics (or initiatives for legacy)
  for (const item of items) {
    if (item.type === "feature") {
      const featureNode: TreeNode = { item, children: [], depth: 2 };
      if (item.parentId && epicMap.has(item.parentId)) {
        epicMap.get(item.parentId)!.children.push(featureNode);
      } else if (item.parentId && initiativeMap.has(item.parentId)) {
        // Legacy: features still pointing to initiatives
        featureNode.depth = 1;
        initiativeMap.get(item.parentId)!.children.push(featureNode);
      } else {
        orphans.push(featureNode);
      }
    }
  }

  // Sort children by score desc within each level
  function sortChildren(nodes: TreeNode[]) {
    nodes.sort((a, b) => (b.item.score ?? 0) - (a.item.score ?? 0));
    for (const node of nodes) {
      sortChildren(node.children);
    }
  }

  const roots = [...initiativeMap.values()];
  sortChildren(roots);
  sortChildren(orphans);

  return [...roots, ...orphans];
}

function flattenTree(
  nodes: TreeNode[],
  expanded: Set<string>,
  statusFilter: string
): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    // When filtering by status, only show matching items + ancestors
    if (statusFilter !== "all" && !hasMatchingDescendant(node, statusFilter)) {
      continue;
    }

    result.push(node);
    if (expanded.has(node.item.id) && node.children.length > 0) {
      result.push(...flattenTree(node.children, expanded, statusFilter));
    }
  }
  return result;
}

function hasMatchingDescendant(node: TreeNode, status: string): boolean {
  if (node.item.status === status) return true;
  return node.children.some((c) => hasMatchingDescendant(c, status));
}

export function RoadmapTable({ items, releases }: RoadmapTableProps) {
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoadmapItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [scoringItem, setScoringItem] = useState<{ id: string; title: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Start with all initiatives expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initIds = new Set<string>();
    for (const item of items) {
      if (item.type === "initiative" || item.type === "epic") {
        initIds.add(item.id);
      }
    }
    return initIds;
  });

  const initiatives = items
    .filter((i) => i.type === "initiative")
    .map((i) => ({ id: i.id, title: i.title }));

  const epics = items
    .filter((i) => i.type === "epic")
    .map((i) => ({ id: i.id, title: i.title }));

  const tree = useMemo(() => buildTree(items), [items]);
  const flatItems = useMemo(
    () => flattenTree(tree, expanded, filter),
    [tree, expanded, filter]
  );

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteRoadmapItem(id);
      toast.success("Roadmap item deleted");
      setConfirmDelete(null);
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateRoadmapItem(id, { status });
      if ("error" in result && result.error === "gating") {
        toast.error(result.message, {
          action: {
            label: "View in Graph",
            onClick: () => window.location.assign("/graph"),
          },
        });
      } else {
        toast.success(`Status changed to ${status}`);
      }
    });
  }

  function formatMonth(month: string | null) {
    if (!month) return "\u2014";
    const [y, m] = month.split("-");
    const date = new Date(Number(y), Number(m) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  const INDENT: Record<number, string> = {
    0: "pl-2",
    1: "pl-8",
    2: "pl-14",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="proposed">Proposed</TabsTrigger>
            <TabsTrigger value="committed">Committed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {flatItems.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title="No roadmap items"
          description="Add initiatives, epics, and features to build your roadmap"
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Effort</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatItems.map((node) => {
                const item = node.item;
                const hasChildren = node.children.length > 0;
                const isExpanded = expanded.has(item.id);

                return (
                  <TableRow key={item.id} className={cn(node.depth > 0 && "bg-muted/20")}>
                    <TableCell className={INDENT[node.depth] ?? "pl-2"}>
                      <div className="flex items-center gap-1.5">
                        {hasChildren ? (
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="p-0.5 rounded hover:bg-accent shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                        ) : (
                          <span className="w-[18px] shrink-0" />
                        )}
                        <div>
                          <span className="font-medium">{item.title}</span>
                          <div className="flex gap-1 mt-0.5">
                            {item.roadmapItemProblems.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {item.roadmapItemProblems.length} problem{item.roadmapItemProblems.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {item.roadmapItemObjectives.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {item.roadmapItemObjectives.length > 0 && item.roadmapItemProblems.length > 0 && " \u00B7 "}
                                {item.roadmapItemObjectives.length} obj.
                              </span>
                            )}
                            {item.release && (
                              <span className="text-xs text-muted-foreground">
                                {(item.roadmapItemProblems.length > 0 || item.roadmapItemObjectives.length > 0) && " \u00B7 "}
                                {item.release.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TYPE_COLORS[item.type] ?? ""}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[item.status] ?? ""}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatMonth(item.targetMonth)}
                    </TableCell>
                    <TableCell>
                      {item.effortSize && (
                        <Badge variant="outline">{item.effortSize}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ScoreBadge score={item.score} />
                        {item.score === null && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Get AI score suggestion"
                            onClick={() =>
                              setScoringItem({ id: item.id, title: item.title })
                            }
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setScoringItem({ id: item.id, title: item.title })
                            }
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI Score
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(item);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status !== "committed" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(item.id, "committed")}
                            >
                              Mark Committed
                            </DropdownMenuItem>
                          )}
                          {item.status !== "in-progress" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(item.id, "in-progress")}
                            >
                              Mark In Progress
                            </DropdownMenuItem>
                          )}
                          {item.status !== "done" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(item.id, "done")}
                            >
                              Mark Done
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmDelete(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <RoadmapItemForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        defaultValues={editing ?? undefined}
        initiatives={initiatives}
        epics={epics}
        releases={releases}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete Roadmap Item"
        description="This will permanently delete this roadmap item."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        loading={pending}
      />

      <ScoreSuggestionSheet
        itemId={scoringItem?.id ?? ""}
        itemTitle={scoringItem?.title ?? ""}
        open={!!scoringItem}
        onOpenChange={(open) => !open && setScoringItem(null)}
      />
    </>
  );
}
