"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import { UserAvatar } from "@/ui/shared/avatar";
import type { Debt, SettleMember } from "./types";

interface OutstandingDebtsProps {
  debts: Debt[];
  members: SettleMember[];
}

export function OutstandingDebts({ debts, members }: OutstandingDebtsProps) {
  const [expanded, setExpanded] = useState(false);

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getName = (id: string) => {
    const m = getMember(id);
    return m?.isCurrentUser ? "You" : (m?.name ?? "Unknown");
  };

  const unsettled = debts.filter((d) => !d.settled);
  const settled = debts.filter((d) => d.settled);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div>
          <h3 className="text-sm font-semibold text-left">
            All Outstanding Balances
          </h3>
          <p className="text-xs text-muted-foreground text-left mt-0.5">
            {unsettled.length} pending &middot; {settled.length} settled
          </p>
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
              {unsettled.map((debt) => (
                <DebtRow
                  key={debt.id}
                  debt={debt}
                  fromName={getName(debt.from)}
                  toName={getName(debt.to)}
                  avatarName={getMember(debt.from)?.name ?? ""}
                />
              ))}
              {settled.map((debt) => (
                <DebtRow
                  key={debt.id}
                  debt={debt}
                  fromName={getName(debt.from)}
                  toName={getName(debt.to)}
                  avatarName={getMember(debt.from)?.name ?? ""}
                />
              ))}
              {debts.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No debts recorded
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function DebtRow({
  debt,
  fromName,
  toName,
  avatarName,
}: {
  debt: Debt;
  fromName: string;
  toName: string;
  avatarName: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-xl",
        debt.settled ? "opacity-50" : "bg-muted/30",
      )}
    >
      <UserAvatar name={avatarName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium truncate">{fromName}</span>
          <ArrowRightIcon className="size-3 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{toName}</span>
        </div>
      </div>
      <span className="text-sm font-semibold">${debt.amount.toFixed(2)}</span>
      <span
        className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          debt.settled
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400",
        )}
      >
        {debt.settled ? "Settled" : "Pending"}
      </span>
    </div>
  );
}
