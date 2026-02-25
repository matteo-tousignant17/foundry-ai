"use server";

import { db } from "@/lib/db";
import { problems, signalProblems, roadmapItemProblems } from "@/lib/db/schema";
import { problemInsertSchema, problemUpdateSchema } from "@/lib/validators/problem";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export type GatingResult =
  | { success: true }
  | { error: "gating"; missing: string[]; message: string };

export async function createProblem(data: unknown) {
  const parsed = problemInsertSchema.parse(data);
  const now = new Date();
  const record = await db
    .insert(problems)
    .values({
      id: nanoid(),
      ...parsed,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath("/problems");
  return record[0];
}

export async function getProblems() {
  return db.query.problems.findMany({
    orderBy: [desc(problems.createdAt)],
    with: {
      signalProblems: true,
    },
  });
}

export async function getProblem(id: string) {
  return db.query.problems.findFirst({
    where: eq(problems.id, id),
    with: {
      signalProblems: {
        with: {
          signal: true,
        },
      },
    },
  });
}

export async function updateProblem(
  id: string,
  data: unknown
): Promise<GatingResult> {
  const parsed = problemUpdateSchema.parse(data);

  // Gating: "accepted" requires at least one linked roadmap item
  if (parsed.status === "accepted") {
    const links = await db.query.roadmapItemProblems.findMany({
      where: eq(roadmapItemProblems.problemId, id),
    });
    if (links.length === 0) {
      return {
        error: "gating",
        missing: ["roadmapItem"],
        message:
          "Must link to at least one Initiative or Feature before accepting.",
      };
    }
  }

  await db
    .update(problems)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(problems.id, id));
  revalidatePath("/problems");
  revalidatePath(`/problems/${id}`);
  revalidatePath("/graph");
  return { success: true };
}

export async function deleteProblem(id: string) {
  await db.delete(problems).where(eq(problems.id, id));
  revalidatePath("/problems");
}

export async function linkSignalToProblem(
  problemId: string,
  signalId: string,
  quote?: string
) {
  await db.insert(signalProblems).values({
    id: nanoid(),
    problemId,
    signalId,
    quote: quote || null,
  });
  revalidatePath(`/problems/${problemId}`);
}

export async function unlinkSignalFromProblem(linkId: string, problemId: string) {
  await db.delete(signalProblems).where(eq(signalProblems.id, linkId));
  revalidatePath(`/problems/${problemId}`);
}
