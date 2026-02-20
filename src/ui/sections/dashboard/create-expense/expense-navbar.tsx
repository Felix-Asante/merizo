"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function ExpenseNavbar() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 mb-6"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center justify-center size-9 rounded-xl hover:bg-accent transition-colors"
      >
        <ArrowLeftIcon className="size-5" />
      </button>
      <h1 className="text-xl font-bold">Add Expense</h1>
    </motion.div>
  );
}
