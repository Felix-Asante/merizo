"use client";

import { BellIcon } from "lucide-react";
import { AppBrand } from "@/ui/shared/app-brand";
import { UserAvatar } from "@/ui/shared/avatar";
import { useCurrentUser } from "@/hooks/api/use-current-user";
import { LogoutButton } from "./logout-button";

export function TopNavbar() {
  const { currentUser } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-lg border-b border-border/50 lg:hidden">
      <AppBrand />
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
          <BellIcon className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-pulse" />
        </button>
        <LogoutButton
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          iconClassName="size-5"
        />
        <UserAvatar name={currentUser?.name ?? ""} size="sm" />
      </div>
    </header>
  );
}
