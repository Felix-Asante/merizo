"use client";

import { motion } from "framer-motion";
import { ArrowDownLeftIcon, ArrowUpRightIcon, WalletIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import { AnimatedNumber } from "@/ui/shared/animated-number";

interface SummaryBalanceCardProps {
  totalBalance: number;
  youOwe: number;
  youAreOwed: number;
}

export function SummaryBalanceCard({
  totalBalance,
  youOwe,
  youAreOwed,
}: SummaryBalanceCardProps) {
  const isPositive = totalBalance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-card p-6 border border-primary/10 shadow-lg"
    >
      <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-primary/5 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20">
            <WalletIcon className="size-4 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Total expenses
          </p>
        </div>

        <p
          className={cn(
            "text-4xl font-bold tracking-tight mb-6",
            isPositive ? "text-emerald-400" : "text-red-400",
          )}
        >
          <AnimatedNumber value={Math.abs(totalBalance)} />
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <div className="flex items-center justify-center size-8 rounded-full bg-red-500/10">
              <ArrowUpRightIcon className="size-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You owe</p>
              <p className="text-sm font-semibold text-red-400">
                ${youOwe.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <div className="flex items-center justify-center size-8 rounded-full bg-emerald-500/10">
              <ArrowDownLeftIcon className="size-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You are owed</p>
              <p className="text-sm font-semibold text-emerald-400">
                ${youAreOwed.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
