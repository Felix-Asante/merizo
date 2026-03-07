"use client";
"use memo";

import {
  computeUserBalance,
  generateSuggestions,
  getContextDebts,
  type SettlementSuggestion,
} from "@/lib/settlement-engine";
import { recordSettlement } from "@/services/expenses/expense-actions";
import type { SettlementContext, SettlementPageData } from "@/types/settlement";
import { Button } from "@/ui/base/button";
import type { ManualSettlementFormValues } from "@/validation/settlement-validation";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ManualSettlementModal } from "./manual-settlement-modal";
import { PeriodSelector } from "./period-selector";
import { SettleModal } from "./settle-modal";
import { SettleNavbar } from "./settle-navbar";
import { SettlementHistory } from "./settlement-history";
import { SettlementOptions } from "./settlement-options";
import { SettlementOverviewCard } from "./settlement-overview-card";

interface SettleUpProps {
  settlementData: SettlementPageData;
  groupId: string;
}

export function SettleUp({ settlementData, groupId }: SettleUpProps) {
  const { currentUserMemberId, members, periods, debts, settlements } =
    settlementData;

  const defaultContext =
    periods.find(
      (p) =>
        p.month === new Date().getMonth() &&
        p.year === new Date().getFullYear(),
    )?.id ?? periods[0]?.id;

  const [context, setContext] = useState<SettlementContext>(defaultContext);
  const [confirmTarget, setConfirmTarget] =
    useState<SettlementSuggestion | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const contextDebts = getContextDebts(debts, context);

  const balance = computeUserBalance(contextDebts, currentUserMemberId);

  const suggestions = generateSuggestions(contextDebts);

  const handleOpenConfirm = (suggestion: SettlementSuggestion) => {
    setConfirmTarget(suggestion);
  };

  const handleSettleSuggestion = async (
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
  };

  const handleManualSettle = async (data: ManualSettlementFormValues) => {
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
  };

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
