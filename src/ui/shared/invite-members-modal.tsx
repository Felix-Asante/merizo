"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "radix-ui";
import { XIcon, PlusIcon, ShareIcon, MailIcon } from "lucide-react";
import { Input } from "@/ui/base/input";
import { Button } from "@/ui/base/button";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { GroupCodeDisplay } from "@/ui/shared/group-code-display";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { toast } from "sonner";

interface InviteMembersModalProps {
  open: boolean;
  onClose: () => void;
  groupName: string;
  inviteCode: string;
}

export function InviteMembersModal({
  open,
  onClose,
  groupName,
  inviteCode,
}: InviteMembersModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");

  const reset = () => {
    setEmailInput("");
    setEmails([]);
    setEmailError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    if (emails.includes(email)) {
      setEmailError("Email already added");
      return;
    }

    setEmails((prev) => [...prev, email]);
    setEmailInput("");
    setEmailError("");
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const handleShareLink = async () => {
    const link = `${window.location.origin}/join?code=${inviteCode}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) return;
    toast.success(
      `Invites sent to ${emails.length} ${emails.length === 1 ? "person" : "people"}`,
    );
    handleClose();
  };

  const content = (
    <div className="px-4 pb-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        Invite people to{" "}
        <span className="font-medium text-foreground">{groupName}</span>
      </p>

      <div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address"
              type="email"
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addEmail}
            className="h-10 rounded-xl px-3"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        {emailError && (
          <p className="text-xs text-destructive mt-1.5">{emailError}</p>
        )}
      </div>

      <AnimatePresence>
        {emails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {emails.map((email) => (
              <motion.span
                key={email}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="p-0.5 rounded hover:bg-primary/20 transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-2 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Group Code</p>
          <GroupCodeDisplay code={inviteCode} />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleShareLink}
          className="w-full h-10 rounded-xl"
        >
          <ShareIcon className="size-4" />
          Copy Invite Link
        </Button>

        {emails.length > 0 && (
          <Button
            type="button"
            onClick={handleSendInvites}
            className="w-full h-10 rounded-xl"
          >
            Send {emails.length} {emails.length === 1 ? "Invite" : "Invites"}
          </Button>
        )}
      </div>
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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between p-4 pb-2">
              <Dialog.Title className="text-base font-semibold">
                Invite Members
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
    <BottomSheet open={open} onClose={handleClose} title="Invite Members">
      {content}
    </BottomSheet>
  );
}
