import type { DbClientOrTransaction } from "@/lib/db/pg";
import db from "@/lib/db/pg";
import { expense, expenseSplit } from "./schemas/expense-schema";
import type { InferInsertModel } from "drizzle-orm";

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
}

export const expenseRepo = new ExpenseRepo(db);
