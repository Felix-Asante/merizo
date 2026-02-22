"use client";

import { authClient } from "@/lib/auth/client";

export function getActiveGroup() {
  const { data, isPending, error } = authClient.useActiveOrganization();
  return { data, isPending, error };
}

export async function setActiveGroupClient(groupId: string) {
  const response = await authClient.organization.setActive({
    organizationId: groupId,
  });
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
}
