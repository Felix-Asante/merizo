import type { DbClient } from "@/lib/db/pg";
import { eq, and, sql } from "drizzle-orm";
import { member, group, user } from "./schemas";
import db from "@/lib/db/pg";

export class GroupRepo {
  constructor(private readonly db: DbClient) {}

  async getUserGroups(userId: string) {
    const groups = await this.db
      .select({
        id: group.id,
        name: group.name,
        slug: group.slug,
        logo: group.logo,
        inviteCode: group.inviteCode,
        memberCount:
          sql<number>`(SELECT COUNT(*)::int FROM ${member} WHERE ${member.organizationId} = ${group.id})`.as(
            "member_count",
          ),
      })
      .from(group)
      .innerJoin(member, eq(group.id, member.organizationId))
      .where(eq(member.userId, userId))
      .groupBy(group.id, group.name, group.slug, group.logo, group.inviteCode);

    return groups;
  }

  async getGroupByInviteCode(inviteCode: string) {
    const groupData = await this.db
      .select()
      .from(group)
      .where(eq(group.inviteCode, inviteCode));
    return groupData[0];
  }

  async getActiveMember(groupId: string, userId: string) {
    const memberData = await this.db
      .select()
      .from(member)
      .where(
        and(eq(member.organizationId, groupId), eq(member.userId, userId)),
      );
    return memberData[0];
  }

  async getGroupMembers(groupId: string) {
    const members = await this.db
      .select({
        id: member.id,
        userId: member.userId,
        name: user.name,
        email: user.email,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, groupId));
    return members;
  }
}

export const groupRepo = new GroupRepo(db);
