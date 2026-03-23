"use client";

import { UserAvatar } from "@/ui/shared/avatar";
import { useActiveCurrency } from "@/hooks/use-active-currency";
import type { ExpenseDetails } from "@/types/expenses";

interface ExpenseHeaderProps {
  expense: ExpenseDetails;
}

export function ExpenseHeader({ expense }: ExpenseHeaderProps) {
  const { symbol } = useActiveCurrency();

  return (
    <div className="text-center space-y-3 pb-4">
      <div className="flex justify-center">
        <UserAvatar name={expense.paidByName} size="lg" />
      </div>
      <div>
        <p className="text-2xl font-bold">
          {symbol} &nbsp;
          {expense.amount.toFixed(2)}
        </p>
        <p className="text-base font-semibold mt-1">{expense.title}</p>
      </div>
    </div>
  );
}
