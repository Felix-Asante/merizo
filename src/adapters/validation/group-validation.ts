import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  type: z.string().optional(),
  currency: z.string().min(1, "Select a currency"),
  memberEmails: z.array(z.string().email("Invalid email")),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
