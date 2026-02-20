"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  CheckIcon,
  PlusIcon,
  KeyRoundIcon,
  UsersIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Popover } from "radix-ui";
import { cn } from "@/ui/utils";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";

export interface GroupSwitcherGroup {
  id: string;
  name: string;
  membersCount: number;
}

interface GroupSwitcherProps {
  groups: GroupSwitcherGroup[];
  activeGroupId: string;
  onGroupChange: (groupId: string) => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export function GroupSwitcher({
  groups,
  activeGroupId,
  onGroupChange,
  onCreateGroup,
  onJoinGroup,
}: GroupSwitcherProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const handleSelect = (groupId: string) => {
    onGroupChange(groupId);
    setOpen(false);
  };

  const groupList = (
    <div className="py-1">
      {groups.map((group) => (
        <motion.button
          key={group.id}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect(group.id)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left",
            group.id === activeGroupId && "bg-primary/5",
          )}
        >
          <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary/10 shrink-0">
            <UsersIcon className="size-4 text-primary" />
            {group.id === activeGroupId && (
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{group.name}</p>
            <p className="text-xs text-muted-foreground">
              {group.membersCount} members
            </p>
          </div>
          {group.id === activeGroupId && (
            <CheckIcon className="size-4 text-primary shrink-0" />
          )}
        </motion.button>
      ))}

      <div className="border-t border-border mt-1 pt-1 px-2 space-y-1">
        <button
          onClick={() => {
            onCreateGroup();
            setOpen(false);
          }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-accent transition-colors text-left"
        >
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <PlusIcon className="size-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Create New Group</span>
        </button>
        <button
          onClick={() => {
            onJoinGroup();
            setOpen(false);
          }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-accent transition-colors text-left"
        >
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <KeyRoundIcon className="size-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Join with Code</span>
        </button>
      </div>
    </div>
  );

  const trigger = (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl",
        "bg-card border border-border/50 hover:bg-accent/50 transition-colors",
        "lg:w-auto lg:min-w-[280px]",
      )}
    >
      <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary/10 shrink-0">
        <UsersIcon className="size-5 text-primary" />
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-card" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold truncate">{activeGroup?.name}</p>
        <p className="text-xs text-muted-foreground">
          {activeGroup?.membersCount} members
        </p>
      </div>
      <ChevronDownIcon
        className={cn(
          "size-4 text-muted-foreground transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </motion.button>
  );

  if (isDesktop) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[320px] rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            sideOffset={8}
            align="start"
          >
            {groupList}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Switch Group"
      >
        {groupList}
      </BottomSheet>
    </>
  );
}
