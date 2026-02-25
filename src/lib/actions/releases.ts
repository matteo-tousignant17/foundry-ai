"use server";

import { db } from "@/lib/db";
import { releases, roadmapItems } from "@/lib/db/schema";
import {
  releaseInsertSchema,
  releaseUpdateSchema,
} from "@/lib/validators/release";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createRelease(data: unknown) {
  const parsed = releaseInsertSchema.parse(data);
  const now = new Date();
  const record = await db
    .insert(releases)
    .values({
      id: nanoid(),
      ...parsed,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath("/roadmap");
  return record[0];
}

export async function getReleases() {
  return db.query.releases.findMany({
    orderBy: [desc(releases.targetDate)],
  });
}

export async function getRelease(id: string) {
  return db.query.releases.findFirst({
    where: eq(releases.id, id),
    with: { roadmapItems: true },
  });
}

export async function updateRelease(id: string, data: unknown) {
  const parsed = releaseUpdateSchema.parse(data);
  await db
    .update(releases)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(releases.id, id));
  revalidatePath("/roadmap");
}

export async function deleteRelease(id: string) {
  await db.delete(releases).where(eq(releases.id, id));
  revalidatePath("/roadmap");
}

export async function assignItemToRelease(
  itemId: string,
  releaseId: string | null
) {
  await db
    .update(roadmapItems)
    .set({ releaseId, updatedAt: new Date() })
    .where(eq(roadmapItems.id, itemId));
  revalidatePath("/roadmap");
}
