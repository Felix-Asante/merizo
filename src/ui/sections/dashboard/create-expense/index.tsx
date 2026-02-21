"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/ui/base/form";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  expenseSchema,
  type ExpenseFormValues,
} from "@/validation/expense-validation";
import { ExpenseNavbar } from "./expense-navbar";
import { ExpenseInfoSection } from "./expense-info-section";
import { PaidBySection } from "./paid-by-section";
import { SplitBetweenSection } from "./split-between-section";
import { SplitMethodSection } from "./split-method-section";
import { SplitPreview } from "./split-preview";
import { SubmitButton } from "./submit-button";
import { CURRENT_USER_ID, DUMMY_EXPENSE_MEMBERS } from "./dummy-data";

export function CreateExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      note: "",
      paidById: CURRENT_USER_ID,
      participantIds: DUMMY_EXPENSE_MEMBERS.map((m) => m.id),
      splitMethod: "equal",
      customSplits: {},
    },
  });

  const splitMethod = form.watch("splitMethod");
  const participantIds = form.watch("participantIds");
  const amount = form.watch("amount");

  useEffect(() => {
    if (splitMethod === "equal") {
      form.setValue("customSplits", {});
      return;
    }

    const participants = participantIds ?? [];
    if (participants.length === 0) return;

    const currentSplits = form.getValues("customSplits");
    const needsInit = participants.some(
      (id) => currentSplits[id] === undefined,
    );

    if (!needsInit) return;

    const splits: Record<string, number> = {};
    if (splitMethod === "exact") {
      const share = amount / participants.length;
      participants.forEach((id) => {
        splits[id] = Math.round(share * 100) / 100;
      });
    } else {
      const pct = 100 / participants.length;
      participants.forEach((id) => {
        splits[id] = Math.round(pct * 100) / 100;
      });
    }
    form.setValue("customSplits", splits);
  }, [splitMethod, participantIds, amount, form]);

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Expense submitted:", data);
      setIsSuccess(true);
      toast.success("Expense added successfully!");
      setTimeout(() => {
        setIsSuccess(false);
        form.reset();
      }, 1500);
    } catch {
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl mx-auto"
    >
      <ExpenseNavbar />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ExpenseInfoSection />
          <PaidBySection members={DUMMY_EXPENSE_MEMBERS} />
          <SplitBetweenSection members={DUMMY_EXPENSE_MEMBERS} />
          <SplitMethodSection members={DUMMY_EXPENSE_MEMBERS} />
          <SplitPreview
            members={DUMMY_EXPENSE_MEMBERS}
            currentUserId={CURRENT_USER_ID}
          />
          <SubmitButton isLoading={isLoading} isSuccess={isSuccess} />
        </form>
      </Form>
    </motion.div>
  );
}
