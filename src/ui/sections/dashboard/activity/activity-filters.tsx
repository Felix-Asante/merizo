"use client";

import { motion } from "framer-motion";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/ui/base/input";
import { cn } from "@/ui/utils";

interface MemberOption {
  id: string;
  name: string;
}

interface PeriodOption {
  id: string;
  label: string;
  status: string;
}

interface ActivityFiltersProps {
  members: MemberOption[];
  periods: PeriodOption[];
  selectedMemberId: string | undefined;
  selectedPeriodId: string | undefined;
  search: string;
  onMemberChange: (memberId: string | undefined) => void;
  onPeriodChange: (periodId: string | undefined) => void;
  onSearchChange: (search: string) => void;
}

export function ActivityFilters({
  members,
  periods,
  selectedMemberId,
  selectedPeriodId,
  search,
  onMemberChange,
  onPeriodChange,
  onSearchChange,
}: ActivityFiltersProps) {
  const hasFilters = selectedMemberId || selectedPeriodId || search;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search expenses..."
          className="h-11 rounded-xl pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-accent transition-colors"
          >
            <XIcon className="size-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Paid by
        </label>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            isActive={!selectedMemberId}
            onClick={() => onMemberChange(undefined)}
          />
          {members.map((m) => (
            <FilterChip
              key={m.id}
              label={m.name.split(" ")[0]}
              isActive={selectedMemberId === m.id}
              onClick={() =>
                onMemberChange(selectedMemberId === m.id ? undefined : m.id)
              }
            />
          ))}
        </div>
      </div>

      {periods.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Period
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All"
              isActive={!selectedPeriodId}
              onClick={() => onPeriodChange(undefined)}
            />
            {periods.map((p) => (
              <FilterChip
                key={p.id}
                label={p.label}
                isActive={selectedPeriodId === p.id}
                onClick={() =>
                  onPeriodChange(selectedPeriodId === p.id ? undefined : p.id)
                }
                badge={p.status === "finalized" ? "Settled" : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={() => {
            onMemberChange(undefined);
            onPeriodChange(undefined);
            onSearchChange("");
          }}
          className="text-xs text-primary font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </motion.div>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
  badge,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted/50 text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
      {badge && (
        <span className="text-[9px] px-1 py-0.5 rounded bg-background/20">
          {badge}
        </span>
      )}
    </motion.button>
  );
}
