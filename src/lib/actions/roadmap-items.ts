"use server";

import { db } from "@/lib/db";
import {
  roadmapItems,
  roadmapItemProblems,
  roadmapItemObjectives,
} from "@/lib/db/schema";
import {
  roadmapItemInsertSchema,
  roadmapItemUpdateSchema,
} from "@/lib/validators/roadmap-item";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export type GatingResult =
  | { success: true }
  | { error: "gating"; missing: string[]; message: string };

function computeRiceScore(
  reach: number | null,
  impact: number | null,
  confidence: number | null,
  effort: number | null
): number | null {
  if (!reach || !impact || !confidence || !effort) return null;
  return Math.round(((reach * impact * confidence) / effort) * 10) / 10;
}

export async function createRoadmapItem(data: unknown) {
  const parsed = roadmapItemInsertSchema.parse(data);
  const now = new Date();
  const score = computeRiceScore(
    parsed.reach ?? null,
    parsed.impact ?? null,
    parsed.confidence ?? null,
    parsed.effort ?? null
  );
  const record = await db
    .insert(roadmapItems)
    .values({
      id: nanoid(),
      ...parsed,
      score,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath("/roadmap");
  return record[0];
}

export async function getRoadmapItems() {
  return db.query.roadmapItems.findMany({
    orderBy: [desc(roadmapItems.score)],
    with: {
      roadmapItemProblems: {
        with: { problem: true },
      },
      roadmapItemObjectives: {
        with: { objective: true },
      },
      release: true,
    },
  });
}

export async function getRoadmapItem(id: string) {
  return db.query.roadmapItems.findFirst({
    where: eq(roadmapItems.id, id),
    with: {
      roadmapItemProblems: {
        with: { problem: true },
      },
      roadmapItemObjectives: {
        with: { objective: true },
      },
      prds: true,
    },
  });
}

export async function updateRoadmapItem(
  id: string,
  data: unknown
): Promise<GatingResult> {
  const parsed = roadmapItemUpdateSchema.parse(data);

  const existing = await db.query.roadmapItems.findFirst({
    where: eq(roadmapItems.id, id),
    with: {
      roadmapItemProblems: { with: { problem: true } },
      roadmapItemObjectives: true,
    },
  });

  if (!existing) return { success: true };

  // Gating: "committed" requires specific links depending on type
  if (parsed.status === "committed" && existing.status !== "committed") {
    const itemType = parsed.type ?? existing.type;
    const missing: string[] = [];

    if (itemType === "initiative") {
      if (existing.roadmapItemObjectives.length === 0) {
        missing.push("objective");
      }
      const hasAcceptedProblem = existing.roadmapItemProblems.some(
        (l) => l.problem?.status === "accepted"
      );
      if (!hasAcceptedProblem) {
        missing.push("acceptedProblem");
      }
    } else if (itemType === "epic") {
      // Epic needs: parent initiative + accepted problem (direct or inherited)
      const parentId = parsed.parentId ?? existing.parentId;
      if (!parentId) {
        missing.push("parentInitiative");
      }
      const hasDirectAccepted = existing.roadmapItemProblems.some(
        (l) => l.problem?.status === "accepted"
      );
      let hasInheritedAccepted = false;
      if (parentId && !hasDirectAccepted) {
        const parentItem = await db.query.roadmapItems.findFirst({
          where: eq(roadmapItems.id, parentId),
          with: { roadmapItemProblems: { with: { problem: true } } },
        });
        hasInheritedAccepted =
          parentItem?.roadmapItemProblems.some(
            (l) => l.problem?.status === "accepted"
          ) ?? false;
      }
      if (!hasDirectAccepted && !hasInheritedAccepted) {
        missing.push("acceptedProblem");
      }
    } else {
      // Feature needs: parent epic + accepted problem (direct, from epic, or from grandparent initiative)
      const parentId = parsed.parentId ?? existing.parentId;
      if (!parentId) {
        missing.push("parentEpic");
      }
      const hasDirectAccepted = existing.roadmapItemProblems.some(
        (l) => l.problem?.status === "accepted"
      );
      let hasInheritedAccepted = false;
      if (parentId && !hasDirectAccepted) {
        const epicItem = await db.query.roadmapItems.findFirst({
          where: eq(roadmapItems.id, parentId),
          with: { roadmapItemProblems: { with: { problem: true } } },
        });
        hasInheritedAccepted =
          epicItem?.roadmapItemProblems.some(
            (l) => l.problem?.status === "accepted"
          ) ?? false;
        // Check grandparent initiative if still no inherited
        if (!hasInheritedAccepted && epicItem?.parentId) {
          const initiativeItem = await db.query.roadmapItems.findFirst({
            where: eq(roadmapItems.id, epicItem.parentId),
            with: { roadmapItemProblems: { with: { problem: true } } },
          });
          hasInheritedAccepted =
            initiativeItem?.roadmapItemProblems.some(
              (l) => l.problem?.status === "accepted"
            ) ?? false;
        }
      }
      if (!hasDirectAccepted && !hasInheritedAccepted) {
        missing.push("acceptedProblem");
      }
    }

    if (missing.length > 0) {
      const messages: Record<string, string> = {
        objective: "Link to at least 1 Objective",
        acceptedProblem: "Link to at least 1 Accepted Problem",
        parentInitiative: "Set a parent Initiative",
        parentEpic: "Set a parent Epic",
      };
      return {
        error: "gating",
        missing,
        message: `Before committing: ${missing.map((m) => messages[m]).join("; ")}.`,
      };
    }
  }

  const reach = parsed.reach ?? existing.reach ?? null;
  const impact = parsed.impact ?? existing.impact ?? null;
  const confidence = parsed.confidence ?? existing.confidence ?? null;
  const effort = parsed.effort ?? existing.effort ?? null;
  const score = computeRiceScore(reach, impact, confidence, effort);

  await db
    .update(roadmapItems)
    .set({ ...parsed, score, updatedAt: new Date() })
    .where(eq(roadmapItems.id, id));
  revalidatePath("/roadmap");
  revalidatePath("/graph");
  return { success: true };
}

export async function deleteRoadmapItem(id: string) {
  await db.delete(roadmapItems).where(eq(roadmapItems.id, id));
  revalidatePath("/roadmap");
}

export async function linkProblemToRoadmapItem(
  roadmapItemId: string,
  problemId: string
) {
  await db.insert(roadmapItemProblems).values({
    id: nanoid(),
    roadmapItemId,
    problemId,
  });
  revalidatePath("/roadmap");
}

export async function unlinkProblemFromRoadmapItem(linkId: string) {
  await db
    .delete(roadmapItemProblems)
    .where(eq(roadmapItemProblems.id, linkId));
  revalidatePath("/roadmap");
}

export async function linkObjectiveToRoadmapItem(
  roadmapItemId: string,
  objectiveId: string,
  impactToObjective?: number
) {
  await db.insert(roadmapItemObjectives).values({
    id: nanoid(),
    roadmapItemId,
    objectiveId,
    impactToObjective: impactToObjective ?? null,
  });
  revalidatePath("/roadmap");
}

export async function unlinkObjectiveFromRoadmapItem(linkId: string) {
  await db
    .delete(roadmapItemObjectives)
    .where(eq(roadmapItemObjectives.id, linkId));
  revalidatePath("/roadmap");
}
