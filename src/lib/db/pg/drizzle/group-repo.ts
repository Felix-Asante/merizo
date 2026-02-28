import type { DbClientOrTransaction } from "@/lib/db/pg";
import { eq, and, sql, desc, ilike } from "drizzle-orm";
import {
  member,
  group,
  user,
  monthlyPeriods,
  expense,
  expenseSplit,
  settlements,
  settlementItems,
} from "./schemas";
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

  async getRecentActivity(groupId: string, limit = 10) {
    const recentExpenses = await this.db
      .select({
        id: expense.id,
        type: sql<"expense">`'expense'`.as("activity_type"),
        title: expense.title,
        amount: expense.amount,
        paidByMemberId: expense.paidByUserId,
        paidByName: user.name,
        createdAt: expense.createdAt,
        periodStatus: monthlyPeriods.status,
      })
      .from(expense)
      .innerJoin(member, eq(member.id, expense.paidByUserId))
      .innerJoin(user, eq(user.id, member.userId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(eq(expense.organizationId, groupId))
      .orderBy(desc(expense.createdAt))
      .limit(limit);

    return recentExpenses;
  }

  async getFilteredActivity(
    groupId: string,
    filters: {
      memberId?: string;
      periodId?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const { memberId, periodId, search, page = 1, pageSize = 20 } = filters;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(expense.organizationId, groupId)];
    if (memberId) conditions.push(eq(expense.paidByUserId, memberId));
    if (periodId) conditions.push(eq(expense.periodId, periodId));
    if (search) conditions.push(ilike(expense.title, `%${search}%`));

    const rows = await this.db
      .select({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        paidByMemberId: expense.paidByUserId,
        paidByName: user.name,
        createdAt: expense.createdAt,
        periodId: expense.periodId,
        periodYear: monthlyPeriods.year,
        periodMonth: monthlyPeriods.month,
        periodStatus: monthlyPeriods.status,
      })
      .from(expense)
      .innerJoin(member, eq(member.id, expense.paidByUserId))
      .innerJoin(user, eq(user.id, member.userId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(and(...conditions))
      .orderBy(desc(expense.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(expense)
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(and(...conditions));

    return { rows, total: count };
  }

  async getGroupPeriods(groupId: string) {
    return this.db
      .select({
        id: monthlyPeriods.id,
        year: monthlyPeriods.year,
        month: monthlyPeriods.month,
        status: monthlyPeriods.status,
      })
      .from(monthlyPeriods)
      .where(eq(monthlyPeriods.organizationId, groupId))
      .orderBy(desc(monthlyPeriods.year), desc(monthlyPeriods.month));
  }

  async getUserSplitsForExpenses(
    expenseIds: string[],
    currentMemberId: string,
  ) {
    if (expenseIds.length === 0) return [];
    return this.db
      .select({
        expenseId: expenseSplit.expenseId,
        splitAmount: expenseSplit.amount,
      })
      .from(expenseSplit)
      .where(
        and(
          eq(expenseSplit.memberId, currentMemberId),
          sql`${expenseSplit.expenseId} IN (${sql.join(
            expenseIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        ),
      );
  }

  async getUserBalance(groupId: string, currentMemberId: string) {
    const [owedToUser] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${expenseSplit.amount}), 0)`,
      })
      .from(expenseSplit)
      .innerJoin(expense, eq(expense.id, expenseSplit.expenseId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(
        and(
          eq(expense.organizationId, groupId),
          eq(expense.paidByUserId, currentMemberId),
          sql`${expenseSplit.memberId} != ${currentMemberId}`,
          eq(monthlyPeriods.status, "open"),
        ),
      );

    const [userOwes] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${expenseSplit.amount}), 0)`,
      })
      .from(expenseSplit)
      .innerJoin(expense, eq(expense.id, expenseSplit.expenseId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(
        and(
          eq(expense.organizationId, groupId),
          eq(expenseSplit.memberId, currentMemberId),
          sql`${expense.paidByUserId} != ${currentMemberId}`,
          eq(monthlyPeriods.status, "open"),
        ),
      );

    const [settledByUser] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${settlementItems.amount}), 0)`,
      })
      .from(settlementItems)
      .innerJoin(settlements, eq(settlements.id, settlementItems.settlementId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, settlements.periodId))
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(settlementItems.fromMemberId, currentMemberId),
          eq(monthlyPeriods.status, "open"),
        ),
      );

    const [settledToUser] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${settlementItems.amount}), 0)`,
      })
      .from(settlementItems)
      .innerJoin(settlements, eq(settlements.id, settlementItems.settlementId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, settlements.periodId))
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(settlementItems.toMemberId, currentMemberId),
          eq(monthlyPeriods.status, "open"),
        ),
      );

    const youAreOwed = Number(owedToUser.total) - Number(settledToUser.total);
    const youOwe = Number(userOwes.total) - Number(settledByUser.total);

    return {
      youAreOwed: Math.max(0, youAreOwed),
      youOwe: Math.max(0, youOwe),
    };
  }
}

export const groupRepo = new GroupRepo(db);
