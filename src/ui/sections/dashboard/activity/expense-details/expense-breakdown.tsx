"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, UsersIcon } from "lucide-react";
import { UserAvatar } from "@/ui/shared/avatar";
import { useActiveCurrency } from "@/hooks/use-active-currency";
import type { ExpenseParticipant } from "@/types/expenses";

const COLLAPSED_LIMIT = 5;

interface ExpenseBreakdownProps {
  participants: ExpenseParticipant[];
  splitType: string;
}

export function ExpenseBreakdown({
  participants,
  splitType,
}: ExpenseBreakdownProps) {
  const { symbol } = useActiveCurrency();
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = participants.length > COLLAPSED_LIMIT;
  const visible =
    hasOverflow && !expanded
      ? participants.slice(0, COLLAPSED_LIMIT)
      : participants;
  const hiddenCount = participants.length - COLLAPSED_LIMIT;

  const splitLabel =
    splitType === "equal"
      ? "Equal split"
      : splitType === "exact"
        ? "Exact amounts"
        : splitType === "percentage"
          ? "Percentage split"
          : "Custom split";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Split breakdown
          </h4>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
            <UsersIcon className="size-2.5" />
            {participants.length}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
          {splitLabel}
        </span>
      </div>
      <div className="rounded-xl bg-muted/30 divide-y divide-border/30">
        <AnimatePresence initial={false}>
          {visible.map((p) => (
            <motion.div
              key={p.memberId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <UserAvatar name={p.name} size="sm" />
              <span className="text-sm font-medium flex-1 truncate">
                {p.name}
              </span>
              <span className="text-sm font-semibold">
                {symbol}
                {p.amount.toFixed(2)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-medium text-primary hover:bg-accent/30 transition-colors cursor-pointer"
          >
            {expanded ? "Show less" : `Show ${hiddenCount} more`}
            <ChevronDownIcon
              className={`size-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
