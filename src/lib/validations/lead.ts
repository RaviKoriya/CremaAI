import { z } from "zod";

export const leadSchema = z.object({
  title: z.string().min(1, "Lead title is required"),
  contact_id: z.string().uuid().optional().nullable(),
  value: z.number().min(0),
  currency: z.string().min(1),
  status: z.enum(["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"]),
  priority: z.enum(["Low", "Medium", "High"]),
  assigned_to: z.string().uuid().optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  won_lost_reason: z.string().optional().nullable(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
