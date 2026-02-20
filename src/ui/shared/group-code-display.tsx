"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/ui/utils";

interface GroupCodeDisplayProps {
  code: string;
  className?: string;
}

export function GroupCodeDisplay({ code, className }: GroupCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50",
        className,
      )}
    >
      <p className="flex-1 text-center text-2xl font-bold tracking-[0.3em] font-mono">
        {code}
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleCopy}
        className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <CheckIcon className="size-4 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <CopyIcon className="size-4 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
