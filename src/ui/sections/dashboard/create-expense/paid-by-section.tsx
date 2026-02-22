"use client";

import { useCurrentUser } from "@/hooks/api/use-current-user";
import type { GroupMember } from "@/types/groups";
import { Input } from "@/ui/base/input";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { UserAvatar } from "@/ui/shared/avatar";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { cn } from "@/ui/utils";
import type { ExpenseFormValues } from "@/validation/expense-validation";
import { motion } from "framer-motion";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Popover } from "radix-ui";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MemberSkimmer } from "./member-skimmer";

interface PaidBySectionProps {
  members: GroupMember[];
  isMembersLoading: boolean;
}

export function PaidBySection(props: PaidBySectionProps) {
  const { members, isMembersLoading } = props;
  const { watch, setValue } = useFormContext<ExpenseFormValues>();
  const paidById = watch("paidById");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { currentUser } = useCurrentUser();

  const payer = members.find((m) => m.id === paidById);

  const filtered = useMemo(
    () =>
      members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  );

  const handleSelect = (id: string) => {
    setValue("paidById", id);
    setOpen(false);
    setSearch("");
  };

  const memberList = (
    <div>
      <div className="px-4 pb-3">
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
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No members found
          </p>
        ) : (
          filtered.map((member) => {
            const isSelected = paidById === member.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left",
                  isSelected && "bg-primary/5",
                )}
              >
                <UserAvatar name={member.name} size="sm" />
                <span className="flex-1 text-sm font-medium truncate">
                  {member.userId === currentUser?.id ? "You" : member.name}
                </span>
                {isSelected && (
                  <div className="flex items-center justify-center size-5 rounded-full bg-primary shrink-0">
                    <CheckIcon className="size-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const trigger = isMembersLoading ? (
    <MemberSkimmer />
  ) : (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors"
      disabled={isMembersLoading}
    >
      <UserAvatar name={payer?.name ?? ""} size="sm" />
      <span className="flex-1 text-sm font-semibold text-left truncate">
        {payer?.userId === currentUser?.id ? "You" : payer?.name}
      </span>
      <ChevronDownIcon
        className={cn(
          "size-4 text-muted-foreground transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </motion.button>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border/50 p-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Paid by
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
              {memberList}
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
            title="Paid by"
          >
            {memberList}
          </BottomSheet>
        </>
      )}
    </motion.section>
  );
}
