export type SettleMember = {
  id: string;
  name: string;
  isCurrentUser: boolean;
};

export type SettlementPeriod = {
  id: string;
  year: number;
  month: number;
  status: "open" | "finalized";
};

export type PeriodDebt = {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  periodId: string;
  totalAmount: number;
  settledAmount: number;
};

export type SettlementRecord = {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  periodId: string;
  periodYear: number;
  periodMonth: number;
  createdAt: string;
};

export type SettlementPageData = {
  currentUserMemberId: string;
  members: SettleMember[];
  periods: SettlementPeriod[];
  debts: PeriodDebt[];
  settlements: SettlementRecord[];
};

export type SettlementContext = "open" | (string & {});
