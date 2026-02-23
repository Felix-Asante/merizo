import type { DbClientOrTransaction } from "@/lib/db/pg";
import { eq, and, sql } from "drizzle-orm";
import { member, group, user, monthlyPeriods } from "./schemas";
import db from "@/lib/db/pg";

export class GroupRepo {
  constructor(private readonly db: DbClientOrTransaction) {}

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

  async getOrCreateMonthlyPeriod(groupId: string, year: number, month: number) {
    const monthlyPeriod = await this.db
      .select()
      .from(monthlyPeriods)
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(monthlyPeriods.year, year),
          eq(monthlyPeriods.month, month),
        ),
      );

    if (monthlyPeriod.length === 0) {
      const newMonthlyPeriod = await this.db
        .insert(monthlyPeriods)
        .values({
          id: crypto.randomUUID(),
          organizationId: groupId,
          year: year,
          month: month,
          status: "open",
        })
        .returning();
      return newMonthlyPeriod[0];
    }
    return monthlyPeriod[0];
  }

  async getById(groupId: string) {
    const groupData = await this.db
      .select()
      .from(group)
      .where(eq(group.id, groupId));
    return groupData[0];
  }

  async isMember(groupId: string, userId: string) {
    const memberData = await this.db
      .select()
      .from(member)
      .where(and(eq(member.organizationId, groupId), eq(member.id, userId)));
    return memberData.length > 0;
  }
}

export const groupRepo = new GroupRepo(db);
