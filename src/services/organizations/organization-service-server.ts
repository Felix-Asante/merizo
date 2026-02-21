"use server";

import { withAuthenticatedUser } from "@/lib/auth/server";
import { organizationRepo } from "@/lib/db/pg/drizzle/organization-repo";
import { Logger } from "@/lib/logger";
import { getUserOrganizationsTag } from "@/utils/cache";
import { cacheTag } from "next/cache";

const logger = new Logger("OrganizationServiceServer");

async function getCachedUserOrganizations(userId: string) {
  "use cache";
  cacheTag(getUserOrganizationsTag(userId));
  return organizationRepo.getUserOrganizations(userId);
}

export async function getUserOrganizations() {
  try {
    const organizations = await withAuthenticatedUser((user) =>
      getCachedUserOrganizations(user.id),
    );
    return { error: null, data: organizations };
  } catch (error) {
    logger.error("Failed to get user organizations", error as Error);
    return { error: error, data: [] };
  }
}
