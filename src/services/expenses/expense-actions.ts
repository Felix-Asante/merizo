"use server";

import { withAuthenticatedUser } from "@/lib/auth/server";
import { expenseRepo, ExpenseRepo } from "@/lib/db/pg/drizzle/expense-repo";
import { groupRepo, GroupRepo } from "@/lib/db/pg/drizzle/group-repo";
import { withTransaction } from "@/lib/db/pg/drizzle/transaction";
import { usersRepo, UsersRepo } from "@/lib/db/pg/drizzle/users-repo";
import type { CreateExpenseBody } from "@/types/expenses";
import type { GroupMember } from "@/types/groups";
import {
  calculateNetBalancePerMember,
  calculateSettlementSuggestions,
} from "@/utils/expense/calculate-settlement-suggestion";

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

export async function getSettlementSuggestions(groupId: string) {
  try {
    const data = await withAuthenticatedUser(async (user) => {
      const currentMember = await usersRepo.getMemberByUserId(user.id);
      if (!currentMember) {
        throw new Error("You are not a member of any group");
      }

      const groupMembers = await groupRepo.getGroupMembers(groupId);

      const unsettledPeriods = await expenseRepo.getUnsettledPeriods(groupId);

      const netBalancePerMember = [];
      for (const period of unsettledPeriods) {
        const [totalPaidPerMember, totalOwedPerMember] = await Promise.all([
          expenseRepo.getTotalPaidPerMember(period.id),
          expenseRepo.getTotalOwedPerMember(period.id),
        ]);

        const netBalancePerMemberForPeriod = calculateNetBalancePerMember(
          totalPaidPerMember,
          totalOwedPerMember,
          period,
          groupMembers,
        );

        console.log(
          `totalPaidPerMember: ${JSON.stringify(totalPaidPerMember, null, 2)}, totalOwedPerMember: ${JSON.stringify(totalOwedPerMember, null, 2)}`,
        );
        netBalancePerMember.push(...netBalancePerMemberForPeriod);
      }
      const creditors = netBalancePerMember
        .filter((member) => member.netBalance > 0)
        .sort((a, b) => b.netBalance - a.netBalance);
      const debtors = netBalancePerMember
        .filter((member) => member.netBalance < 0)
        .sort((a, b) => a.netBalance - b.netBalance);

      console.log(
        ` netBalance: ${JSON.stringify(netBalancePerMember, null, 2)}, creditors: ${JSON.stringify(creditors, null, 2)}, debtors: ${JSON.stringify(debtors, null, 2)}`,
      );

      const suggestions = calculateSettlementSuggestions(debtors, creditors);
      console.log({ suggestions });
      return [];
    });

    return { error: null, data };
  } catch (error) {
    console.error("[getSettlementSuggestions]", error);
    return {
      error: new Error("something went wrong. Please try again."),
      data: null,
    };
  }
}
