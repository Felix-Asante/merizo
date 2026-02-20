"use client";

import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/ui/base/button";
import type { ExpenseFormValues } from "@/adapters/validation/expense-validation";

interface SubmitButtonProps {
  isLoading: boolean;
  isSuccess: boolean;
}

export function SubmitButton({ isLoading, isSuccess }: SubmitButtonProps) {
  const { formState } = useFormContext<ExpenseFormValues>();
  const isDisabled = !formState.isValid || isLoading || isSuccess;

  return (
    <div className="sticky bottom-0 -mx-4 px-4 pt-4 pb-6 bg-background/80 backdrop-blur-lg border-t border-border/50 mt-4 z-10">
      <Button
        type="submit"
        disabled={isDisabled}
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.span
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <CheckIcon className="size-5" />
              Added!
            </motion.span>
          ) : isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2Icon className="size-5 animate-spin" />
              Adding...
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Add Expense
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
