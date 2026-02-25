"use server";

import { db } from "@/lib/db";
import { objectives } from "@/lib/db/schema";
import { objectiveInsertSchema, objectiveUpdateSchema } from "@/lib/validators/objective";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createObjective(data: unknown) {
  const parsed = objectiveInsertSchema.parse(data);
  const now = new Date();
  const record = await db
    .insert(objectives)
    .values({
      id: nanoid(),
      ...parsed,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath("/objectives");
  return record[0];
}

export async function getObjectives() {
  return db.query.objectives.findMany({
    orderBy: [desc(objectives.createdAt)],
  });
}

export async function getObjective(id: string) {
  return db.query.objectives.findFirst({
    where: eq(objectives.id, id),
  });
}

export async function updateObjective(id: string, data: unknown) {
  const parsed = objectiveUpdateSchema.parse(data);
  await db
    .update(objectives)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(objectives.id, id));
  revalidatePath("/objectives");
}

export async function deleteObjective(id: string) {
  await db.delete(objectives).where(eq(objectives.id, id));
  revalidatePath("/objectives");
}
