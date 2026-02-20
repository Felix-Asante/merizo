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
import { UserAvatar } from "@/ui/shared/avatar";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import type { SimplifiedDebt } from "@/utils/settlement/debt-simplifier";
import type { SettleMember } from "./types";

interface ConfirmSettleModalProps {
  open: boolean;
  onClose: () => void;
  suggestion: SimplifiedDebt | null;
  members: SettleMember[];
  onConfirm: (suggestion: SimplifiedDebt) => Promise<void>;
}

export function ConfirmSettleModal({
  open,
  onClose,
  suggestion,
  members,
  onConfirm,
}: ConfirmSettleModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getName = (id: string) => {
    const m = getMember(id);
    return m?.isCurrentUser ? "You" : (m?.name ?? "Unknown");
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsSuccess(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!suggestion) return;
    setIsLoading(true);
    try {
      await onConfirm(suggestion);
      setIsSuccess(true);
      setTimeout(handleClose, 1200);
    } catch {
      // handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  if (!suggestion) return null;

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

            <p className="text-sm text-muted-foreground text-center">
              Confirm that{" "}
              <span className="font-medium text-foreground">
                {getName(suggestion.from)}
              </span>{" "}
              paid{" "}
              <span className="font-medium text-foreground">
                ${suggestion.amount.toFixed(2)}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {getName(suggestion.to)}
              </span>
            </p>

            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full h-11 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Settling...
                </>
              ) : (
                "Confirm Settlement"
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
