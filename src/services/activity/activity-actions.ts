"use server";

import { withAuthenticatedUser } from "@/lib/auth/server";
import { groupRepo } from "@/lib/db/pg/drizzle/group-repo";
import { Logger } from "@/lib/logger";
import type { ActivityItem } from "@/services/dashboard/dashboard-actions";

const logger = new Logger("ActivityActions");

export interface ActivityFilters {
  memberId?: string;
  periodId?: string;
  search?: string;
  page?: number;
}

interface MemberOption {
  id: string;
  name: string;
}

interface PeriodOption {
  id: string;
  year: number;
  month: number;
  status: string;
  label: string;
}

export interface ActivityPageData {
  activities: ActivityItem[];
  total: number;
  page: number;
  pageSize: number;
  members: MemberOption[];
  periods: PeriodOption[];
  currentMemberId: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function getActivityPageData(
  groupId: string,
  filters: ActivityFilters = {},
): Promise<{ error: string | null; data: ActivityPageData | null }> {
  try {
    const data = await withAuthenticatedUser(async (user) => {
      const activeMember = await groupRepo.getActiveMember(groupId, user.id);
      if (!activeMember) {
        throw new Error("You are not a member of this group");
      }

      const pageSize = 20;
      const page = filters.page ?? 1;

      const [{ rows, total }, members, periods] = await Promise.all([
        groupRepo.getFilteredActivity(groupId, {
          memberId: filters.memberId,
          periodId: filters.periodId,
          search: filters.search,
          page,
          pageSize,
        }),
        groupRepo.getGroupMembers(groupId),
        groupRepo.getGroupPeriods(groupId),
      ]);

      const expenseIds = rows.map((r) => r.id);
      const userSplits = await groupRepo.getUserSplitsForExpenses(
        expenseIds,
        activeMember.id,
      );

      const splitsMap = new Map(
        userSplits.map((s) => [s.expenseId, Number(s.splitAmount)]),
      );

      const activities: ActivityItem[] = rows.map((e) => ({
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
        activities,
        total,
        page,
        pageSize,
        currentMemberId: activeMember.id,
        members: members.map((m) => ({ id: m.id, name: m.name })),
        periods: periods.map((p) => ({
          id: p.id,
          year: p.year,
          month: p.month,
          status: p.status,
          label: `${MONTH_NAMES[p.month]} ${p.year}`,
        })),
      };
    });

    return { error: null, data };
  } catch (error) {
    logger.error("Failed to get activity page data", error as Error);
    return { error: "Failed to load activities", data: null };
  }
}
