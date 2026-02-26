"use client";

import { motion } from "framer-motion";
import { CalendarIcon, WalletIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import {
  formatPeriodLabel,
  getPeriodSettlementStatus,
  type PeriodSettlementStatus,
} from "@/lib/settlement-engine";
import type {
  SettlementPeriod,
  PeriodDebt,
  SettlementContext,
} from "@/types/settlement";

interface PeriodSelectorProps {
  periods: SettlementPeriod[];
  debts: PeriodDebt[];
  selected: SettlementContext;
  onSelect: (context: SettlementContext) => void;
}

export function PeriodSelector({
  periods,
  debts,
  selected,
  onSelect,
}: PeriodSelectorProps) {
  const sortedPeriods = [...periods].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <PeriodChip
        label="Open Balance"
        icon={<WalletIcon className="size-3.5" />}
        isActive={selected === "open"}
        onClick={() => onSelect("open")}
      />
      {sortedPeriods.map((period) => {
        const status = getPeriodSettlementStatus(debts, period.id);
        return (
          <PeriodChip
            key={period.id}
            label={formatPeriodLabel(period.year, period.month)}
            icon={<CalendarIcon className="size-3.5" />}
            isActive={selected === period.id}
            status={status}
            onClick={() => onSelect(period.id)}
          />
        );
      })}
    </motion.div>
  );
}

function PeriodChip({
  label,
  icon,
  isActive,
  status,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  status?: PeriodSettlementStatus;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors",
        isActive
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-card border-border/50 text-muted-foreground hover:bg-accent",
      )}
    >
      {icon}
      <span>{label}</span>
      {status === "partially_settled" && (
        <span className="size-1.5 rounded-full bg-amber-400" />
      )}
      {status === "settled" && (
        <span className="size-1.5 rounded-full bg-emerald-400" />
      )}
    </motion.button>
  );
}
