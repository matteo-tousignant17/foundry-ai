import { generateObject } from "ai";
import { z } from "zod";
import { model } from "./provider";

const scoreSuggestionSchema = z.object({
  reach: z.object({
    value: z.number().min(1).max(10),
    reasoning: z.string(),
  }),
  impact: z.object({
    value: z.number().min(1).max(10),
    reasoning: z.string(),
  }),
  confidence: z.object({
    value: z.number().min(1).max(10),
    reasoning: z.string(),
  }),
  effort: z.object({
    value: z.number().min(1).max(10),
    reasoning: z.string(),
  }),
  overallRationale: z.string().describe("Brief explanation of the scoring"),
  assumptions: z
    .array(z.string())
    .describe("Key assumptions made when scoring — each clearly labeled"),
});

export type ScoreSuggestion = z.infer<typeof scoreSuggestionSchema>;

export async function suggestScores(input: {
  title: string;
  description: string | null;
  rationale: string | null;
  type: string;
  problems: { title: string; statement: string; severity: string | null }[];
  objectives: { name: string; metric: string | null; weight: number }[];
}): Promise<ScoreSuggestion> {
  const problemContext =
    input.problems.length > 0
      ? `\nLinked Problems:\n${input.problems
          .map(
            (p, i) =>
              `${i + 1}. ${p.title} (severity: ${p.severity ?? "unknown"})\n   ${p.statement}`
          )
          .join("\n")}`
      : "\nNo linked problems (limited evidence).";

  const objectiveContext =
    input.objectives.length > 0
      ? `\nLinked Objectives:\n${input.objectives
          .map(
            (o, i) =>
              `${i + 1}. ${o.name} (weight: ${o.weight}, metric: ${o.metric ?? "none"})`
          )
          .join("\n")}`
      : "\nNo linked objectives.";

  const { object } = await generateObject({
    model,
    schema: scoreSuggestionSchema,
    prompt: `You are a product management assistant helping score a roadmap item using RICE-like methodology.

Score the following ${input.type} on four dimensions (1-10 each):

**Reach** (1-10): How many users/accounts will this affect?
- 1 = <1% of users, 10 = >80% of users
- Consider the linked problems' scope

**Impact** (1-10): How significantly will this improve the user experience or business metric?
- 1 = Barely noticeable, 10 = Transformative
- Consider alignment with objectives

**Confidence** (1-10): How confident are we in the estimates?
- 1 = Pure speculation, 10 = Strong evidence from multiple sources
- Consider: number of linked problems, evidence quality, data availability

**Effort** (1-10): How much work is required?
- 1 = Trivial (hours), 10 = Major (months+)
- Consider: type (initiative vs feature), description complexity

IMPORTANT RULES:
- Be honest about confidence. If evidence is thin, confidence should be low.
- Flag every assumption explicitly.
- Score based on evidence, not optimism.
- If information is missing, note it and score conservatively.

Roadmap Item:
- Title: ${input.title}
- Type: ${input.type}
- Description: ${input.description ?? "No description provided"}
- Rationale: ${input.rationale ?? "No rationale provided"}
${problemContext}
${objectiveContext}`,
  });

  return object;
}
