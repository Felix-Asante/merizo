export function canDeleteExpense(
  paidByMemberId: string,
  currentMemberId: string,
  periodStatus: string,
): boolean {
  return paidByMemberId === currentMemberId && periodStatus === "open";
}
