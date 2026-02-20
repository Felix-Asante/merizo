import type { SettleMember, Debt } from "./types";

export const CURRENT_USER_ID = "u1";

export const SETTLE_MEMBERS: SettleMember[] = [
  { id: "u1", name: "Felix User", isCurrentUser: true },
  { id: "u2", name: "Sarah Chen" },
  { id: "u3", name: "John Park" },
  { id: "u4", name: "Emma Wilson" },
  { id: "u5", name: "Mike Ross" },
];

export const DUMMY_DEBTS: Debt[] = [
  { id: "d1", from: "u1", to: "u2", amount: 40.0, settled: false },
  { id: "d2", from: "u3", to: "u1", amount: 25.0, settled: false },
  { id: "d3", from: "u1", to: "u4", amount: 15.5, settled: false },
  { id: "d4", from: "u5", to: "u2", amount: 30.0, settled: false },
  { id: "d5", from: "u3", to: "u4", amount: 20.0, settled: false },
  { id: "d6", from: "u4", to: "u1", amount: 10.0, settled: false },
];
