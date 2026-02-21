"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, PlusIcon, ShareIcon, MailIcon } from "lucide-react";
import { Input } from "@/ui/base/input";
import { Button } from "@/ui/base/button";
import { GroupCodeDisplay } from "@/ui/shared/group-code-display";
import { toast } from "sonner";
import type { CreateGroupFormValues } from "@/validation/group-validation";

interface InviteMembersSectionProps {
  groupCode: string;
}

export function InviteMembersSection({ groupCode }: InviteMembersSectionProps) {
  const { watch, setValue } = useFormContext<CreateGroupFormValues>();
  const memberEmails = watch("memberEmails");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    if (memberEmails.includes(email)) {
      setEmailError("Email already added");
      return;
    }

    setValue("memberEmails", [...memberEmails, email]);
    setEmailInput("");
    setEmailError("");
  };

  const removeEmail = (email: string) => {
    setValue(
      "memberEmails",
      memberEmails.filter((e) => e !== email),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const handleShareLink = async () => {
    const link = `${window.location.origin}/join?code=${groupCode}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border/50 p-4 space-y-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground">
        Invite Members
      </h3>

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
        {memberEmails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {memberEmails.map((email) => (
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
          <GroupCodeDisplay code={groupCode} />
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

        <p className="text-xs text-muted-foreground text-center">
          You can always invite more members later
        </p>
      </div>
    </motion.section>
  );
}
