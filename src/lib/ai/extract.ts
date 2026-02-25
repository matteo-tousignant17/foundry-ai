import { generateObject } from "ai";
import { z } from "zod";
import { model } from "./provider";

const extractionSchema = z.object({
  quotes: z.array(
    z.object({
      text: z.string().describe("Verbatim quote from the signal"),
      theme: z.string().describe("Short theme label, e.g. 'onboarding friction'"),
    })
  ),
  suggestedProblems: z.array(
    z.object({
      title: z.string().describe("Short problem title"),
      statement: z
        .string()
        .describe(
          "Problem statement in format: When [user] tries to [action], they [pain] because [cause]"
        ),
      whoAffected: z.string().optional().describe("Who is affected"),
      severity: z
        .enum(["critical", "high", "medium", "low"])
        .describe("Estimated severity"),
    })
  ),
  missingMetadata: z.array(
    z.object({
      field: z.string().describe("Field name that's missing"),
      question: z
        .string()
        .describe("Question to ask the PM to fill in the missing data"),
    })
  ),
  customerSentiment: z
    .enum(["frustrated", "neutral", "positive"])
    .describe("Overall customer sentiment"),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

export async function extractSignalInsights(
  rawText: string,
  metadata?: {
    source?: string | null;
    customer?: string | null;
    arr?: string | null;
    severity?: string | null;
    frequency?: string | null;
  }
): Promise<ExtractionResult> {
  const metadataContext = metadata
    ? `\nKnown metadata:\n- Source: ${metadata.source ?? "unknown"}\n- Customer: ${metadata.customer ?? "unknown"}\n- ARR: ${metadata.arr ?? "unknown"}\n- Severity: ${metadata.severity ?? "unknown"}\n- Frequency: ${metadata.frequency ?? "unknown"}`
    : "";

  const { object } = await generateObject({
    model,
    schema: extractionSchema,
    prompt: `You are a product management assistant analyzing voice-of-customer (VoC) feedback.

Analyze the following signal and extract:
1. **Quotes**: Key verbatim snippets that express pain, need, or impact. Only extract direct quotes from the text.
2. **Suggested Problems**: Draft problem statements that this signal provides evidence for. Use the format "When [user] tries to [action], they [pain] because [cause]". Each problem should be specific and actionable.
3. **Missing Metadata**: Identify important context that's missing and suggest questions to ask the PM. Only ask about things that would meaningfully impact prioritization (e.g., customer size, frequency, business impact).
4. **Customer Sentiment**: Overall tone of the feedback.

IMPORTANT RULES:
- Every quote must be verbatim text from the signal. Do not paraphrase.
- Every suggested problem must be traceable to evidence in the signal.
- If something is inferred rather than stated, note it in the problem statement.
- Be concise. Quality over quantity.
${metadataContext}

Signal text:
"""
${rawText}
"""`,
  });

  return object;
}
