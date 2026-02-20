"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function GroupNavbar() {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors"
      >
        <ArrowLeftIcon className="size-5" />
      </button>
      <h1 className="text-lg font-semibold">Create Group</h1>
    </nav>
  );
}
