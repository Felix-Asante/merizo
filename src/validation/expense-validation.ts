import { z } from "zod";

export const expenseSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    note: z.string().optional(),
    paidById: z.string().min(1, "Select who paid"),
    participantIds: z
      .array(z.string())
      .min(1, "Select at least one participant"),
    splitMethod: z.enum(["equal", "exact", "percentage"]),
    customSplits: z.record(z.string(), z.number()),
  })
  .superRefine((data, ctx) => {
    if (data.splitMethod === "exact") {
      const sum = data.participantIds.reduce(
        (acc, id) => acc + (data.customSplits[id] ?? 0),
        0,
      );
      if (Math.abs(sum - data.amount) > 0.01) {
        ctx.addIssue({
          code: "custom",
          message: `Amounts must total $${data.amount.toFixed(2)} (currently $${sum.toFixed(2)})`,
          path: ["customSplits"],
        });
      }
    }

    if (data.splitMethod === "percentage") {
      const sum = data.participantIds.reduce(
        (acc, id) => acc + (data.customSplits[id] ?? 0),
        0,
      );
      if (Math.abs(sum - 100) > 0.01) {
        ctx.addIssue({
          code: "custom",
          message: `Must total 100% (currently ${sum.toFixed(1)}%)`,
          path: ["customSplits"],
        });
      }
    }
  });

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
