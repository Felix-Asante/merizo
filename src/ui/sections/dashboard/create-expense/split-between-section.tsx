"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckIcon, SearchIcon, UsersIcon } from "lucide-react";
import { cn } from "@/ui/utils";
import { Input } from "@/ui/base/input";
import { UserAvatar } from "@/ui/shared/avatar";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { Popover } from "radix-ui";
import type { ExpenseFormValues } from "@/validation/expense-validation";
import type { Member } from "./types";

interface SplitBetweenSectionProps {
  members: Member[];
}

const MAX_VISIBLE_AVATARS = 5;

export function SplitBetweenSection({ members }: SplitBetweenSectionProps) {
  const { watch, setValue, formState } = useFormContext<ExpenseFormValues>();
  const participantIds = watch("participantIds") ?? [];
  const error = formState.errors.participantIds?.message;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const filtered = useMemo(
    () =>
      members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  );

  const toggle = (memberId: string) => {
    const next = participantIds.includes(memberId)
      ? participantIds.filter((id) => id !== memberId)
      : [...participantIds, memberId];
    setValue("participantIds", next, { shouldValidate: true });
  };

  const selectAll = () => {
    setValue(
      "participantIds",
      members.map((m) => m.id),
      { shouldValidate: true },
    );
  };

  const deselectAll = () => {
    setValue("participantIds", [], { shouldValidate: true });
  };

  const selectedMembers = members.filter((m) => participantIds.includes(m.id));
  const visibleAvatars = selectedMembers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = selectedMembers.length - MAX_VISIBLE_AVATARS;
  const allSelected = participantIds.length === members.length;

  const checklist = (
    <div>
      <div className="px-4 pb-3 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="h-10 rounded-xl pl-9"
            autoFocus
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-primary font-medium hover:underline"
          >
            Select all
          </button>
          <span className="text-xs text-muted-foreground">&middot;</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-muted-foreground font-medium hover:underline hover:text-foreground"
          >
            Deselect all
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {participantIds.length} / {members.length}
          </span>
        </div>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No members found
          </p>
        ) : (
          filtered.map((member) => {
            const isSelected = participantIds.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggle(member.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left",
                  isSelected && "bg-primary/5",
                )}
              >
                <UserAvatar name={member.name} size="sm" />
                <span className="flex-1 text-sm font-medium truncate">
                  {member.isCurrentUser ? "You" : member.name}
                </span>
                <div
                  className={cn(
                    "flex items-center justify-center size-5 rounded-md border-2 transition-colors shrink-0",
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30",
                  )}
                >
                  {isSelected && (
                    <CheckIcon className="size-3 text-primary-foreground" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const trigger = (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors"
    >
      {selectedMembers.length > 0 ? (
        <div className="flex items-center -space-x-2">
          {visibleAvatars.map((m) => (
            <div key={m.id} className="ring-2 ring-card rounded-full">
              <UserAvatar name={m.name} size="sm" />
            </div>
          ))}
          {overflowCount > 0 && (
            <div className="flex items-center justify-center size-8 rounded-full bg-muted text-xs font-semibold ring-2 ring-card">
              +{overflowCount}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center size-8 rounded-full bg-muted">
          <UsersIcon className="size-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium">
          {selectedMembers.length === 0
            ? "Select participants"
            : allSelected
              ? "Everyone"
              : `${selectedMembers.length} of ${members.length} selected`}
        </p>
      </div>
      <span className="text-xs text-primary font-medium shrink-0">Edit</span>
    </motion.button>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="rounded-2xl bg-card border border-border/50 p-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Split between
      </h3>

      {isDesktop ? (
        <Popover.Root
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setSearch("");
          }}
        >
          <Popover.Trigger asChild>{trigger}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-(--radix-popover-trigger-width) rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 py-2"
              sideOffset={8}
              align="start"
            >
              {checklist}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ) : (
        <>
          <div onClick={() => setOpen(true)}>{trigger}</div>
          <BottomSheet
            open={open}
            onClose={() => {
              setOpen(false);
              setSearch("");
            }}
            title="Split between"
          >
            {checklist}
          </BottomSheet>
        </>
      )}

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </motion.section>
  );
}
