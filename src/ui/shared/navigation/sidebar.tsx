"use client";

import { useCurrentUser } from "@/hooks/api/use-current-user";
import { buttonVariants } from "@/ui/base/button";
import { Separator } from "@/ui/base/separator";
import { AppBrand } from "@/ui/shared/app-brand";
import { UserAvatar } from "@/ui/shared/avatar";
import { cn } from "@/ui/utils";
import { ActivityIcon, HandCoinsIcon, HomeIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/activity", icon: ActivityIcon, label: "Activity" },
  { href: "/settle", icon: HandCoinsIcon, label: "Settle Up" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border/50 bg-card p-4">
      <div className="px-2 mb-8">
        <AppBrand />
      </div>

      <Link
        href="/expenses"
        className={buttonVariants({ className: "w-full mb-6 h-11" })}
      >
        <PlusIcon className="size-4" />
        Add Expense
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      <div className="flex items-center gap-2 px-2">
        <UserAvatar name={currentUser?.name ?? ""} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {currentUser?.name ?? ""}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentUser?.email ?? ""}
          </p>
        </div>
        <LogoutButton
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          iconClassName="size-4"
        />
      </div>
    </aside>
  );
}
