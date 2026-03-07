"use client";

import { useCurrentUser } from "@/hooks/api/use-current-user";
import { AppBrand } from "@/ui/shared/app-brand";
import { UserAvatar } from "@/ui/shared/avatar";
import { LogoutButton } from "./logout-button";

export function TopNavbar() {
  const { currentUser } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-lg border-b border-border/50 lg:hidden">
      <AppBrand />
      <div className="flex items-center gap-1">
        <LogoutButton
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          iconClassName="size-5"
        />
        <UserAvatar name={currentUser?.name ?? ""} size="sm" />
      </div>
    </header>
  );
}
