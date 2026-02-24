import type { GroupMember } from "@/types/groups";

type TotalPaidPerMember = {
  memberId: string;
  memberName: string;
  totalPaid: string;
};

type TotalOwedPerMember = {
  memberId: string;
  memberName: string;
  totalOwed: string;
};

type Period = {
  month: number;
  year: number;
  id: string;
};

type NetBalancePerMember = {
  memberId: string;
  memberName: string;
  netBalance: number;
  month: number;
  year: number;
};

type SettlementSuggestion = {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
};

export function calculateNetBalancePerMember(
  totalPaidPerMember: TotalPaidPerMember[],
  totalOwedPerMember: TotalOwedPerMember[],
  period: Period,
  groupMembers: GroupMember[],
) {
  const paidMap = new Map<string, TotalPaidPerMember>();
  const owedMap = new Map<string, TotalOwedPerMember>();
  for (const paid of totalPaidPerMember) {
    paidMap.set(paid.memberId, paid);
  }
  for (const owed of totalOwedPerMember) {
    owedMap.set(owed.memberId, owed);
  }
  const netBalancePerMember: NetBalancePerMember[] = [];

  for (const member of groupMembers) {
    const paid = paidMap.get(member.id);
    const owed = owedMap.get(member.id);

    const totalPaid = paid ? Number(paid.totalPaid) : 0;
    const totalOwed = owed ? Number(owed.totalOwed) : 0;
    const netBalance = totalPaid - totalOwed;

    netBalancePerMember.push({
      memberId: member.id,
      memberName: member.name,
      netBalance: netBalance,
      month: period.month,
      year: period.year,
    });
  }
  return netBalancePerMember;
}

export function calculateSettlementSuggestions(
  debtors: NetBalancePerMember[],
  creditors: NetBalancePerMember[],
) {
  const suggestions: SettlementSuggestion[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const transfer = Math.min(Math.abs(debtor.netBalance), creditor.netBalance);

    suggestions.push({
      fromMemberId: debtor.memberId,
      fromMemberName: debtor.memberName,
      toMemberId: creditor.memberId,
      toMemberName: creditor.memberName,
      amount: Number(transfer.toFixed(2)),
    });

    debtor.netBalance += transfer; // because it's negative
    creditor.netBalance -= transfer;

    if (debtor.netBalance <= 0.01) i++;
    if (creditor.netBalance <= 0.01) j++;
  }

  return suggestions;
}
