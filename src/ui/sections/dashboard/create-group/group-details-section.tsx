"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { SearchIcon, ChevronDownIcon, CheckIcon } from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/ui/utils";
import { Input } from "@/ui/base/input";
import { FormField, FormItem, FormLabel, FormMessage } from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import type { CreateGroupFormValues } from "@/validation/group-validation";
import { GROUP_TYPES, CURRENCIES } from "./dummy-data";

export function GroupDetailsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="rounded-2xl bg-card border border-border/50 p-4 space-y-4"
    >
      <FormInput
        name="name"
        label="Group Name"
        placeholder="e.g. Apartment 4B, Trip to Barcelona"
      />
      <GroupTypeSelector />
      <CurrencySelector />
    </motion.section>
  );
}

function GroupTypeSelector() {
  const { watch, setValue } = useFormContext<CreateGroupFormValues>();
  const selectedType = watch("type");

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Group Type{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GROUP_TYPES.map((type) => (
          <motion.button
            key={type.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setValue(
                "type",
                selectedType === type.value ? undefined : type.value,
              )
            }
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border",
              selectedType === type.value
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border/50 text-muted-foreground hover:bg-accent",
            )}
          >
            <span>{type.emoji}</span>
            <span>{type.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CurrencySelector() {
  const { control } = useFormContext<CreateGroupFormValues>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const filtered = useMemo(
    () =>
      CURRENCIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <FormField
      control={control}
      name="currency"
      render={({ field }) => {
        const selected = CURRENCIES.find((c) => c.code === field.value);

        const trigger = (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors"
          >
            <span className="text-sm font-medium">
              {selected
                ? `${selected.symbol} ${selected.code} — ${selected.name}`
                : "Select currency"}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </motion.button>
        );

        const currencyList = (
          <div className="py-2">
            <div className="px-3 pb-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currencies..."
                  className="h-9 rounded-lg pl-8 text-sm"
                />
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {filtered.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    field.onChange(currency.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left",
                    field.value === currency.code && "bg-primary/5",
                  )}
                >
                  <span className="text-base font-medium w-8">
                    {currency.symbol}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{currency.code}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {currency.name}
                    </span>
                  </div>
                  {field.value === currency.code && (
                    <CheckIcon className="size-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No currencies found
                </p>
              )}
            </div>
          </div>
        );

        if (isDesktop) {
          return (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>{trigger}</Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="z-50 w-[320px] rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    sideOffset={8}
                    align="start"
                  >
                    {currencyList}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              <FormMessage />
            </FormItem>
          );
        }

        return (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <div onClick={() => setOpen(true)}>{trigger}</div>
            <BottomSheet
              open={open}
              onClose={() => {
                setOpen(false);
                setSearch("");
              }}
              title="Select Currency"
            >
              {currencyList}
            </BottomSheet>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
