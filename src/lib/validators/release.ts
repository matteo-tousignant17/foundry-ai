import { z } from "zod";

export const releaseInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.enum(["planned", "active", "released"]),
});

export const releaseUpdateSchema = releaseInsertSchema.partial();

export type ReleaseInsert = z.infer<typeof releaseInsertSchema>;
export type ReleaseUpdate = z.infer<typeof releaseUpdateSchema>;
