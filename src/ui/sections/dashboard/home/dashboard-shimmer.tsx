"use client";

import { motion } from "framer-motion";
import { cn } from "@/ui/utils";

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card animate-pulse relative overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-muted-foreground/5 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export function DashboardShimmer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      <ShimmerBlock className="h-[180px]" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-[76px] min-w-[80px] flex-1" />
        ))}
      </div>
      <div className="space-y-3">
        <ShimmerBlock className="h-5 w-32" />
        <ShimmerBlock className="h-[240px]" />
      </div>
    </motion.div>
  );
}
