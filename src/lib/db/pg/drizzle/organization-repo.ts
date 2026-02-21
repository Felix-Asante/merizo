import type { DbClient } from "@/lib/db/pg";
import { count, eq } from "drizzle-orm";
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
        memberCount: count(member.id),
      })
      .from(organization)
      .innerJoin(member, eq(organization.id, member.organizationId))
      .where(eq(member.userId, userId))
      .groupBy(organization.id);

    return organizations;
  }
}

export const organizationRepo = new OrganizationRepo(db);
