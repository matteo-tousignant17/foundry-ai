import { z } from "zod";

export const roadmapItemInsertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  rationale: z.string().optional(),
  type: z.enum(["initiative", "epic", "feature"]),
  status: z.enum(["proposed", "committed", "in-progress", "done"]),
  targetMonth: z.string().optional(),
  effortSize: z.enum(["XS", "S", "M", "L", "XL"]).optional(),
  reach: z.number().min(1).max(10).optional(),
  impact: z.number().min(1).max(10).optional(),
  confidence: z.number().min(1).max(10).optional(),
  effort: z.number().min(1).max(10).optional(),
  parentId: z.string().optional(),
  releaseId: z.string().optional(),
});

export const roadmapItemUpdateSchema = roadmapItemInsertSchema.partial();

export type RoadmapItemInsert = z.infer<typeof roadmapItemInsertSchema>;
export type RoadmapItemUpdate = z.infer<typeof roadmapItemUpdateSchema>;
