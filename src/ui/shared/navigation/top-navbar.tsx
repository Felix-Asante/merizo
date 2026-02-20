"use client";

import { BellIcon } from "lucide-react";
import { AppBrand } from "@/ui/shared/app-brand";
import { UserAvatar } from "@/ui/shared/avatar";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-lg border-b border-border/50 lg:hidden">
      <AppBrand />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
          <BellIcon className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-pulse" />
        </button>
        <UserAvatar name="Felix User" size="sm" />
      </div>
    </header>
  );
}
