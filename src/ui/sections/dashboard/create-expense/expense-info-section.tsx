"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { FormField, FormItem, FormMessage } from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import type { ExpenseFormValues } from "@/validation/expense-validation";
import { useActiveCurrency } from "@/hooks/use-active-currency";

export function ExpenseInfoSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="rounded-2xl bg-card border border-border/50 p-4 space-y-4"
    >
      <AmountInput />

      <div className="space-y-3">
        <FormInput
          name="title"
          label="Title"
          placeholder="What was this expense for?"
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput name="date" label="Date" type="date" />
          <FormInput name="note" label="Note" placeholder="Optional" />
        </div>
      </div>
    </motion.section>
  );
}

function AmountInput() {
  const { control } = useFormContext<ExpenseFormValues>();
  const [display, setDisplay] = useState("");
  const { symbol } = useActiveCurrency();

  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-center gap-1 py-6">
            <span className="text-4xl font-bold text-muted-foreground/40">
              {symbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={display}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
                  setDisplay(raw);
                  const parsed = parseFloat(raw);
                  field.onChange(isNaN(parsed) ? 0 : parsed);
                }
              }}
              onBlur={() => {
                field.onBlur();
                if (field.value > 0) {
                  setDisplay(field.value.toFixed(2));
                }
              }}
              placeholder="0.00"
              className="text-4xl font-bold bg-transparent outline-none w-full text-center max-w-[200px]"
            />
          </div>
          <FormMessage className="text-center" />
        </FormItem>
      )}
    />
  );
}
