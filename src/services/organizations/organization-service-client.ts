"use client";

import { authClient } from "@/lib/auth/client";

export function getActiveOrganization() {
  const { data, isPending, error } = authClient.useActiveOrganization();
  return { data, isPending, error };
}
