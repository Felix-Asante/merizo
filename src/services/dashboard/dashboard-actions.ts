"use server";

import { withAuthenticatedUser } from "@/lib/auth/server";
import { groupRepo } from "@/lib/db/pg/drizzle/group-repo";
import { Logger } from "@/lib/logger";
import type { DashboardData } from "@/types";
import type { ActivityItem } from "@/types/expenses";

const logger = new Logger("DashboardActions");

export async function getDashboardData(
  groupId: string,
): Promise<{ error: string | null; data: DashboardData | null }> {
  try {
    const data = await withAuthenticatedUser(async (user) => {
      const activeMember = await groupRepo.getActiveMember(groupId, user.id);
      if (!activeMember) {
        throw new Error("You are not a member of this group");
      }

      const [balance, recentActivity] = await Promise.all([
        groupRepo.getUserBalance(groupId, activeMember.id),
        groupRepo.getRecentActivity(groupId, 5),
      ]);

      const expenseIds = recentActivity.map((e) => e.id);
      const userSplits = await groupRepo.getUserSplitsForExpenses(
        expenseIds,
        activeMember.id,
      );

      const splitsMap = new Map(
        userSplits.map((s) => [s.expenseId, Number(s.splitAmount)]),
      );

      const activities: ActivityItem[] = recentActivity.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        paidByName: e.paidByName,
        paidByMemberId: e.paidByMemberId,
        isCurrentUser: e.paidByMemberId === activeMember.id,
        userSplitAmount: splitsMap.get(e.id) ?? 0,
        createdAt: e.createdAt,
        periodStatus: e.periodStatus,
      }));

      return {
        balance,
        activities,
        currentMemberId: activeMember.id,
        userName: user.name,
      };
    });

    return { error: null, data };
  } catch (error) {
    logger.error("Failed to get dashboard data", error as Error);
    return { error: "Failed to load dashboard data", data: null };
  }
}
