"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "radix-ui";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "@/ui/base/button";
import { Input } from "@/ui/base/input";
import { UserAvatar } from "@/ui/shared/avatar";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { cn } from "@/ui/utils";
import type { SettlementSuggestion } from "@/lib/settlement-engine";
import type { SettleMember } from "@/types/settlement";

interface SettleModalProps {
  open: boolean;
  onClose: () => void;
  suggestion: SettlementSuggestion | null;
  members: SettleMember[];
  onConfirm: (
    suggestion: SettlementSuggestion,
    amount: number,
    note: string,
  ) => Promise<void>;
}

export function SettleModal({
  open,
  onClose,
  suggestion,
  members,
  onConfirm,
}: SettleModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPartial, setIsPartial] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getName = (id: string) => {
    const m = getMember(id);
    return m?.isCurrentUser ? "You" : (m?.name ?? "Unknown");
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsSuccess(false);
    setIsPartial(false);
    setCustomAmount("");
    setNote("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!suggestion) return;
    const amount = isPartial
      ? parseFloat(customAmount) || 0
      : suggestion.amount;
    if (amount <= 0 || amount > suggestion.amount) return;

    setIsLoading(true);
    try {
      await onConfirm(suggestion, amount, note);
      setIsSuccess(true);
      setTimeout(handleClose, 1200);
    } catch {
      // handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  if (!suggestion) return null;

  const settlementAmount = isPartial
    ? parseFloat(customAmount) || 0
    : suggestion.amount;
  const isValidAmount =
    settlementAmount > 0 && settlementAmount <= suggestion.amount;

  const content = (
    <div className="px-4 pb-6">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-8 gap-3"
          >
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2Icon className="size-8 text-emerald-400" />
            </div>
            <p className="text-base font-semibold">Settlement recorded!</p>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="flex flex-col items-center gap-1.5">
                <UserAvatar
                  name={getMember(suggestion.from)?.name ?? ""}
                  size="lg"
                />
                <span className="text-xs font-medium">
                  {getName(suggestion.from)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowRightIcon className="size-5 text-muted-foreground" />
                <span className="text-lg font-bold text-primary">
                  ${suggestion.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <UserAvatar
                  name={getMember(suggestion.to)?.name ?? ""}
                  size="lg"
                />
                <span className="text-xs font-medium">
                  {getName(suggestion.to)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPartial(false);
                  setCustomAmount("");
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-xl border transition-colors",
                  !isPartial
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border/50 text-muted-foreground hover:bg-accent",
                )}
              >
                Full (${suggestion.amount.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setIsPartial(true)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-xl border transition-colors",
                  isPartial
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border/50 text-muted-foreground hover:bg-accent",
                )}
              >
                Custom Amount
              </button>
            </div>

            <AnimatePresence>
              {isPartial && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                        $
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={customAmount}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
                            setCustomAmount(raw);
                          }
                        }}
                        placeholder="0.00"
                        className="h-11 rounded-xl pl-7"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Max: ${suggestion.amount.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="h-10 rounded-xl text-sm"
            />

            <Button
              onClick={handleConfirm}
              disabled={isLoading || !isValidAmount}
              className="w-full h-11 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Settling...
                </>
              ) : (
                `Settle $${settlementAmount.toFixed(2)}`
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between p-4 pb-2">
              <Dialog.Title className="text-base font-semibold">
                Settle Up
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XIcon className="size-4 text-muted-foreground" />
              </Dialog.Close>
            </div>
            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Settle Up">
      {content}
    </BottomSheet>
  );
}
