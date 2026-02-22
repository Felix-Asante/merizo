"use client";

import { authClient } from "@/lib/auth/client";

export function getActiveOrganization() {
  const { data, isPending, error } = authClient.useActiveOrganization();
  return { data, isPending, error };
}

export async function setActiveOrganizationClient(organizationId: string) {
  const response = await authClient.organization.setActive({
    organizationId: organizationId,
  });
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
}
