export interface SettleMember {
  id: string;
  name: string;
  isCurrentUser?: boolean;
}

export interface Debt {
  id: string;
  from: string;
  to: string;
  amount: number;
  settled: boolean;
}
