"use client";

import { useState } from "react";
import { Button } from "@/ui/base/button";
import { Dialog } from "radix-ui";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface DeleteExpenseButtonProps {
  onDelete: () => Promise<void>;
}

export function DeleteExpenseButton({ onDelete }: DeleteExpenseButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => setOpen(true)}
        className="w-full h-11 rounded-xl"
      >
        <Trash2Icon className="size-4" />
        Delete Expense
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-60 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border border-border/50 shadow-xl p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Dialog.Title className="text-base font-semibold mb-1">
              Delete this expense?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-4">
              This will permanently remove the expense and its split data. This
              action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="rounded-xl"
              >
                {isDeleting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
