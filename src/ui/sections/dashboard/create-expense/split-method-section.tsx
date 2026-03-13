"use client";
"use memo";
import type { GroupMember } from "@/types/groups";
import { Input } from "@/ui/base/input";
import { UserAvatar } from "@/ui/shared/avatar";
import { Tab } from "@/ui/shared/tab";
import { cn } from "@/ui/utils";
import { getSplitTotal } from "@/utils/expense/split-calculator";
import type { ExpenseFormValues } from "@/validation/expense-validation";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { SplitMethod } from "@/types";
import { useCurrentUser } from "@/hooks/api/use-current-user";
import { useActiveCurrency } from "@/hooks/use-active-currency";

const SPLIT_METHOD_OPTIONS: { value: SplitMethod; label: string }[] = [
  { value: "equal", label: "Equal" },
  { value: "exact", label: "Exact" },
  { value: "percentage", label: "Percent" },
];

interface SplitMethodSectionProps {
  members: GroupMember[];
}

export function SplitMethodSection({ members }: SplitMethodSectionProps) {
  const { watch, setValue, formState } = useFormContext<ExpenseFormValues>();
  const splitMethod = watch("splitMethod");
  const participantIds = watch("participantIds");
  const amount = watch("amount");
  const customSplits = watch("customSplits");
  const error =
    formState.errors.customSplits?.root?.message ??
    (formState.errors.customSplits?.message as string | undefined);

  const participants = members.filter((m) => participantIds?.includes(m.id));

  const handleMethodChange = (method: SplitMethod) => {
    setValue("splitMethod", method);
    if (method === "equal") {
      setValue("customSplits", {});
    } else if (method === "exact") {
      const share = participants.length > 0 ? amount / participants.length : 0;
      const splits: Record<string, number> = {};
      participants.forEach((m) => {
        splits[m.id] = Math.round(share * 100) / 100;
      });
      setValue("customSplits", splits);
    } else {
      const pct = participants.length > 0 ? 100 / participants.length : 0;
      const splits: Record<string, number> = {};
      participants.forEach((m) => {
        splits[m.id] = Math.round(pct * 100) / 100;
      });
      setValue("customSplits", splits);
    }
  };

  const updateCustomSplit = (memberId: string, value: number) => {
    setValue("customSplits", { ...customSplits, [memberId]: value });
  };

  const distributeEvenly = () => {
    if (participants.length === 0) return;
    const splits: Record<string, number> = {};
    if (splitMethod === "exact") {
      const share = amount / participants.length;
      participants.forEach((m) => {
        splits[m.id] = Math.round(share * 100) / 100;
      });
    } else {
      const pct = 100 / participants.length;
      participants.forEach((m) => {
        splits[m.id] = Math.round(pct * 100) / 100;
      });
    }
    setValue("customSplits", splits);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border/50 p-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Split method
      </h3>

      <Tab
        options={SPLIT_METHOD_OPTIONS}
        value={splitMethod}
        onChange={handleMethodChange}
        layoutId="splitMethodIndicator"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={splitMethod}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="mt-4"
        >
          {splitMethod === "equal" && (
            <EqualPreview amount={amount} count={participants.length} />
          )}

          {splitMethod === "exact" && (
            <CustomInputs
              participants={participants}
              customSplits={customSplits}
              onUpdate={updateCustomSplit}
              suffix="$"
              total={getSplitTotal(participantIds ?? [], customSplits)}
              target={amount}
              targetLabel={`$${amount.toFixed(2)}`}
              onDistribute={distributeEvenly}
            />
          )}

          {splitMethod === "percentage" && (
            <CustomInputs
              participants={participants}
              customSplits={customSplits}
              onUpdate={updateCustomSplit}
              suffix="%"
              total={getSplitTotal(participantIds ?? [], customSplits)}
              target={100}
              targetLabel="100%"
              onDistribute={distributeEvenly}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </motion.section>
  );
}

function EqualPreview({ amount, count }: { amount: number; count: number }) {
  const { symbol } = useActiveCurrency();
  if (count === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Select participants to see the split
      </p>
    );
  }

  const share = amount / count;

  return (
    <div className="text-center py-4">
      <p className="text-2xl font-bold">
        {symbol} &nbsp;
        {share.toFixed(2)}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        per person &middot; {count} {count === 1 ? "person" : "people"}
      </p>
    </div>
  );
}

interface CustomInputsProps {
  participants: GroupMember[];
  customSplits: Record<string, number>;
  onUpdate: (id: string, value: number) => void;
  suffix: string;
  total: number;
  target: number;
  targetLabel: string;
  onDistribute: () => void;
}
function CustomInputs(props: CustomInputsProps) {
  const {
    participants,
    customSplits,
    onUpdate,
    suffix,
    total,
    target,
    targetLabel,
    onDistribute,
  } = props;
  const { currentUser } = useCurrentUser();
  const { symbol } = useActiveCurrency();

  const [search, setSearch] = useState("");
  const isBalanced = Math.abs(total - target) < 0.01;
  const showSearch = participants.length > 6;

  const filtered = participants.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onDistribute}
          className="text-xs text-primary font-medium hover:underline"
        >
          Distribute evenly
        </button>
        <span
          className={cn(
            "text-xs font-medium",
            isBalanced ? "text-emerald-400" : "text-destructive",
          )}
        >
          {suffix === "$"
            ? `${symbol}${total.toFixed(2)}`
            : `${total.toFixed(1)}%`}{" "}
          / {targetLabel}
        </span>
      </div>

      {showSearch && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter members..."
            className="h-8 rounded-lg pl-8 text-xs"
          />
        </div>
      )}

      <div className="max-h-[280px] overflow-y-auto space-y-1.5 -mx-1 px-1">
        {filtered.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <UserAvatar name={member.name} size="sm" />
            <span className="flex-1 text-sm font-medium truncate">
              {member.userId === currentUser?.id ? "You" : member.name}
            </span>
            <div className="relative w-24">
              <Input
                type="text"
                inputMode="decimal"
                value={customSplits[member.id] ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
                    onUpdate(member.id, raw === "" ? 0 : parseFloat(raw) || 0);
                  }
                }}
                className="h-9 rounded-lg pr-6 text-right text-sm"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {suffix}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && search && (
          <p className="text-xs text-muted-foreground text-center py-3">
            No match
          </p>
        )}
      </div>
    </div>
  );
}
