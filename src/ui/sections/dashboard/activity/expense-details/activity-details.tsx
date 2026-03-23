"use client";
"use memo";
import {
  deleteExpense,
  getExpenseDetails,
} from "@/services/expenses/expense-actions";
import type { ExpenseDetails } from "@/types/expenses";
import { Skeleton } from "@/ui/base/skeleton";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { motion } from "framer-motion";
import { AlertCircleIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteExpenseButton } from "./delete-expense-button";
import { ExpenseBreakdown } from "./expense-breakdown";
import { ExpenseHeader } from "./expense-header";
import { ExpenseMeta } from "./expense-meta";

interface ActivityDetailsProps {
  open: boolean;
  onClose: () => void;
  expenseId: string | null;
  groupId: string;
  onDeleted?: () => void;
}

export function ActivityDetails({
  open,
  onClose,
  expenseId,
  groupId,
  onDeleted,
}: ActivityDetailsProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!expenseId || !groupId) return;
    setLoading(true);
    setError(null);
    setExpense(null);

    const result = await getExpenseDetails(groupId, expenseId);
    if (result.error || !result.data) {
      setError(result.error ?? "Expense not found");
    } else {
      setExpense(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && expenseId) {
      fetchDetails();
    }
    if (!open) {
      setExpense(null);
      setError(null);
    }
  }, [open, expenseId]);

  const handleDelete = async () => {
    if (!expense) return;
    const result = await deleteExpense(groupId, expense.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Expense deleted");
    onClose();
    onDeleted?.();
  };

  const scrollContent = (
    <div className="px-4 pb-4 space-y-4">
      {loading ? (
        <DetailsSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : expense ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <ExpenseHeader expense={expense} />
          <ExpenseMeta expense={expense} />
          <ExpenseBreakdown
            participants={expense.participants}
            splitType={expense.splitType}
          />
        </motion.div>
      ) : null}
    </div>
  );

  const stickyFooter =
    !loading && !error && expense?.canDelete ? (
      <div className="px-4 py-3 border-t border-border/30 bg-card">
        <DeleteExpenseButton onDelete={handleDelete} />
      </div>
    ) : null;

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden flex flex-col max-h-[80vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between p-4 pb-2 shrink-0">
              <Dialog.Title className="text-base font-semibold">
                Expense Details
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XIcon className="size-4 text-muted-foreground" />
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {scrollContent}
            </div>
            {stickyFooter && <div className="shrink-0">{stickyFooter}</div>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Expense Details"
      footer={stickyFooter}
    >
      {scrollContent}
    </BottomSheet>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-7 w-24 rounded" />
        <Skeleton className="h-5 w-40 rounded" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-8 gap-3 text-center">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircleIcon className="size-5 text-destructive" />
      </div>
      <p className="text-sm font-medium">Something went wrong</p>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
