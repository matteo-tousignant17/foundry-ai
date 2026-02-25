"use server";

import { db } from "@/lib/db";
import { prds } from "@/lib/db/schema";
import { prdInsertSchema, prdUpdateSchema } from "@/lib/validators/prd";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createPrd(data: unknown) {
  const parsed = prdInsertSchema.parse(data);
  const now = new Date();
  const record = await db
    .insert(prds)
    .values({
      id: nanoid(),
      ...parsed,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath("/prds");
  return record[0];
}

export async function getPrds() {
  return db.query.prds.findMany({
    orderBy: [desc(prds.createdAt)],
    with: {
      roadmapItem: true,
    },
  });
}

export async function getPrd(id: string) {
  return db.query.prds.findFirst({
    where: eq(prds.id, id),
    with: {
      roadmapItem: true,
      messages: true,
    },
  });
}

export async function updatePrd(id: string, data: unknown) {
  const parsed = prdUpdateSchema.parse(data);
  await db
    .update(prds)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(prds.id, id));
  revalidatePath("/prds");
  revalidatePath(`/prds/${id}`);
}

export async function deletePrd(id: string) {
  await db.delete(prds).where(eq(prds.id, id));
  revalidatePath("/prds");
}

export async function updatePrdSection(
  id: string,
  section: string,
  content: string
) {
  await db
    .update(prds)
    .set({ [section]: content, updatedAt: new Date() })
    .where(eq(prds.id, id));
  revalidatePath(`/prds/${id}`);
}
