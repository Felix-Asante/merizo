"use client";

import { motion } from "framer-motion";
import { TrendingDownIcon, TrendingUpIcon, ScaleIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import type { UserBalance } from "@/utils/settlement/debt-simplifier";

interface BalanceSummaryCardProps {
  balance: UserBalance;
}

export function BalanceSummaryCard({ balance }: BalanceSummaryCardProps) {
  const isOwing = balance.net < 0;
  const isOwed = balance.net > 0;
  const isBalanced = Math.abs(balance.net) < 0.01;

  return (
    <motion.div
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
      <div className="flex items-center gap-3 mb-4">
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
          <p className="text-sm text-muted-foreground">
            {isOwing ? "You owe" : isOwed ? "You are owed" : "All settled up"}
          </p>
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
