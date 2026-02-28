"use server";

import { auth } from "@/lib/auth";
import { withAuthenticatedUser } from "@/lib/auth/server";
import { Logger } from "@/lib/logger";
import { groupRepo } from "@/lib/db/pg/drizzle/group-repo";
import type { CreateGroupBody } from "@/types/groups";
import { getGroupMembersTag, getUserGroupsTag } from "@/utils/cache";
import { cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const logger = new Logger("GroupServiceServer");

async function getCachedUserGroups(userId: string) {
  "use cache";
  cacheTag(getUserGroupsTag(userId));
  return groupRepo.getUserGroups(userId);
}

export async function getUserGroups() {
  try {
    const groups = await withAuthenticatedUser((user) =>
      getCachedUserGroups(user.id),
    );
    return { error: null, data: groups };
  } catch (error) {
    logger.error("Failed to get user groups", error as Error);
    return { error: error, data: [] };
  }
}

export async function createGroup(body: CreateGroupBody) {
  try {
    const result = await withAuthenticatedUser(async (user) => {
      const response = await auth.api.createOrganization({
        body: {
          ...body,
          keepCurrentActiveOrganization: false,
        },
        headers: await headers(),
      });

      if (!response?.id) throw new Error("Failed to create group");

      await auth.api.setActiveOrganization({
        body: { organizationId: response.id },
        headers: await headers(),
      });

      revalidateTag(getUserGroupsTag(user.id), "max");
      revalidateTag(getGroupMembersTag(response.id), "max");
      revalidatePath("/");
      return { id: response.id, slug: response.slug };
    });
    return { error: null, success: true, data: result };
  } catch (error) {
    logger.error("Failed to create group", error as Error);
    return { error: error, success: false, data: null };
  }
}

export async function setActiveGroup(groupId: string) {
  try {
    await withAuthenticatedUser(async () => {
      await auth.api.setActiveOrganization({
        body: { organizationId: groupId },
        headers: await headers(),
      });
    });
    return { error: null, success: true };
  } catch (error) {
    logger.error("Failed to set active group", error as Error);
    return { error: error, success: false };
  }
}

export async function joinGroupWithCode(inviteCode: string) {
  try {
    const normalizedCode = inviteCode.trim().toUpperCase();
    const results = await withAuthenticatedUser(async (user) => {
      const group = await groupRepo.getGroupByInviteCode(normalizedCode);

      if (!group) throw new Error("Group not found");

      const activeMember = await groupRepo.getActiveMember(group.id, user.id);
      if (activeMember)
        throw new Error("You are already a member of this group");

      const response = await auth.api.addMember({
        body: {
          organizationId: group.id,
          userId: user.id,
          role: "member",
        },
        headers: await headers(),
      });

      await setActiveGroup(group.id);

      revalidateTag(getUserGroupsTag(user.id), "max");
      revalidateTag(getGroupMembersTag(group.id), "max");
      revalidatePath("/");

      return {
        error: null,
        memberId: response?.id,
        groupId: group.id,
      };
    });
    return { error: null, success: true, data: results };
  } catch (error) {
    logger.error("Failed to join group with code", error as Error);
    return { error: error, success: false };
  }
}

export async function getGroupMembers(groupId: string) {
  try {
    const members = await withAuthenticatedUser(async () => {
      return await groupRepo.getGroupMembers(groupId);
    });
    return { error: null, data: members };
  } catch (error) {
    logger.error("Failed to get group members", error as Error);
    return { error: error, data: [] };
  }
}

export async function getGroupActivity(groupId: string) {
  try {
    const activity = await withAuthenticatedUser(async (user) => {
      const activeMember = await groupRepo.getActiveMember(groupId, user.id);
      if (!activeMember) throw new Error("You are not a member of this group");
      return await groupRepo.getRecentActivity(groupId);
    });
    return { error: null, data: activity };
  } catch (error) {
    logger.error("Failed to get group activity", error as Error);
    return { error: error, data: [] };
  }
}
