import type { ActivityItem } from "./expenses";

export type CurrencyOption = {
  code: string;
  symbol: string;
  name: string;
};

export type SplitMethod = "equal" | "exact" | "percentage";

export type SplitResult = {
  memberId: string;
  amount: number;
};

export type SplitPreviewItem = {
  memberId: string;
  name: string;
  share: number;
  relation: "owes_you" | "you_owe";
};

export type DashboardData = {
  balance: { youOwe: number; youAreOwed: number };
  activities: ActivityItem[];
  currentMemberId: string;
  userName: string;
};
