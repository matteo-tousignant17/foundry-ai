"use server";

import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { signalInsertSchema, signalUpdateSchema } from "@/lib/validators/signal";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createSignal(data: unknown) {
  const parsed = signalInsertSchema.parse(data);
  const now = new Date();
  const record = await db
    .insert(signals)
    .values({
      id: nanoid(),
      ...parsed,
      status: "new",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath("/inbox");
  return record[0];
}

export async function getSignals() {
  return db.query.signals.findMany({
    orderBy: [desc(signals.createdAt)],
  });
}

export async function getSignal(id: string) {
  return db.query.signals.findFirst({
    where: eq(signals.id, id),
  });
}

export async function updateSignal(id: string, data: unknown) {
  const parsed = signalUpdateSchema.parse(data);
  await db
    .update(signals)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(signals.id, id));
  revalidatePath("/inbox");
}

export async function deleteSignal(id: string) {
  await db.delete(signals).where(eq(signals.id, id));
  revalidatePath("/inbox");
}
