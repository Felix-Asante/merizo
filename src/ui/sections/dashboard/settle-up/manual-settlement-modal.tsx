"use client";

import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Dialog } from "radix-ui";
import {
  XIcon,
  CheckCircle2Icon,
  Loader2Icon,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/ui/utils";
import { Button } from "@/ui/base/button";
import { Input } from "@/ui/base/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import { UserAvatar } from "@/ui/shared/avatar";
import { BottomSheet } from "@/ui/shared/bottom-sheet";
import { useMediaQuery } from "@/ui/hooks/use-media-query";
import { formatPeriodLabel } from "@/lib/settlement-engine";
import { useActiveCurrency } from "@/hooks/use-active-currency";
import {
  manualSettlementSchema,
  type ManualSettlementFormValues,
} from "@/validation/settlement-validation";
import type { SettleMember, SettlementPeriod } from "@/types/settlement";

interface ManualSettlementModalProps {
  open: boolean;
  onClose: () => void;
  members: SettleMember[];
  periods: SettlementPeriod[];
  onSubmit: (data: ManualSettlementFormValues) => Promise<void>;
}

export function ManualSettlementModal({
  open,
  onClose,
  members,
  periods,
  onSubmit,
}: ManualSettlementModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ManualSettlementFormValues>({
    resolver: zodResolver(manualSettlementSchema),
    mode: "onChange",
    defaultValues: {
      periodId: periods[0]?.id ?? "",
      fromId: "",
      toId: "",
      amount: 0,
      note: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    form.reset();
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (data: ManualSettlementFormValues) => {
    try {
      await onSubmit(data);
      setIsSuccess(true);
      setTimeout(handleClose, 1200);
    } catch {
      // handled by parent
    }
  };

  const content = isSuccess ? (
    <div className="px-4 pb-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center py-8 gap-3"
      >
        <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2Icon className="size-8 text-emerald-400" />
        </div>
        <p className="text-base font-semibold">Settlement recorded!</p>
      </motion.div>
    </div>
  ) : (
    <div className="px-4 pb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <PeriodField periods={periods} />
          <MemberSelector
            name="fromId"
            label="From (payer)"
            members={members}
          />
          <MemberSelector
            name="toId"
            label="To (recipient)"
            members={members}
          />
          <AmountField />
          <div className="grid grid-cols-2 gap-3">
            <FormInput name="date" label="Date" type="date" />
            <FormInput name="note" label="Note" placeholder="Optional" />
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Recording...
              </>
            ) : (
              "Record Settlement"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between p-4 pb-2">
              <Dialog.Title className="text-base font-semibold">
                Record Settlement
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XIcon className="size-4 text-muted-foreground" />
              </Dialog.Close>
            </div>
            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Record Settlement">
      {content}
    </BottomSheet>
  );
}

function PeriodField({ periods }: { periods: SettlementPeriod[] }) {
  const { control } = useFormContext<ManualSettlementFormValues>();

  return (
    <FormField
      control={control}
      name="periodId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Period</FormLabel>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {periods.map((period) => (
              <motion.button
                key={period.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => field.onChange(period.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap border transition-colors",
                  field.value === period.id
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-card border-border/50 text-muted-foreground hover:bg-accent",
                )}
              >
                <CalendarIcon className="size-3" />
                <span>{formatPeriodLabel(period.year, period.month)}</span>
              </motion.button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function MemberSelector({
  name,
  label,
  members,
}: {
  name: "fromId" | "toId";
  label: string;
  members: SettleMember[];
}) {
  const { control } = useFormContext<ManualSettlementFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {members.map((member) => (
              <motion.button
                key={member.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => field.onChange(member.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap border transition-colors",
                  field.value === member.id
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-card border-border/50 text-muted-foreground hover:bg-accent",
                )}
              >
                <UserAvatar
                  name={member.name}
                  size="sm"
                  className="size-6 text-[10px]"
                />
                <span>{member.isCurrentUser ? "You" : member.name}</span>
              </motion.button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function AmountField() {
  const { control } = useFormContext<ManualSettlementFormValues>();
  const [display, setDisplay] = useState("");
  const { symbol } = useActiveCurrency();

  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              {symbol}
            </span>
            <Input
              type="text"
              inputMode="decimal"
              value={display}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
                  setDisplay(raw);
                  field.onChange(raw === "" ? 0 : parseFloat(raw) || 0);
                }
              }}
              onBlur={() => {
                field.onBlur();
                if (field.value > 0) setDisplay(field.value.toFixed(2));
              }}
              placeholder="0.00"
              className="h-11 rounded-xl pl-7"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
