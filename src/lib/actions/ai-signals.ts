"use server";

import { db } from "@/lib/db";
import { signals, problems, signalProblems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { extractSignalInsights, type ExtractionResult } from "@/lib/ai/extract";

export async function analyzeSignal(signalId: string): Promise<ExtractionResult> {
  const signal = await db.query.signals.findFirst({
    where: eq(signals.id, signalId),
  });
  if (!signal) throw new Error("Signal not found");

  const result = await extractSignalInsights(signal.rawText, {
    source: signal.source,
    customer: signal.customer,
    arr: signal.arr,
    severity: signal.severity,
    frequency: signal.frequency,
  });

  return result;
}

export async function acceptSuggestedProblem(
  signalId: string,
  suggestion: {
    title: string;
    statement: string;
    whoAffected?: string;
    severity?: string;
  },
  quote?: string
) {
  const now = new Date();
  const problemId = nanoid();

  await db.insert(problems).values({
    id: problemId,
    title: suggestion.title,
    statement: suggestion.statement,
    whoAffected: suggestion.whoAffected ?? null,
    severity: suggestion.severity ?? null,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(signalProblems).values({
    id: nanoid(),
    signalId,
    problemId,
    quote: quote ?? null,
  });

  // Mark signal as processed
  await db
    .update(signals)
    .set({ status: "processed", updatedAt: now })
    .where(eq(signals.id, signalId));

  revalidatePath("/inbox");
  revalidatePath("/problems");

  return { problemId };
}

export async function acceptAllSuggestedProblems(
  signalId: string,
  suggestions: {
    title: string;
    statement: string;
    whoAffected?: string;
    severity?: string;
  }[],
  quotes: string[]
) {
  const now = new Date();

  for (let i = 0; i < suggestions.length; i++) {
    const suggestion = suggestions[i];
    const problemId = nanoid();

    await db.insert(problems).values({
      id: problemId,
      title: suggestion.title,
      statement: suggestion.statement,
      whoAffected: suggestion.whoAffected ?? null,
      severity: suggestion.severity ?? null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // Link with the first quote if available
    const quote = quotes[i] ?? quotes[0] ?? null;
    await db.insert(signalProblems).values({
      id: nanoid(),
      signalId,
      problemId,
      quote,
    });
  }

  await db
    .update(signals)
    .set({ status: "processed", updatedAt: now })
    .where(eq(signals.id, signalId));

  revalidatePath("/inbox");
  revalidatePath("/problems");
}
