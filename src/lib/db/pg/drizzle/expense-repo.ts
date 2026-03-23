import type { DbClientOrTransaction } from "@/lib/db/pg";
import db from "@/lib/db/pg";
import {
  expense,
  expenseSplit,
  monthlyPeriods,
  settlements,
  settlementItems,
} from "./schemas/expense-schema";
import type { InferInsertModel } from "drizzle-orm";
import { and, desc, eq, sql } from "drizzle-orm";
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
    return this.db
      .select({
        id: monthlyPeriods.id,
        year: monthlyPeriods.year,
        month: monthlyPeriods.month,
        status: monthlyPeriods.status,
      })
      .from(monthlyPeriods)
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(monthlyPeriods.status, "open"),
        ),
      );
  }

  async getTotalPaidPerMember(periodId: string) {
    return this.db
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
  }

  async getTotalOwedPerMember(periodId: string) {
    return this.db
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
  }

  async getDebtsPerPairPerPeriod(groupId: string) {
    return this.db
      .select({
        fromMemberId: expenseSplit.memberId,
        toMemberId: expense.paidByUserId,
        periodId: expense.periodId,
        totalAmount: sql<string>`COALESCE(SUM(${expenseSplit.amount}), 0)`,
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
      .groupBy(expenseSplit.memberId, expense.paidByUserId, expense.periodId);
  }

  async getSettledAmountsPerPairPerPeriod(groupId: string) {
    return this.db
      .select({
        fromMemberId: settlementItems.fromMemberId,
        toMemberId: settlementItems.toMemberId,
        periodId: settlements.periodId,
        settledAmount:
          sql<string>`COALESCE(SUM(${settlementItems.amount}), 0)`,
      })
      .from(settlementItems)
      .innerJoin(settlements, eq(settlements.id, settlementItems.settlementId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, settlements.periodId))
      .where(
        and(
          eq(monthlyPeriods.organizationId, groupId),
          eq(monthlyPeriods.status, "open"),
        ),
      )
      .groupBy(
        settlementItems.fromMemberId,
        settlementItems.toMemberId,
        settlements.periodId,
      );
  }

  async getSettlementHistory(groupId: string) {
    return this.db
      .select({
        id: settlementItems.id,
        fromMemberId: settlementItems.fromMemberId,
        toMemberId: settlementItems.toMemberId,
        amount: settlementItems.amount,
        periodId: settlements.periodId,
        periodYear: monthlyPeriods.year,
        periodMonth: monthlyPeriods.month,
        createdAt: settlements.createdAt,
      })
      .from(settlementItems)
      .innerJoin(settlements, eq(settlements.id, settlementItems.settlementId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, settlements.periodId))
      .where(eq(monthlyPeriods.organizationId, groupId))
      .orderBy(desc(settlements.createdAt));
  }

  async createSettlement(
    periodId: string,
    items: Array<{
      fromMemberId: string;
      toMemberId: string;
      amount: string;
    }>,
  ) {
    const [settlement] = await this.db
      .insert(settlements)
      .values({
        id: crypto.randomUUID(),
        periodId,
        createdAt: new Date(),
      })
      .returning();

    if (items.length > 0) {
      await this.db.insert(settlementItems).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          settlementId: settlement.id,
          ...item,
        })),
      );
    }

    return settlement;
  }

  async getExpenseDetails(expenseId: string) {
    const [row] = await this.db
      .select({
        id: expense.id,
        title: expense.title,
        note: expense.note,
        amount: expense.amount,
        splitType: expense.splitType,
        organizationId: expense.organizationId,
        createdAt: expense.createdAt,
        expenseDate: expense.expenseDate,
        paidByMemberId: expense.paidByUserId,
        paidByName: user.name,
        periodId: expense.periodId,
        periodYear: monthlyPeriods.year,
        periodMonth: monthlyPeriods.month,
        periodStatus: monthlyPeriods.status,
      })
      .from(expense)
      .innerJoin(member, eq(member.id, expense.paidByUserId))
      .innerJoin(user, eq(user.id, member.userId))
      .innerJoin(monthlyPeriods, eq(monthlyPeriods.id, expense.periodId))
      .where(eq(expense.id, expenseId));

    return row ?? null;
  }

  async getExpenseSplits(expenseId: string) {
    return this.db
      .select({
        memberId: expenseSplit.memberId,
        memberName: user.name,
        amount: expenseSplit.amount,
      })
      .from(expenseSplit)
      .innerJoin(member, eq(member.id, expenseSplit.memberId))
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(expenseSplit.expenseId, expenseId));
  }

  async deleteExpense(expenseId: string) {
    await this.db.delete(expense).where(eq(expense.id, expenseId));
  }
}

export const expenseRepo = new ExpenseRepo(db);
