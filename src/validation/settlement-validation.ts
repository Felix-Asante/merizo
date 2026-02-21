import { z } from "zod";

export const manualSettlementSchema = z
  .object({
    fromId: z.string().min(1, "Select who is paying"),
    toId: z.string().min(1, "Select who is receiving"),
    amount: z.number().positive("Amount must be greater than 0"),
    note: z.string().optional(),
    date: z.string().min(1, "Date is required"),
  })
  .refine((data) => data.fromId !== data.toId, {
    message: "Must be different from payer",
    path: ["toId"],
  });

export type ManualSettlementFormValues = z.infer<typeof manualSettlementSchema>;
