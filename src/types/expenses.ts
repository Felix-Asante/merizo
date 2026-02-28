import type { SplitMethod } from ".";

export type Expense = {
  id: string;
  title: string;
  note: string | null;
  organizationId: string;
  paidByUserId: string;
  amount: number;
  splitType: SplitType;
  createdAt: Date;
  expenseDate: Date;
  periodId: string;
};

export type SplitType = "percentage" | "equal" | "custom";

export type CreateExpenseBody = {
  amount: number;
  title: string;
  date: string;
  note: string | null;
  splitMethod: SplitMethod;
  paidById: string;
  participantIds: string[];
  customSplits: Record<string, number>;
  groupId: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  amount: number;
  paidByName: string;
  paidByMemberId: string;
  isCurrentUser: boolean;
  userSplitAmount: number;
  createdAt: Date;
  periodStatus: string;
};
