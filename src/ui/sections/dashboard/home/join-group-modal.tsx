"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "radix-ui";
import { CheckCircle2Icon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/ui/base/button";
import { Input } from "@/ui/base/input";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export function JoinGroupModal({ open, onClose, onJoin }: JoinGroupModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setCode("");
    setError("");
    setSuccess(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a group code");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await onJoin(code.trim());
      setSuccess(true);
      setTimeout(handleClose, 1200);
    } catch {
      setError("Invalid code. Please try again.");
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center py-8 gap-3"
        >
          <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2Icon className="size-8 text-emerald-400" />
          </div>
          <p className="text-base font-semibold">Joined successfully!</p>
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Enter the group code shared by a member to join their group.
          </p>
          <div>
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Enter group code"
              className="h-11 rounded-xl"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive mt-1.5">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading && <Loader2Icon className="size-4 animate-spin" />}
            {isLoading ? "Joining..." : "Join Group"}
          </Button>
        </>
      )}
    </form>
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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between p-4 pb-2">
              <Dialog.Title className="text-base font-semibold">
                Join with Code
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XIcon className="size-4 text-muted-foreground" />
              </Dialog.Close>
            </div>
            {formContent}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Join with Code">
      {formContent}
    </BottomSheet>
  );
}
