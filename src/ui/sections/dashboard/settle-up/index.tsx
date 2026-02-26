"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/base/button";
import {
  getContextDebts,
  computeUserBalance,
  generateSuggestions,
  type SettlementSuggestion,
} from "@/lib/settlement-engine";
import { recordSettlement } from "@/services/expenses/expense-actions";
import type { ManualSettlementFormValues } from "@/validation/settlement-validation";
import type { SettlementPageData, SettlementContext } from "@/types/settlement";
import { SettleNavbar } from "./settle-navbar";
import { PeriodSelector } from "./period-selector";
import { SettlementOverviewCard } from "./settlement-overview-card";
import { SettlementOptions } from "./settlement-options";
import { SettleModal } from "./settle-modal";
import { ManualSettlementModal } from "./manual-settlement-modal";
import { SettlementHistory } from "./settlement-history";

interface SettleUpProps {
  settlementData: SettlementPageData;
  groupId: string;
}

export function SettleUp({ settlementData, groupId }: SettleUpProps) {
  const { currentUserMemberId, members, periods, debts, settlements } =
    settlementData;

  const [context, setContext] = useState<SettlementContext>("open");
  const [confirmTarget, setConfirmTarget] =
    useState<SettlementSuggestion | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const contextDebts = useMemo(
    () => getContextDebts(debts, context),
    [debts, context],
  );

  const balance = useMemo(
    () => computeUserBalance(contextDebts, currentUserMemberId),
    [contextDebts, currentUserMemberId],
  );

  const suggestions = useMemo(
    () => generateSuggestions(contextDebts),
    [contextDebts],
  );

  const handleOpenConfirm = useCallback((suggestion: SettlementSuggestion) => {
    setConfirmTarget(suggestion);
  }, []);

  const handleSettleSuggestion = useCallback(
    async (
      suggestion: SettlementSuggestion,
      amount: number,
      note: string,
    ) => {
      const periodId = context === "open" ? "open" : context;
      if (!periodId) return;

      const result = await recordSettlement({
        groupId,
        periodId,
        fromMemberId: suggestion.from,
        toMemberId: suggestion.to,
        amount,
        note: note || undefined,
      });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Settlement recorded!");
    },
    [groupId, context],
  );

  const handleManualSettle = useCallback(
    async (data: ManualSettlementFormValues) => {
      const result = await recordSettlement({
        groupId,
        periodId: data.periodId,
        fromMemberId: data.fromId,
        toMemberId: data.toId,
        amount: data.amount,
        note: data.note || undefined,
      });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Settlement recorded!");
    },
    [groupId],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl mx-auto"
    >
      <SettleNavbar />

      <div className="space-y-4">
        <PeriodSelector
          periods={periods}
          debts={debts}
          selected={context}
          onSelect={setContext}
        />

        <SettlementOverviewCard
          balance={balance}
          context={context}
          periods={periods}
          debts={debts}
        />

        <SettlementOptions
          suggestions={suggestions}
          members={members}
          currentUserMemberId={currentUserMemberId}
          context={context}
          periods={periods}
          onSettle={handleOpenConfirm}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <Button
            variant="outline"
            onClick={() => setManualModalOpen(true)}
            className="w-full h-11 rounded-xl"
          >
            <PlusIcon className="size-4" />
            Record Custom Settlement
          </Button>
        </motion.div>

        <SettlementHistory settlements={settlements} members={members} />
      </div>

      <SettleModal
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        suggestion={confirmTarget}
        members={members}
        onConfirm={handleSettleSuggestion}
      />

      <ManualSettlementModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        members={members}
        periods={periods}
        onSubmit={handleManualSettle}
      />
    </motion.div>
  );
}
