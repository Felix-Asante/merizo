"use client";

import { motion } from "framer-motion";
import { UsersIcon, PlusIcon, KeyRoundIcon } from "lucide-react";
import { Button } from "@/ui/base/button";

interface NoGroupViewProps {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export function NoGroupView({ onCreateGroup, onJoinGroup }: NoGroupViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center min-h-[60vh] px-6 max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center justify-center size-20 rounded-3xl bg-primary/10 mb-6"
      >
        <UsersIcon className="size-9 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-2xl font-bold mb-2"
      >
        You&apos;re not in any group yet
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="text-sm text-muted-foreground mb-8 max-w-xs"
      >
        Create a group to start splitting expenses with friends, roommates, or
        trips.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
      >
        <Button onClick={onCreateGroup} className="h-11 px-6">
          <PlusIcon className="size-4" />
          Create a Group
        </Button>
        <Button
          variant="outline"
          onClick={onJoinGroup}
          className="h-11 px-6"
        >
          <KeyRoundIcon className="size-4" />
          Join with Code
        </Button>
      </motion.div>
    </motion.div>
  );
}
