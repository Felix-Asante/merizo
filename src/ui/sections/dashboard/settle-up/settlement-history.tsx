"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ArrowRightIcon, HistoryIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import { UserAvatar } from "@/ui/shared/avatar";
import { formatPeriodLabel } from "@/lib/settlement-engine";
import type { SettleMember, SettlementRecord } from "@/types/settlement";
import { useActiveCurrency } from "@/hooks/use-active-currency";

interface SettlementHistoryProps {
  settlements: SettlementRecord[];
  members: SettleMember[];
}

export function SettlementHistory({
  settlements,
  members,
}: SettlementHistoryProps) {
  const { symbol } = useActiveCurrency();
  const [expanded, setExpanded] = useState(false);

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getName = (id: string) => {
    const m = getMember(id);
    return m?.isCurrentUser ? "You" : (m?.name ?? "Unknown");
  };

  if (settlements.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HistoryIcon className="size-4 text-muted-foreground" />
          <div className="text-left">
            <h3 className="text-sm font-semibold">Settlement History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {settlements.length} record
              {settlements.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {settlements.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30"
                >
                  <UserAvatar
                    name={getMember(record.fromMemberId)?.name ?? ""}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-medium truncate">
                        {getName(record.fromMemberId)}
                      </span>
                      <ArrowRightIcon className="size-3 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        {getName(record.toMemberId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                        {formatPeriodLabel(
                          record.periodYear,
                          record.periodMonth,
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    {symbol}
                    {record.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
