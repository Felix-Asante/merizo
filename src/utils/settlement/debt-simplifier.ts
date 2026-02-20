export type RawDebt = {
  from: string;
  to: string;
  amount: number;
  settled?: boolean;
};

export type SimplifiedDebt = {
  from: string;
  to: string;
  amount: number;
};

export type UserBalance = {
  youOwe: number;
  youAreOwed: number;
  net: number;
};

export function simplifyDebts(debts: RawDebt[]): SimplifiedDebt[] {
  const unsettled = debts.filter((d) => !d.settled);

  const balances = new Map<string, number>();
  for (const debt of unsettled) {
    balances.set(debt.from, (balances.get(debt.from) ?? 0) - debt.amount);
    balances.set(debt.to, (balances.get(debt.to) ?? 0) + debt.amount);
  }

  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, balance] of balances) {
    if (balance > 0.01) creditors.push({ id, amount: balance });
    else if (balance < -0.01) debtors.push({ id, amount: -balance });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.01) {
      simplified.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return simplified;
}

export function calculateUserBalance(
  debts: RawDebt[],
  userId: string,
): UserBalance {
  let youOwe = 0;
  let youAreOwed = 0;

  for (const debt of debts) {
    if (debt.settled) continue;
    if (debt.from === userId) youOwe += debt.amount;
    if (debt.to === userId) youAreOwed += debt.amount;
  }

  return {
    youOwe: Math.round(youOwe * 100) / 100,
    youAreOwed: Math.round(youAreOwed * 100) / 100,
    net: Math.round((youAreOwed - youOwe) * 100) / 100,
  };
}
