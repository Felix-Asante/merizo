"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/ui/base/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";

interface LogoutButtonProps {
  className?: string;
  iconClassName?: string;
}

export function LogoutButton({ className, iconClassName }: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await authClient.signOut();
    setOpen(false);
    router.push("/login");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        title="Log out"
        aria-label="Log out"
      >
        <LogOut className={iconClassName ?? "size-4"} />
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border border-border/50 shadow-xl p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Dialog.Title className="text-base font-semibold mb-1">
              Log out?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-4">
              You will need to sign in again to access your account.
            </Dialog.Description>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                className="rounded-xl"
              >
                Log out
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
