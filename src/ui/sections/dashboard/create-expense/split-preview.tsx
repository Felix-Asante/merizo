"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import { UserAvatar } from "@/ui/shared/avatar";
import { calculatePreview } from "@/utils/expense/split-calculator";
import type { ExpenseFormValues } from "@/adapters/validation/expense-validation";
import type { Member } from "./types";

interface SplitPreviewProps {
  members: Member[];
  currentUserId: string;
}

const COLLAPSED_LIMIT = 3;

export function SplitPreview({ members, currentUserId }: SplitPreviewProps) {
  const { watch } = useFormContext<ExpenseFormValues>();
  const amount = watch("amount");
  const paidById = watch("paidById");
  const participantIds = watch("participantIds");
  const splitMethod = watch("splitMethod");
  const customSplits = watch("customSplits");
  const [expanded, setExpanded] = useState(false);

  if (amount <= 0 || !participantIds?.length) return null;

  const payer = members.find((m) => m.id === paidById);
  const payerIsCurrentUser = paidById === currentUserId;

  const preview = calculatePreview(
    amount,
    paidById,
    participantIds,
    splitMethod,
    customSplits,
    members,
    currentUserId,
  );

  if (preview.length === 0) return null;

  const needsCollapse = preview.length > COLLAPSED_LIMIT;
  const visible = expanded ? preview : preview.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = preview.length - COLLAPSED_LIMIT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.25 }}
      className="rounded-2xl bg-card border border-border/50 p-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Split preview
      </h3>

      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
        <UserAvatar name={payer?.name ?? ""} size="sm" />
        <span className="text-sm font-medium">
          {payerIsCurrentUser ? "You" : payer?.name} paid
        </span>
        <span className="ml-auto text-sm font-bold">${amount.toFixed(2)}</span>
      </div>

      <div className="space-y-2">
        {visible.map((item) => (
          <div key={item.memberId} className="flex items-center gap-2">
            <UserAvatar name={item.name} size="sm" />
            <span className="text-sm truncate">{item.name}</span>
            <ArrowRightIcon className="size-3 text-muted-foreground shrink-0" />
            <span
              className={cn(
                "ml-auto text-sm font-semibold shrink-0",
                item.relation === "owes_you"
                  ? "text-emerald-400"
                  : "text-red-400",
              )}
            >
              ${item.share.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50 w-full justify-center text-xs text-primary font-medium hover:underline"
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
          <ChevronDownIcon
            className={cn(
              "size-3.5 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </motion.section>
  );
}
