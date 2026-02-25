import { z } from "zod";

export const problemInsertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  statement: z.string().min(1, "Problem statement is required"),
  whoAffected: z.string().optional(),
  workflowBlock: z.string().optional(),
  businessImpact: z.string().optional(),
  retentionOrGrowth: z.enum(["retention", "growth", "both"]).optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "rare"]).optional(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
});

export const problemUpdateSchema = problemInsertSchema.partial().extend({
  status: z.enum(["draft", "shaped", "proposed", "accepted", "rejected"]).optional(),
});

export type ProblemInsert = z.infer<typeof problemInsertSchema>;
export type ProblemUpdate = z.infer<typeof problemUpdateSchema>;
