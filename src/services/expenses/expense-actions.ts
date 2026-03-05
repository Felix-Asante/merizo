"use server";

import { withAuthenticatedUser } from "@/lib/auth/server";
import { ExpenseRepo } from "@/lib/db/pg/drizzle/expense-repo";
import { GroupRepo } from "@/lib/db/pg/drizzle/group-repo";
import { withTransaction } from "@/lib/db/pg/drizzle/transaction";
import { UsersRepo } from "@/lib/db/pg/drizzle/users-repo";
import type { CreateExpenseBody } from "@/types/expenses";
import type { SettlementPageData } from "@/types/settlement";
import { buildSettlementPageData } from "@/utils/expense/calculate-settlement-suggestion";
import { calculateSplits, normalizeSplitsToTotal } from "@/utils/expense/split-calculator";
import { revalidatePath } from "next/cache";

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

        const group = await groupRepo.getById(createExpenseBody.groupId);
        if (!group) throw new Error("Group not found");

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
        const normalizedSplits = normalizeSplitsToTotal(
          splits,
          createExpenseBody.amount,
        );
        const newExpense = await expenseRepo.create(newExpenseBody);
        const expenseSplits = normalizedSplits.map((split) => ({
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

export async function getSettlementSuggestions(
  groupId: string,
): Promise<{ error: Error | null; data: SettlementPageData | null }> {
  try {
    const data = await withAuthenticatedUser(async (user) => {
      return withTransaction(async (tx) => {
        const expenseRepo = new ExpenseRepo(tx);
        const groupRepo = new GroupRepo(tx);

        const activeMember = await groupRepo.getActiveMember(groupId, user.id);
        if (!activeMember) {
          throw new Error("You are not a member of this group");
        }

        const [groupMembers, periods, rawDebts, rawSettled, rawHistory] =
          await Promise.all([
            groupRepo.getGroupMembers(groupId),
            expenseRepo.getUnsettledPeriods(groupId),
            expenseRepo.getDebtsPerPairPerPeriod(groupId),
            expenseRepo.getSettledAmountsPerPairPerPeriod(groupId),
            expenseRepo.getSettlementHistory(groupId),
          ]);

        return buildSettlementPageData({
          currentUserMemberId: activeMember.id,
          members: groupMembers.map((m) => ({ id: m.id, name: m.name })),
          periods,
          rawDebts,
          rawSettled,
          rawHistory,
        });
      });
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

export async function recordSettlement(body: {
  groupId: string;
  periodId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  note?: string;
}): Promise<{ error: Error | null }> {
  try {
    await withAuthenticatedUser(async (user) => {
      return withTransaction(async (tx) => {
        const expenseRepo = new ExpenseRepo(tx);
        const groupRepo = new GroupRepo(tx);

        const activeMember = await groupRepo.getActiveMember(
          body.groupId,
          user.id,
        );
        if (!activeMember) {
          throw new Error("You are not a member of this group");
        }

        if (body.periodId === "open") {
          await distributeSettlementAcrossPeriods(expenseRepo, body);
        } else {
          await expenseRepo.createSettlement(body.periodId, [
            {
              fromMemberId: body.fromMemberId,
              toMemberId: body.toMemberId,
              amount: body.amount.toString(),
            },
          ]);
        }
      });
    });

    revalidatePath("/settle");
    return { error: null };
  } catch (error) {
    console.error("[recordSettlement]", error);
    return {
      error: new Error("something went wrong. Please try again."),
    };
  }
}

async function distributeSettlementAcrossPeriods(
  expenseRepo: ExpenseRepo,
  body: {
    groupId: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
  },
) {
  const [rawDebts, rawSettled, periods] = await Promise.all([
    expenseRepo.getDebtsPerPairPerPeriod(body.groupId),
    expenseRepo.getSettledAmountsPerPairPerPeriod(body.groupId),
    expenseRepo.getUnsettledPeriods(body.groupId),
  ]);

  const settledMap = new Map<string, number>();
  for (const s of rawSettled) {
    const key = `${s.fromMemberId}-${s.toMemberId}-${s.periodId}`;
    settledMap.set(key, (settledMap.get(key) ?? 0) + Number(s.settledAmount));
  }

  const pairDebts = rawDebts
    .filter(
      (d) =>
        d.fromMemberId === body.fromMemberId &&
        d.toMemberId === body.toMemberId,
    )
    .map((d) => {
      const key = `${d.fromMemberId}-${d.toMemberId}-${d.periodId}`;
      const alreadySettled = settledMap.get(key) ?? 0;
      const total = Number(d.totalAmount);
      const outstanding = Math.round(
        Math.max(0, total - alreadySettled) * 100,
      ) / 100;
      return {
        periodId: d.periodId,
        outstanding,
      };
    })
    .filter((d) => d.outstanding > 0.01);

  const periodMap = new Map(periods.map((p) => [p.id, p]));
  pairDebts.sort((a, b) => {
    const pa = periodMap.get(a.periodId);
    const pb = periodMap.get(b.periodId);
    if (!pa || !pb) return 0;
    if (pa.year !== pb.year) return pa.year - pb.year;
    return pa.month - pb.month;
  });

  // Batch amounts by period so one payment produces one settlement per period
  const amountByPeriod = new Map<string, number>();
  let remaining = Math.round(body.amount * 100) / 100;

  for (const debt of pairDebts) {
    if (remaining <= 0.01) break;
    const settleAmount = Math.round(
      Math.min(remaining, debt.outstanding) * 100,
    ) / 100;
    if (settleAmount < 0.01) continue;
    amountByPeriod.set(
      debt.periodId,
      (amountByPeriod.get(debt.periodId) ?? 0) + settleAmount,
    );
    remaining = Math.round((remaining - settleAmount) * 100) / 100;
  }

  // If there's leftover (e.g. overpayment or single period with debt < payment), add to first period
  if (remaining > 0.01 && pairDebts.length > 0) {
    const firstPeriodId = pairDebts[0].periodId;
    amountByPeriod.set(
      firstPeriodId,
      (amountByPeriod.get(firstPeriodId) ?? 0) + remaining,
    );
  }

  const item = {
    fromMemberId: body.fromMemberId,
    toMemberId: body.toMemberId,
  };
  for (const [periodId, totalAmount] of amountByPeriod) {
    const amount = Math.round(totalAmount * 100) / 100;
    if (amount < 0.01) continue;
    await expenseRepo.createSettlement(periodId, [
      { ...item, amount: amount.toFixed(2) },
    ]);
  }
}
