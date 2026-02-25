import { z } from "zod";

export const objectiveInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  timeframe: z.string().optional(),
  metric: z.string().optional(),
  weight: z.number().min(0.1).max(10),
});

export const objectiveUpdateSchema = objectiveInsertSchema.partial();

export type ObjectiveInsert = z.infer<typeof objectiveInsertSchema>;
export type ObjectiveUpdate = z.infer<typeof objectiveUpdateSchema>;
