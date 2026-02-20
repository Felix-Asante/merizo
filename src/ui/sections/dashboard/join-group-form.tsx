import React, { useState } from "react";

import { motion } from "framer-motion";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/ui/base/button";
import { Input } from "@/ui/base/input";
import { toast } from "sonner";

interface JoinGroupFormProps {
  onJoin: (code: string) => Promise<void>;
  onClose: () => void;
}

export function JoinGroupForm(props: JoinGroupFormProps) {
  const { onJoin, onClose } = props;
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
      setTimeout(onClose, 1200);
    } catch {
      setError("Invalid code. Please try again.");
      setIsLoading(false);
    }
  };

  return (
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
}
