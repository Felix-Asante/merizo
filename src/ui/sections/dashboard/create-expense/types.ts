export type Member = {
  id: string;
  name: string;
  isCurrentUser?: boolean;
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
