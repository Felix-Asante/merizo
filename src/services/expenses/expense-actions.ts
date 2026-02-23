"use server";

import { withAuthenticatedUser } from "@/lib/auth/server";
import { ExpenseRepo } from "@/lib/db/pg/drizzle/expense-repo";
import { GroupRepo } from "@/lib/db/pg/drizzle/group-repo";
import { withTransaction } from "@/lib/db/pg/drizzle/transaction";
import { UsersRepo } from "@/lib/db/pg/drizzle/users-repo";
import type { CreateExpenseBody } from "@/types/expenses";
import { calculateSplits } from "@/utils/expense/split-calculator";

export async function createExpense(createExpenseBody: CreateExpenseBody) {
  try {
    const results = await withAuthenticatedUser(async (user) => {
      return withTransaction(async (tx) => {
        const expenseRepo = new ExpenseRepo(tx);
        const groupRepo = new GroupRepo(tx);
        const usersRepo = new UsersRepo(tx);

        if (createExpenseBody.amount <= 0) {
          throw new Error("Amount must be greater than 0");
        }
        if (createExpenseBody.participantIds.length === 0) {
          throw new Error("At least one participant is required");
        }

        const currentUserMember = await usersRepo.getMemberByUserId(user.id);
        if (!currentUserMember) {
          throw new Error("Forbidden: You are not a member of this group");
        }
        const isMember = await groupRepo.isMember(
          createExpenseBody.groupId,
          currentUserMember.id,
        );
        if (!isMember)
          throw new Error("Forbidden: You are not a member of this group");

        const isPaidUserAMember = await groupRepo.isMember(
          createExpenseBody.groupId,
          createExpenseBody.paidById,
        );
        if (!isPaidUserAMember)
          throw new Error(
            "Forbidden: The paid by user is not a member of this group",
          );

        const group = await groupRepo.getById(createExpenseBody.groupId);
        if (!group) throw new Error("Group not found");

        const expenseDate = new Date(createExpenseBody.date);

        const groupMonthlyPeriod = await groupRepo.getOrCreateMonthlyPeriod(
          group.id,
          expenseDate.getFullYear(),
          expenseDate.getMonth(),
        );

        if (groupMonthlyPeriod.status === "finalized") {
          throw new Error("Month already closed");
        }

        const newExpenseBody = {
          id: crypto.randomUUID(),
          title: createExpenseBody.title,
          organizationId: group.id,
          paidByUserId: createExpenseBody.paidById,
          amount: createExpenseBody.amount.toString(),
          expenseDate: expenseDate,
          periodId: groupMonthlyPeriod.id,
          note: createExpenseBody.note,
          splitType: createExpenseBody.splitMethod,
          createdAt: new Date(),
        };

        const splits = calculateSplits(
          createExpenseBody.amount,
          createExpenseBody.participantIds,
          createExpenseBody.splitMethod,
          createExpenseBody.customSplits,
        );

        const newExpense = await expenseRepo.create(newExpenseBody);
        const expenseSplits = splits.map((split) => ({
          id: crypto.randomUUID(),
          expenseId: newExpense.id,
          memberId: split.memberId,
          amount: split.amount.toString(),
        }));
        await expenseRepo.createExpenseSplits(expenseSplits);
        return newExpense;
      });
    });
    return { error: null, data: results };
  } catch (error) {
    console.log(error);
    return {
      error: new Error("something went wrong. Please try again."),
      data: null,
    };
  }
}
