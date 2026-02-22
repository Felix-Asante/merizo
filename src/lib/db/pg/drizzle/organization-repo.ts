import type { DbClient } from "@/lib/db/pg";
import { eq, and, sql } from "drizzle-orm";
import { member, organization } from "./schemas";
import db from "@/lib/db/pg";

export class OrganizationRepo {
  constructor(private readonly db: DbClient) {}

  async getUserOrganizations(userId: string) {
    const organizations = await this.db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        inviteCode: organization.inviteCode,
        memberCount:
          sql<number>`(SELECT COUNT(*)::int FROM ${member} WHERE ${member.organizationId} = ${organization.id})`.as(
            "member_count",
          ),
      })
      .from(organization)
      .innerJoin(member, eq(organization.id, member.organizationId))
      .where(eq(member.userId, userId))
      .groupBy(
        organization.id,
        organization.name,
        organization.slug,
        organization.logo,
        organization.inviteCode,
      );

    return organizations;
  }

  async getOrganizationByInviteCode(inviteCode: string) {
    const organizationData = await this.db
      .select()
      .from(organization)
      .where(eq(organization.inviteCode, inviteCode));
    return organizationData[0];
  }

  async getActiveMember(organizationId: string, userId: string) {
    const memberData = await this.db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
        ),
      );
    return memberData[0];
  }
}

export const organizationRepo = new OrganizationRepo(db);
