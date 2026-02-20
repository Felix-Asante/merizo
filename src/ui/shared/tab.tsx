"use client";

import { motion } from "framer-motion";
import { cn } from "@/ui/utils";

interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
}

export function Tab<T extends string>({
  options,
  value,
  onChange,
  layoutId = "tabIndicator",
  className,
}: TabProps<T>) {
  return (
    <div className={cn("relative flex bg-muted/50 rounded-xl p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative flex-1 py-2 text-sm font-medium rounded-lg transition-colors z-10",
            value === option.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
