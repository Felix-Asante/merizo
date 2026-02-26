import type {
  PeriodDebt,
  SettlementContext,
  SettlementPeriod,
} from "@/types/settlement";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EPSILON = 0.01;

export type ContextualDebt = {
  from: string;
  to: string;
  amount: number;
  periodId: string | null;
};

export type UserBalance = {
  youOwe: number;
  youAreOwed: number;
  net: number;
};

export type SettlementSuggestion = {
  from: string;
  to: string;
  amount: number;
};

export type PeriodSettlementStatus =
  | "open"
  | "partially_settled"
  | "settled";

export function formatPeriodLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function getContextLabel(
  context: SettlementContext,
  periods: SettlementPeriod[],
): string {
  if (context === "open") return "Open Balance";
  const period = periods.find((p) => p.id === context);
  if (!period) return "Unknown Period";
  return formatPeriodLabel(period.year, period.month);
}

export function getContextDebts(
  debts: PeriodDebt[],
  context: SettlementContext,
): ContextualDebt[] {
  const filtered =
    context === "open" ? debts : debts.filter((d) => d.periodId === context);

  const outstanding = filtered.map((d) => ({
    from: d.fromMemberId,
    to: d.toMemberId,
    amount: d.totalAmount - d.settledAmount,
    periodId: d.periodId,
  }));

  if (context === "open") {
    // Aggregate BEFORE filtering so over-settled periods offset under-settled ones
    return aggregateByPair(outstanding).filter((d) => d.amount > EPSILON);
  }

  return outstanding.filter((d) => d.amount > EPSILON);
}

function aggregateByPair(debts: ContextualDebt[]): ContextualDebt[] {
  const map = new Map<string, ContextualDebt>();

  for (const d of debts) {
    const key = `${d.from}-${d.to}`;
    const existing = map.get(key);
    if (existing) {
      existing.amount += d.amount;
    } else {
      map.set(key, { ...d, periodId: null });
    }
  }

  return [...map.values()].map((d) => ({
    ...d,
    amount: Math.round(d.amount * 100) / 100,
  }));
}

export function computeUserBalance(
  debts: ContextualDebt[],
  userId: string,
): UserBalance {
  let youOwe = 0;
  let youAreOwed = 0;

  for (const d of debts) {
    if (d.from === userId) youOwe += d.amount;
    if (d.to === userId) youAreOwed += d.amount;
  }

  return {
    youOwe: Math.round(youOwe * 100) / 100,
    youAreOwed: Math.round(youAreOwed * 100) / 100,
    net: Math.round((youAreOwed - youOwe) * 100) / 100,
  };
}

export function generateSuggestions(
  debts: ContextualDebt[],
): SettlementSuggestion[] {
  const balances = new Map<string, number>();

  for (const d of debts) {
    balances.set(d.from, (balances.get(d.from) ?? 0) - d.amount);
    balances.set(d.to, (balances.get(d.to) ?? 0) + d.amount);
  }

  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, balance] of balances) {
    if (balance > EPSILON) creditors.push({ id, amount: balance });
    else if (balance < -EPSILON) debtors.push({ id, amount: -balance });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const suggestions: SettlementSuggestion[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > EPSILON) {
      suggestions.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < EPSILON) i++;
    if (creditors[j].amount < EPSILON) j++;
  }

  return suggestions;
}

export function getPeriodSettlementStatus(
  debts: PeriodDebt[],
  periodId: string,
): PeriodSettlementStatus {
  const periodDebts = debts.filter((d) => d.periodId === periodId);
  if (periodDebts.length === 0) return "settled";

  const totalDebt = periodDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalSettled = periodDebts.reduce(
    (sum, d) => sum + d.settledAmount,
    0,
  );

  if (totalSettled >= totalDebt - EPSILON) return "settled";
  if (totalSettled > EPSILON) return "partially_settled";
  return "open";
}

export function getSettlementProgress(
  debts: PeriodDebt[],
  periodId: string,
): number {
  const periodDebts = debts.filter((d) => d.periodId === periodId);
  if (periodDebts.length === 0) return 100;

  const totalDebt = periodDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalSettled = periodDebts.reduce(
    (sum, d) => sum + d.settledAmount,
    0,
  );

  if (totalDebt < EPSILON) return 100;
  return Math.min(100, Math.round((totalSettled / totalDebt) * 100));
}

export function getOutstandingForDebt(debt: PeriodDebt): number {
  return Math.max(
    0,
    Math.round((debt.totalAmount - debt.settledAmount) * 100) / 100,
  );
}
