"use server";

import { db } from "@/lib/db";

// ─── Types ──────────────────────────────────────────────

export type GraphNodeType =
  | "objective"
  | "initiative"
  | "epic"
  | "feature"
  | "problem"
  | "signal";

export type GraphEdgeType =
  | "aligns_to"
  | "contains"
  | "justified_by"
  | "derived_from";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  entityId: string;
  label: string;
  status: string | null;
  isOrphan: boolean;
  meta: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── Orphan detection helpers ───────────────────────────

function isOrphanProblem(
  problemId: string,
  problemStatus: string,
  riLinks: { problemId: string }[]
): boolean {
  if (problemStatus !== "accepted") return false;
  return !riLinks.some((l) => l.problemId === problemId);
}

function isOrphanInitiative(
  itemId: string,
  objLinks: { roadmapItemId: string }[],
  probLinks: { roadmapItemId: string; problem: { status: string } | null }[],
  status: string
): boolean {
  if (status !== "committed" && status !== "in-progress" && status !== "done")
    return false;
  const hasObjective = objLinks.some((l) => l.roadmapItemId === itemId);
  const hasAcceptedProblem = probLinks.some(
    (l) => l.roadmapItemId === itemId && l.problem?.status === "accepted"
  );
  return !hasObjective || !hasAcceptedProblem;
}

function isOrphanEpic(
  item: { id: string; parentId: string | null; status: string },
  probLinks: { roadmapItemId: string; problem: { status: string } | null }[],
  allProbLinks: { roadmapItemId: string; problem: { status: string } | null }[]
): boolean {
  if (
    item.status !== "committed" &&
    item.status !== "in-progress" &&
    item.status !== "done"
  )
    return false;
  if (!item.parentId) return true;
  const directAccepted = probLinks.some(
    (l) => l.roadmapItemId === item.id && l.problem?.status === "accepted"
  );
  const inheritedAccepted = item.parentId
    ? allProbLinks.some(
        (l) =>
          l.roadmapItemId === item.parentId &&
          l.problem?.status === "accepted"
      )
    : false;
  return !directAccepted && !inheritedAccepted;
}

function isOrphanFeature(
  item: { id: string; parentId: string | null; status: string },
  probLinks: { roadmapItemId: string; problem: { status: string } | null }[],
  allProbLinks: { roadmapItemId: string; problem: { status: string } | null }[],
  itemMap: Map<string, { parentId: string | null }>
): boolean {
  if (
    item.status !== "committed" &&
    item.status !== "in-progress" &&
    item.status !== "done"
  )
    return false;
  if (!item.parentId) return true;
  const directAccepted = probLinks.some(
    (l) => l.roadmapItemId === item.id && l.problem?.status === "accepted"
  );
  if (directAccepted) return false;
  // Check parent epic
  const inheritedFromEpic = allProbLinks.some(
    (l) =>
      l.roadmapItemId === item.parentId &&
      l.problem?.status === "accepted"
  );
  if (inheritedFromEpic) return false;
  // Check grandparent initiative
  const parentItem = item.parentId ? itemMap.get(item.parentId) : null;
  if (parentItem?.parentId) {
    const inheritedFromInitiative = allProbLinks.some(
      (l) =>
        l.roadmapItemId === parentItem.parentId &&
        l.problem?.status === "accepted"
    );
    if (inheritedFromInitiative) return false;
  }
  return true;
}

// ─── Main data fetcher ──────────────────────────────────

export async function getGraphData(): Promise<GraphData> {
  const [allObjectives, allItems, allProblems, allSignals] = await Promise.all([
    db.query.objectives.findMany(),
    db.query.roadmapItems.findMany({
      with: {
        roadmapItemProblems: { with: { problem: true } },
        roadmapItemObjectives: true,
      },
    }),
    db.query.problems.findMany({
      with: { signalProblems: true, roadmapItemProblems: true },
    }),
    db.query.signals.findMany(),
  ]);

  // Collect all roadmapItemProblems with problem status for orphan checks
  const allRiProbLinks = allItems.flatMap((i) =>
    i.roadmapItemProblems.map((l) => ({
      roadmapItemId: l.roadmapItemId,
      problemId: l.problemId,
      problem: l.problem,
    }))
  );
  const allRiObjLinks = allItems.flatMap((i) =>
    i.roadmapItemObjectives.map((l) => ({
      roadmapItemId: l.roadmapItemId,
      objectiveId: l.objectiveId,
    }))
  );

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Objective nodes
  for (const obj of allObjectives) {
    nodes.push({
      id: `objective-${obj.id}`,
      type: "objective",
      entityId: obj.id,
      label: obj.name,
      status: null,
      isOrphan: false,
      meta: { weight: obj.weight, timeframe: obj.timeframe, metric: obj.metric },
    });
  }

  // Build item lookup map for parent resolution
  const itemMap = new Map(
    allItems.map((i) => [i.id, { parentId: i.parentId, type: i.type }])
  );

  // Roadmap item nodes + edges
  for (const item of allItems) {
    const nodeType: GraphNodeType =
      item.type === "initiative"
        ? "initiative"
        : item.type === "epic"
          ? "epic"
          : "feature";

    let orphan = false;
    if (nodeType === "initiative") {
      orphan = isOrphanInitiative(
        item.id,
        allRiObjLinks,
        allRiProbLinks,
        item.status
      );
    } else if (nodeType === "epic") {
      orphan = isOrphanEpic(item, allRiProbLinks, allRiProbLinks);
    } else {
      orphan = isOrphanFeature(item, allRiProbLinks, allRiProbLinks, itemMap);
    }

    nodes.push({
      id: `${nodeType}-${item.id}`,
      type: nodeType,
      entityId: item.id,
      label: item.title,
      status: item.status,
      isOrphan: orphan,
      meta: {
        score: item.score,
        effortSize: item.effortSize,
        targetMonth: item.targetMonth,
      },
    });

    // aligns_to edges (initiative/epic → objective)
    for (const link of item.roadmapItemObjectives) {
      edges.push({
        id: `edge-alignsto-${link.id}`,
        source: `${nodeType}-${item.id}`,
        target: `objective-${link.objectiveId}`,
        type: "aligns_to",
      });
    }

    // contains edge (epic → initiative, feature → epic via parentId)
    if (item.parentId) {
      const parentEntry = itemMap.get(item.parentId);
      if (parentEntry) {
        const parentNodeType: GraphNodeType =
          parentEntry.type === "initiative"
            ? "initiative"
            : parentEntry.type === "epic"
              ? "epic"
              : "feature";
        edges.push({
          id: `edge-contains-${item.id}`,
          source: `${nodeType}-${item.id}`,
          target: `${parentNodeType}-${item.parentId}`,
          type: "contains",
        });
      }
    }

    // justified_by edges (item → problem)
    for (const link of item.roadmapItemProblems) {
      edges.push({
        id: `edge-justifiedby-${link.id}`,
        source: `${nodeType}-${item.id}`,
        target: `problem-${link.problemId}`,
        type: "justified_by",
      });
    }
  }

  // Problem nodes + edges
  for (const prob of allProblems) {
    const orphan = isOrphanProblem(
      prob.id,
      prob.status,
      allRiProbLinks
    );

    nodes.push({
      id: `problem-${prob.id}`,
      type: "problem",
      entityId: prob.id,
      label: prob.title,
      status: prob.status,
      isOrphan: orphan,
      meta: { severity: prob.severity, frequency: prob.frequency },
    });

    // derived_from edges (problem → signal)
    for (const link of prob.signalProblems) {
      edges.push({
        id: `edge-derivedfrom-${link.id}`,
        source: `problem-${prob.id}`,
        target: `signal-${link.signalId}`,
        type: "derived_from",
      });
    }
  }

  // Signal nodes
  for (const sig of allSignals) {
    nodes.push({
      id: `signal-${sig.id}`,
      type: "signal",
      entityId: sig.id,
      label: sig.customer || sig.source || "Signal",
      status: sig.status,
      isOrphan: false,
      meta: { source: sig.source, customer: sig.customer, arr: sig.arr },
    });
  }

  return { nodes, edges };
}

// ─── Orphan counts for banners ──────────────────────────

export async function getOrphanCounts(): Promise<{
  problems: number;
  initiatives: number;
  epics: number;
  features: number;
}> {
  const [allItems, allProblems] = await Promise.all([
    db.query.roadmapItems.findMany({
      with: {
        roadmapItemProblems: { with: { problem: true } },
        roadmapItemObjectives: true,
      },
    }),
    db.query.problems.findMany({
      with: { roadmapItemProblems: true },
    }),
  ]);

  const allRiProbLinks = allItems.flatMap((i) =>
    i.roadmapItemProblems.map((l) => ({
      roadmapItemId: l.roadmapItemId,
      problemId: l.problemId,
      problem: l.problem,
    }))
  );
  const allRiObjLinks = allItems.flatMap((i) =>
    i.roadmapItemObjectives.map((l) => ({
      roadmapItemId: l.roadmapItemId,
      objectiveId: l.objectiveId,
    }))
  );

  const itemMap = new Map(
    allItems.map((i) => [i.id, { parentId: i.parentId, type: i.type }])
  );

  let orphanProblems = 0;
  for (const prob of allProblems) {
    if (isOrphanProblem(prob.id, prob.status, allRiProbLinks)) {
      orphanProblems++;
    }
  }

  let orphanInitiatives = 0;
  let orphanEpics = 0;
  let orphanFeatures = 0;
  for (const item of allItems) {
    if (item.type === "initiative") {
      if (
        isOrphanInitiative(
          item.id,
          allRiObjLinks,
          allRiProbLinks,
          item.status
        )
      ) {
        orphanInitiatives++;
      }
    } else if (item.type === "epic") {
      if (isOrphanEpic(item, allRiProbLinks, allRiProbLinks)) {
        orphanEpics++;
      }
    } else {
      if (isOrphanFeature(item, allRiProbLinks, allRiProbLinks, itemMap)) {
        orphanFeatures++;
      }
    }
  }

  return {
    problems: orphanProblems,
    initiatives: orphanInitiatives,
    epics: orphanEpics,
    features: orphanFeatures,
  };
}
