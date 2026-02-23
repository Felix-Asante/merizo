import type { DbClientOrTransaction } from "@/lib/db/pg";
import { member } from "./schemas/group-schema";
import { eq } from "drizzle-orm";
import db from "@/lib/db/pg";

export class UsersRepo {
  constructor(private readonly db: DbClientOrTransaction) {}

  async getMemberByUserId(userId: string) {
    const memberData = await this.db
      .select({ id: member.id })
      .from(member)
      .where(eq(member.userId, userId));
    return memberData[0];
  }
}

export const usersRepo = new UsersRepo(db);
