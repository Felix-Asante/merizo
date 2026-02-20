"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/ui/base/skeleton";

export function DashboardShimmer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      <Skeleton className="h-[180px] rounded-2xl" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] min-w-[80px] flex-1 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32 rounded-xl" />
        <Skeleton className="h-[240px] rounded-2xl" />
      </div>
    </motion.div>
  );
}
