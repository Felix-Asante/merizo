import type { DbClientOrTransaction } from "@/lib/db/pg";
import db from "@/lib/db/pg";
import {
  expense,
  expenseSplit,
  monthlyPeriods,
} from "./schemas/expense-schema";
import type { InferInsertModel } from "drizzle-orm";
import { and, eq, sql } from "drizzle-orm";
import { member } from "./schemas/group-schema";
import { user } from "./schemas/auth-schema";

type ExpenseInsertSchema = InferInsertModel<typeof expense>;
type ExpenseSplitInsertSchema = InferInsertModel<typeof expenseSplit>;

export class ExpenseRepo {
  constructor(private readonly db: DbClientOrTransaction) {}

  async create(createExpenseBody: ExpenseInsertSchema) {
    const [newExpense] = await this.db
      .insert(expense)
      .values(createExpenseBody)
      .returning();
    return newExpense;
  }

  async createExpenseSplits(
    createExpenseSplitsBody: ExpenseSplitInsertSchema[],
  ) {
    const newExpenseSplits = await this.db
      .insert(expenseSplit)
      .values(createExpenseSplitsBody)
      .returning();
    return newExpenseSplits;
  }

  async getUnsettledPeriods(groupId: string) {
    const unsettledPeriods = await this.db
      .select({
        id: monthlyPeriods.id,
        year: monthlyPeriods.year,
        month: monthlyPeriods.month,
      })
      .from(monthlyPeriods)
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(monthlyPeriods.status, "open"),
        ),
      );
    return unsettledPeriods;
  }

  async getTotalPaidPerMember(periodId: string) {
    const totalPaidPerMember = await this.db
      .select({
        memberId: expense.paidByUserId,
        memberName: user.name,
        totalPaid: sql<string>`COALESCE(SUM(${expense.amount}), 0)`,
      })
      .from(expense)
      .innerJoin(member, eq(member.id, expense.paidByUserId))
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(expense.periodId, periodId))
      .groupBy(expense.paidByUserId, user.name);
    return totalPaidPerMember;
  }

  async getTotalOwedPerMember(periodId: string) {
    const totalOwedPerMember = await this.db
      .select({
        memberId: expenseSplit.memberId,
        memberName: user.name,
        totalOwed: sql<string>`COALESCE(SUM(${expenseSplit.amount}), 0)`,
      })
      .from(expenseSplit)
      .innerJoin(expense, eq(expense.id, expenseSplit.expenseId))
      .innerJoin(member, eq(member.id, expenseSplit.memberId))
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(expense.periodId, periodId))
      .groupBy(expenseSplit.memberId, user.name);
    return totalOwedPerMember;
  }

  async getUnsettledDebtsForGroup(groupId: string) {
    return this.db
      .select({
        fromMemberId: expenseSplit.memberId,
        toMemberId: expense.paidByUserId,
        amount: sql<string>`COALESCE(SUM(${expenseSplit.amount}), 0)`,
      })
      .from(expenseSplit)
      .innerJoin(expense, eq(expense.id, expenseSplit.expenseId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(monthlyPeriods.status, "open"),
          sql`${expenseSplit.memberId} != ${expense.paidByUserId}`,
        ),
      )
      .groupBy(expenseSplit.memberId, expense.paidByUserId);
  }
}

export const expenseRepo = new ExpenseRepo(db);
