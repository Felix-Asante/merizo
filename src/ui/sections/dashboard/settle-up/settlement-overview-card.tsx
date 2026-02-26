"use client";

import { motion } from "framer-motion";
import { TrendingDownIcon, TrendingUpIcon, ScaleIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import type { UserBalance } from "@/lib/settlement-engine";
import {
  getContextLabel,
  getSettlementProgress,
  getPeriodSettlementStatus,
  type PeriodSettlementStatus,
} from "@/lib/settlement-engine";
import type {
  SettlementContext,
  SettlementPeriod,
  PeriodDebt,
} from "@/types/settlement";

interface SettlementOverviewCardProps {
  balance: UserBalance;
  context: SettlementContext;
  periods: SettlementPeriod[];
  debts: PeriodDebt[];
}

export function SettlementOverviewCard({
  balance,
  context,
  periods,
  debts,
}: SettlementOverviewCardProps) {
  const isOwing = balance.net < 0;
  const isOwed = balance.net > 0;
  const isBalanced = Math.abs(balance.net) < 0.01;

  const contextLabel = getContextLabel(context, periods);
  const showProgress = context !== "open";
  const progress = showProgress ? getSettlementProgress(debts, context) : 0;
  const periodStatus = showProgress
    ? getPeriodSettlementStatus(debts, context)
    : null;

  return (
    <motion.div
      key={context}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-2xl p-5 border border-border/50",
        isOwing && "bg-linear-to-br from-red-500/10 to-card",
        isOwed && "bg-linear-to-br from-emerald-500/10 to-card",
        isBalanced && "bg-linear-to-br from-blue-500/10 to-card",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center",
              isOwing && "bg-red-500/15",
              isOwed && "bg-emerald-500/15",
              isBalanced && "bg-blue-500/15",
            )}
          >
            {isOwing && <TrendingDownIcon className="size-5 text-red-400" />}
            {isOwed && <TrendingUpIcon className="size-5 text-emerald-400" />}
            {isBalanced && <ScaleIcon className="size-5 text-blue-400" />}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{contextLabel}</p>
            <p
              className={cn(
                "text-2xl font-bold",
                isOwing && "text-red-400",
                isOwed && "text-emerald-400",
                isBalanced && "text-blue-400",
              )}
            >
              ${Math.abs(balance.net).toFixed(2)}
            </p>
          </div>
        </div>

        {periodStatus && <StatusBadge status={periodStatus} />}
      </div>

      {showProgress && progress > 0 && progress < 100 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Settlement progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-emerald-400"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-background/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">You owe</p>
          <p className="text-sm font-semibold text-red-400">
            ${balance.youOwe.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl bg-background/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Owed to you</p>
          <p className="text-sm font-semibold text-emerald-400">
            ${balance.youAreOwed.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: PeriodSettlementStatus }) {
  const config = {
    open: { label: "Open", className: "bg-amber-500/10 text-amber-400" },
    partially_settled: {
      label: "Partial",
      className: "bg-blue-500/10 text-blue-400",
    },
    settled: {
      label: "Settled",
      className: "bg-emerald-500/10 text-emerald-400",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={cn(
        "text-[10px] font-medium px-2.5 py-1 rounded-full",
        className,
      )}
    >
      {label}
    </span>
  );
}
