import { z } from "zod";

export const signalInsertSchema = z.object({
  rawText: z.string().min(1, "Paste some VoC text"),
  source: z.enum(["gong", "zendesk", "email", "slack", "other"]).optional(),
  sourceUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
  customer: z.string().optional(),
  arr: z.string().optional(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "rare"]).optional(),
  renewalRisk: z.enum(["high", "medium", "low"]).optional(),
});

export const signalUpdateSchema = signalInsertSchema.partial().extend({
  status: z.enum(["new", "processed", "discarded"]).optional(),
});

export type SignalInsert = z.infer<typeof signalInsertSchema>;
export type SignalUpdate = z.infer<typeof signalUpdateSchema>;
