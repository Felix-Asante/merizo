import type {
  Member,
  SplitMethod,
  SplitResult,
  SplitPreviewItem,
} from "@/ui/sections/dashboard/create-expense/types";

export function calculateSplits(
  totalAmount: number,
  participantIds: string[],
  splitMethod: SplitMethod,
  customSplits: Record<string, number>,
): SplitResult[] {
  if (participantIds.length === 0 || totalAmount <= 0) return [];

  switch (splitMethod) {
    case "equal": {
      const share = totalAmount / participantIds.length;
      return participantIds.map((id) => ({ memberId: id, amount: share }));
    }
    case "exact":
      return participantIds.map((id) => ({
        memberId: id,
        amount: customSplits[id] ?? 0,
      }));
    case "percentage":
      return participantIds.map((id) => ({
        memberId: id,
        amount: (totalAmount * (customSplits[id] ?? 0)) / 100,
      }));
  }
}

export function calculatePreview(
  totalAmount: number,
  paidById: string,
  participantIds: string[],
  splitMethod: SplitMethod,
  customSplits: Record<string, number>,
  members: Member[],
  currentUserId: string,
): SplitPreviewItem[] {
  const splits = calculateSplits(
    totalAmount,
    participantIds,
    splitMethod,
    customSplits,
  );
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const payerIsCurrentUser = paidById === currentUserId;

  return splits
    .filter((s) => s.memberId !== paidById && s.amount > 0)
    .map((s) => {
      const member = memberMap.get(s.memberId);
      const isCurrentUser = s.memberId === currentUserId;

      return {
        memberId: s.memberId,
        name: isCurrentUser ? "You" : (member?.name ?? "Unknown"),
        share: s.amount,
        relation: payerIsCurrentUser
          ? ("owes_you" as const)
          : ("you_owe" as const),
      };
    });
}

export function getSplitTotal(
  participantIds: string[],
  customSplits: Record<string, number>,
): number {
  return participantIds.reduce(
    (acc, id) => acc + (customSplits[id] ?? 0),
    0,
  );
}
