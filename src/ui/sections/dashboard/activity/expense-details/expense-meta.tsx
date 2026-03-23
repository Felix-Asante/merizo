"use client";

import { CalendarIcon, UserIcon, ClockIcon, FileTextIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import { formatPeriodLabel } from "@/lib/settlement-engine";
import type { ExpenseDetails } from "@/types/expenses";

interface ExpenseMetaProps {
  expense: ExpenseDetails;
}

export function ExpenseMeta({ expense }: ExpenseMetaProps) {
  const expenseDate = new Date(expense.expenseDate).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const createdAt = new Date(expense.createdAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const periodLabel = formatPeriodLabel(expense.periodYear, expense.periodMonth);
  const isOpen = expense.periodStatus === "open";

  const items = [
    { icon: UserIcon, label: "Paid by", value: expense.paidByName },
    { icon: CalendarIcon, label: "Date", value: expenseDate },
    { icon: ClockIcon, label: "Created", value: createdAt },
    {
      icon: FileTextIcon,
      label: "Period",
      value: periodLabel,
      badge: (
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full ml-2",
            isOpen
              ? "bg-amber-500/10 text-amber-400"
              : "bg-emerald-500/10 text-emerald-400",
          )}
        >
          {isOpen ? "Open" : "Finalized"}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-xl bg-muted/30 p-3 space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <item.icon className="size-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            {item.label}
          </span>
          <span className="text-sm font-medium truncate flex items-center">
            {item.value}
            {item.badge}
          </span>
        </div>
      ))}
      {expense.note && (
        <div className="flex items-start gap-3 pt-1 border-t border-border/30">
          <FileTextIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            Note
          </span>
          <span className="text-sm">{expense.note}</span>
        </div>
      )}
    </div>
  );
}
