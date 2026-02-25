"use server";

import { db } from "@/lib/db";
import { roadmapItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { suggestScores, type ScoreSuggestion } from "@/lib/ai/score";

export async function suggestItemScore(itemId: string): Promise<ScoreSuggestion> {
  const item = await db.query.roadmapItems.findFirst({
    where: eq(roadmapItems.id, itemId),
    with: {
      roadmapItemProblems: {
        with: { problem: true },
      },
      roadmapItemObjectives: {
        with: { objective: true },
      },
    },
  });

  if (!item) throw new Error("Roadmap item not found");

  return suggestScores({
    title: item.title,
    description: item.description,
    rationale: item.rationale,
    type: item.type,
    problems: item.roadmapItemProblems.map((rp) => ({
      title: rp.problem.title,
      statement: rp.problem.statement,
      severity: rp.problem.severity,
    })),
    objectives: item.roadmapItemObjectives.map((ro) => ({
      name: ro.objective.name,
      metric: ro.objective.metric,
      weight: ro.objective.weight,
    })),
  });
}

export async function applyScoreSuggestion(
  itemId: string,
  scores: { reach: number; impact: number; confidence: number; effort: number }
) {
  const score =
    Math.round(
      ((scores.reach * scores.impact * scores.confidence) / scores.effort) * 10
    ) / 10;

  await db
    .update(roadmapItems)
    .set({
      reach: scores.reach,
      impact: scores.impact,
      confidence: scores.confidence,
      effort: scores.effort,
      score,
      updatedAt: new Date(),
    })
    .where(eq(roadmapItems.id, itemId));

  revalidatePath("/roadmap");
}
