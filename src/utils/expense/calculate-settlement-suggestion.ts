import type {
  PeriodDebt,
  SettleMember,
  SettlementPageData,
  SettlementPeriod,
  SettlementRecord,
} from "@/types/settlement";

type RawDebt = {
  fromMemberId: string;
  toMemberId: string;
  periodId: string;
  totalAmount: string;
};

type RawSettled = {
  fromMemberId: string;
  toMemberId: string;
  periodId: string;
  settledAmount: string;
};

type RawSettlementRecord = {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: string;
  periodId: string;
  periodYear: number;
  periodMonth: number;
  createdAt: Date;
};

type RawPeriod = {
  id: string;
  year: number;
  month: number;
  status: "open" | "finalized";
};

type RawMember = {
  id: string;
  name: string;
};

type BuildSettlementPageDataParams = {
  currentUserMemberId: string;
  members: RawMember[];
  periods: RawPeriod[];
  rawDebts: RawDebt[];
  rawSettled: RawSettled[];
  rawHistory: RawSettlementRecord[];
};

export function buildSettlementPageData(
  params: BuildSettlementPageDataParams,
): SettlementPageData {
  const members: SettleMember[] = params.members.map((m) => ({
    id: m.id,
    name: m.name,
    isCurrentUser: m.id === params.currentUserMemberId,
  }));

  const periods: SettlementPeriod[] = params.periods.map((p) => ({
    id: p.id,
    year: p.year,
    month: p.month,
    status: p.status,
  }));

  const settledMap = new Map<string, number>();
  for (const s of params.rawSettled) {
    const key = `${s.fromMemberId}-${s.toMemberId}-${s.periodId}`;
    settledMap.set(key, (settledMap.get(key) ?? 0) + Number(s.settledAmount));
  }

  const debts: PeriodDebt[] = params.rawDebts.map((d) => {
    const key = `${d.fromMemberId}-${d.toMemberId}-${d.periodId}`;
    const rawSettled = settledMap.get(key) ?? 0;
    const totalAmount = Math.round(Number(d.totalAmount) * 100) / 100;
    const settledAmount = Math.min(
      Math.round(rawSettled * 100) / 100,
      totalAmount,
    );
    return {
      id: key,
      fromMemberId: d.fromMemberId,
      toMemberId: d.toMemberId,
      periodId: d.periodId,
      totalAmount,
      settledAmount,
    };
  });

  const settlements: SettlementRecord[] = params.rawHistory.map((h) => ({
    id: h.id,
    fromMemberId: h.fromMemberId,
    toMemberId: h.toMemberId,
    amount: Math.round(Number(h.amount) * 100) / 100,
    periodId: h.periodId,
    periodYear: h.periodYear,
    periodMonth: h.periodMonth,
    createdAt: h.createdAt.toISOString(),
  }));

  return {
    currentUserMemberId: params.currentUserMemberId,
    members,
    periods,
    debts,
    settlements,
  };
}
