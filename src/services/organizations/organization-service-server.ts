"use server";

import { auth } from "@/lib/auth";
import { withAuthenticatedUser } from "@/lib/auth/server";
import { organizationRepo } from "@/lib/db/pg/drizzle/organization-repo";
import { Logger } from "@/lib/logger";
import type { CreateOrganizationBody } from "@/types/organization";
import { getUserOrganizationsTag } from "@/utils/cache";
import { cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

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

export async function createOrganization(body: CreateOrganizationBody) {
  try {
    const result = await withAuthenticatedUser(async (user) => {
      const response = await auth.api.createOrganization({
        body: {
          ...body,
          keepCurrentActiveOrganization: false,
        },
        headers: await headers(),
      });

      if (!response?.id) throw new Error("Failed to create organization");

      await auth.api.setActiveOrganization({
        body: { organizationId: response.id },
        headers: await headers(),
      });

      revalidateTag(getUserOrganizationsTag(user.id), "max");
      revalidatePath("/");
      return { id: response.id, slug: response.slug };
    });
    return { error: null, success: true, data: result };
  } catch (error) {
    logger.error("Failed to create organization", error as Error);
    return { error: error, success: false, data: null };
  }
}

export async function setActiveOrganization(organizationId: string) {
  try {
    await withAuthenticatedUser(async () => {
      await auth.api.setActiveOrganization({
        body: { organizationId },
        headers: await headers(),
      });
    });
    return { error: null, success: true };
  } catch (error) {
    logger.error("Failed to set active organization", error as Error);
    return { error: error, success: false };
  }
}

export async function joinOrganizationWithCode(inviteCode: string) {
  try {
    const normalizedCode = inviteCode.trim().toUpperCase();
    const results = await withAuthenticatedUser(async (user) => {
      const organization =
        await organizationRepo.getOrganizationByInviteCode(normalizedCode);

      if (!organization) throw new Error("Organization not found");

      const activeMember = await organizationRepo.getActiveMember(
        organization.id,
        user.id,
      );
      if (activeMember)
        throw new Error("You are already a member of this organization");

      const response = await auth.api.addMember({
        body: {
          organizationId: organization.id,
          userId: user.id,
          role: "member",
        },
        headers: await headers(),
      });

      await setActiveOrganization(organization.id);

      revalidateTag(getUserOrganizationsTag(user.id), "max");
      revalidatePath("/");

      return {
        error: null,
        memberId: response?.id,
        organizationId: organization.id,
      };
    });
    return { error: null, success: true, data: results };
  } catch (error) {
    logger.error("Failed to join organization with code", error as Error);
    return { error: error, success: false };
  }
}
