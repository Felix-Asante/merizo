"use client";

import { motion } from "framer-motion";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/ui/base/button";
import { UserAvatar } from "@/ui/shared/avatar";
import { cn } from "@/ui/utils";
import {
  getContextLabel,
  type SettlementSuggestion,
} from "@/lib/settlement-engine";
import type {
  SettleMember,
  SettlementContext,
  SettlementPeriod,
} from "@/types/settlement";

interface SettlementOptionsProps {
  suggestions: SettlementSuggestion[];
  members: SettleMember[];
  currentUserMemberId: string;
  context: SettlementContext;
  periods: SettlementPeriod[];
  onSettle: (suggestion: SettlementSuggestion) => void;
}

export function SettlementOptions({
  suggestions,
  members,
  currentUserMemberId,
  context,
  periods,
  onSettle,
}: SettlementOptionsProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);
  const getName = (id: string) => {
    const m = getMember(id);
    return m?.isCurrentUser ? "You" : (m?.name ?? "Unknown");
  };

  const contextLabel = getContextLabel(context, periods);

  if (suggestions.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-2xl bg-card border border-border/50 p-6 text-center"
      >
        <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <SparklesIcon className="size-6 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold mb-1">All settled!</p>
        <p className="text-xs text-muted-foreground">
          No outstanding debts
          {context === "open"
            ? " across open balances"
            : ` in ${contextLabel}`}
        </p>
      </motion.section>
    );
  }

  const userSuggestions = suggestions.filter(
    (s) => s.from === currentUserMemberId || s.to === currentUserMemberId,
  );
  const otherSuggestions = suggestions.filter(
    (s) => s.from !== currentUserMemberId && s.to !== currentUserMemberId,
  );
  const sorted = [...userSuggestions, ...otherSuggestions];

  return (
    <motion.section
      key={context}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground">
          Suggested Settlements
        </h3>
      </div>

      <div className="space-y-2">
        {sorted.map((suggestion, index) => {
          const isUserInvolved =
            suggestion.from === currentUserMemberId ||
            suggestion.to === currentUserMemberId;

          return (
            <motion.div
              key={`${suggestion.from}-${suggestion.to}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.08 * index }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border",
                isUserInvolved
                  ? "bg-card border-primary/20"
                  : "bg-card border-border/50",
              )}
            >
              <UserAvatar
                name={getMember(suggestion.from)?.name ?? ""}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium truncate">
                    {getName(suggestion.from)}
                  </span>
                  <ArrowRightIcon className="size-3 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">
                    {getName(suggestion.to)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">
                    ${suggestion.amount.toFixed(2)}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                    {contextLabel}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant={isUserInvolved ? "default" : "outline"}
                className="rounded-xl h-8 px-3 text-xs shrink-0"
                onClick={() => onSettle(suggestion)}
              >
                Settle
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
