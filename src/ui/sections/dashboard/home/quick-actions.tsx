"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon, HandCoinsIcon, UsersIcon, UserPlusIcon } from "lucide-react";
import { cn } from "@/ui/utils";

const actions = [
  {
    id: "add-expense",
    icon: PlusIcon,
    label: "Add Expense",
    color: "bg-primary/15 text-primary",
    href: "/expenses",
  },
  {
    id: "settle-up",
    icon: HandCoinsIcon,
    label: "Settle Up",
    color: "bg-emerald-500/15 text-emerald-400",
    href: "/settle",
  },
  {
    id: "create-group",
    icon: UsersIcon,
    label: "Create Group",
    color: "bg-blue-500/15 text-blue-400",
    href: "/groups/create",
  },
  {
    id: "invite",
    icon: UserPlusIcon,
    label: "Invite",
    color: "bg-violet-500/15 text-violet-400",
    href: null,
  },
];

interface QuickActionsProps {
  activeGroupId: string | null;
  onInvite: () => void;
}

export function QuickActions({ activeGroupId, onInvite }: QuickActionsProps) {
  const router = useRouter();

  const handleAction = (action: (typeof actions)[number]) => {
    if (action.id === "invite") {
      if (activeGroupId) {
        onInvite();
      } else {
        router.push("/groups/create");
      }
      return;
    }

    if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
    >
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleAction(action)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[120px] p-3 rounded-2xl",
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
