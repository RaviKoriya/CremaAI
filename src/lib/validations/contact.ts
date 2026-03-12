import { z } from "zod";

export const contactSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
