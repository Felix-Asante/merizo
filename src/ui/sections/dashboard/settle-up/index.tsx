"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/base/button";
import {
  simplifyDebts,
  calculateUserBalance,
  type SimplifiedDebt,
} from "@/utils/settlement/debt-simplifier";
import type { ManualSettlementFormValues } from "@/validation/settlement-validation";
import { SettleNavbar } from "./settle-navbar";
import { BalanceSummaryCard } from "./balance-summary-card";
import { SettlementSuggestions } from "./settlement-suggestions";
import { OutstandingDebts } from "./outstanding-debts";
import { ConfirmSettleModal } from "./confirm-settle-modal";
import { ManualSettlementModal } from "./manual-settlement-modal";
import { CURRENT_USER_ID, SETTLE_MEMBERS, DUMMY_DEBTS } from "./dummy-data";
import type { Debt } from "./types";

export function SettleUp() {
  const [debts, setDebts] = useState<Debt[]>(DUMMY_DEBTS);
  const [confirmTarget, setConfirmTarget] = useState<SimplifiedDebt | null>(
    null,
  );
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const balance = useMemo(
    () => calculateUserBalance(debts, CURRENT_USER_ID),
    [debts],
  );

  const suggestions = useMemo(() => simplifyDebts(debts), [debts]);

  const handleOpenConfirm = useCallback((suggestion: SimplifiedDebt) => {
    setConfirmTarget(suggestion);
  }, []);

  const handleSettleSuggestion = useCallback(
    async (suggestion: SimplifiedDebt) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDebts((prev) =>
        prev.map((d) => {
          if (d.settled) return d;
          const isBetween =
            (d.from === suggestion.from && d.to === suggestion.to) ||
            (d.from === suggestion.to && d.to === suggestion.from);
          return isBetween ? { ...d, settled: true } : d;
        }),
      );
      toast.success("Settlement recorded!");
    },
    [],
  );

  const handleManualSettle = useCallback(
    async (data: ManualSettlementFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDebts((prev) =>
        prev.map((d) => {
          if (d.settled) return d;
          const isBetween =
            (d.from === data.fromId && d.to === data.toId) ||
            (d.from === data.toId && d.to === data.fromId);
          return isBetween ? { ...d, settled: true } : d;
        }),
      );
      toast.success("Settlement recorded!");
    },
    [],
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
        <BalanceSummaryCard balance={balance} />

        <SettlementSuggestions
          suggestions={suggestions}
          members={SETTLE_MEMBERS}
          currentUserId={CURRENT_USER_ID}
          onSettle={handleOpenConfirm}
        />

        <OutstandingDebts debts={debts} members={SETTLE_MEMBERS} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={() => setManualModalOpen(true)}
            className="w-full h-11 rounded-xl"
          >
            <PlusIcon className="size-4" />
            Record Manual Settlement
          </Button>
        </motion.div>
      </div>

      <ConfirmSettleModal
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        suggestion={confirmTarget}
        members={SETTLE_MEMBERS}
        onConfirm={handleSettleSuggestion}
      />

      <ManualSettlementModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        members={SETTLE_MEMBERS}
        onSubmit={handleManualSettle}
      />
    </motion.div>
  );
}
