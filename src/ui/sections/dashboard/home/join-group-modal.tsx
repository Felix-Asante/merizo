"use client";

import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { JoinGroupForm } from "../join-group-form";

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export function JoinGroupModal({ open, onClose, onJoin }: JoinGroupModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleClose = () => {
    onClose();
  };

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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between p-4 pb-2">
              <Dialog.Title className="text-base font-semibold">
                Join with Code
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XIcon className="size-4 text-muted-foreground" />
              </Dialog.Close>
            </div>
            <JoinGroupForm onJoin={onJoin} onClose={handleClose} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Join with Code">
      <JoinGroupForm onJoin={onJoin} onClose={handleClose} />
    </BottomSheet>
  );
}
