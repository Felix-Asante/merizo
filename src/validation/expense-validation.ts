import { z } from "zod";
import { INPUT_REQUIRED_INVALID_ERROR_MESSAGE } from "./validation-helpers";

export const expenseSchema = z
  .object({
    title: z
      .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .min(1, "Title is required"),
    amount: z
      .number(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .positive("Amount must be greater than 0"),
    date: z
      .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .min(1, "Date is required"),
    note: z.string().optional(),
    paidById: z
      .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .min(1, "Select who paid"),
    participantIds: z
      .array(z.string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE))
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
