import { streamText } from "ai";
import { model } from "@/lib/ai/provider";
import { buildPrdSystemPrompt } from "@/lib/ai/prd-chat";
import { db } from "@/lib/db";
import { prds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { messages, prdId } = await req.json();

  const prd = await db.query.prds.findFirst({
    where: eq(prds.id, prdId),
    with: {
      roadmapItem: true,
    },
  });

  if (!prd) {
    return new Response("PRD not found", { status: 404 });
  }

  const result = streamText({
    model,
    system: buildPrdSystemPrompt(prd),
    messages,
  });

  return result.toUIMessageStreamResponse();
}
