"use client";

import {
  HomeIcon,
  UsersIcon,
  ActivityIcon,
  UserIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/ui/utils";

const tabs = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/groups", icon: UsersIcon, label: "Groups" },
  { href: "/activity", icon: ActivityIcon, label: "Activity" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {tabs.slice(0, 2).map((tab) => (
          <NavTab
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            isActive={pathname === tab.href}
          />
        ))}

        <Link href="/expenses" className="relative -mt-5">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          >
            <PlusIcon className="size-6" />
          </motion.div>
        </Link>

        {tabs.slice(2).map((tab) => (
          <NavTab
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            isActive={pathname === tab.href}
          />
        ))}
      </div>
    </nav>
  );
}

function NavTab({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-1 px-4 py-2"
    >
      <Icon
        className={cn(
          "size-5 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "text-[10px] transition-colors",
          isActive ? "text-primary font-medium" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="bottomNavIndicator"
          className="absolute -bottom-1 h-0.5 w-6 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}
