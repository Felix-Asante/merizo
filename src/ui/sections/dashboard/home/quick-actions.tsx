"use client";

import { motion } from "framer-motion";
import {
  PlusIcon,
  HandCoinsIcon,
  UsersIcon,
  UserPlusIcon,
} from "lucide-react";
import { cn } from "@/ui/utils";

const actions = [
  {
    icon: PlusIcon,
    label: "Add Expense",
    color: "bg-primary/15 text-primary",
  },
  {
    icon: HandCoinsIcon,
    label: "Settle Up",
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: UsersIcon,
    label: "Create Group",
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    icon: UserPlusIcon,
    label: "Invite",
    color: "bg-violet-500/15 text-violet-400",
  },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
    >
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl",
              "bg-card border border-border/50 hover:bg-accent transition-colors",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center size-11 rounded-xl",
                action.color,
              )}
            >
              <action.icon className="size-5" />
            </div>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
