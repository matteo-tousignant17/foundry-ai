import { z } from "zod";

export const userStorySchema = z.object({
  role: z.string(),
  action: z.string(),
  benefit: z.string(),
});

export const openQuestionSchema = z.object({
  question: z.string(),
  answer: z.string().optional(),
  acceptedAsRisk: z.boolean().optional(),
});

export const prdInsertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  roadmapItemId: z.string().optional(),
  summary: z.string().optional(),
  problemStatement: z.string().optional(),
  objectives: z.string().optional(),
  userStories: z.string().optional(),
  designAssetLink: z.string().optional(),
  openQuestions: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  evidence: z.string().optional(),
});

export const prdUpdateSchema = prdInsertSchema.partial().extend({
  status: z.enum(["draft", "review", "ready"]).optional(),
});

export type PrdInsert = z.infer<typeof prdInsertSchema>;
export type PrdUpdate = z.infer<typeof prdUpdateSchema>;
export type UserStory = z.infer<typeof userStorySchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
