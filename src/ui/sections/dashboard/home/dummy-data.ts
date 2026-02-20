export interface Group {
  id: string;
  name: string;
  membersCount: number;
  balance: number;
}

export interface GroupBalance {
  youOwe: number;
  youAreOwed: number;
}

export interface GroupActivity {
  id: string;
  name: string;
  description: string;
  amount: number;
  date: string;
  status: "settled" | "pending";
  isCurrentUser?: boolean;
}

interface GroupData {
  balance: GroupBalance;
  activities: GroupActivity[];
}

export const DUMMY_GROUPS: Group[] = [
  { id: "1", name: "Apartment 4B", membersCount: 4, balance: 33.25 },
  { id: "2", name: "Trip to Barcelona", membersCount: 6, balance: -32.0 },
  { id: "3", name: "Office Lunch Club", membersCount: 8, balance: 12.75 },
];

export const DUMMY_GROUP_DATA: Record<string, GroupData> = {
  "1": {
    balance: { youOwe: 45.5, youAreOwed: 78.75 },
    activities: [
      {
        id: "a1",
        name: "Sarah Chen",
        description: "Dinner",
        amount: -30.0,
        date: "Today, 8:30 PM",
        status: "pending",
      },
      {
        id: "a2",
        name: "Felix User",
        description: "Groceries",
        amount: 45.5,
        date: "Today, 2:15 PM",
        status: "pending",
        isCurrentUser: true,
      },
      {
        id: "a3",
        name: "Mike Ross",
        description: "Electricity bill",
        amount: -22.0,
        date: "Yesterday",
        status: "settled",
      },
    ],
  },
  "2": {
    balance: { youOwe: 32.0, youAreOwed: 0 },
    activities: [
      {
        id: "b1",
        name: "Emma Wilson",
        description: "Hotel room",
        amount: -120.0,
        date: "Feb 14",
        status: "pending",
      },
      {
        id: "b2",
        name: "Felix User",
        description: "Museum tickets",
        amount: 36.0,
        date: "Feb 13",
        status: "settled",
        isCurrentUser: true,
      },
      {
        id: "b3",
        name: "Alex Park",
        description: "Tapas dinner",
        amount: -48.0,
        date: "Feb 13",
        status: "pending",
      },
    ],
  },
  "3": {
    balance: { youOwe: 11.0, youAreOwed: 23.75 },
    activities: [
      {
        id: "c1",
        name: "Felix User",
        description: "Pizza Friday",
        amount: 23.75,
        date: "Today, 12:30 PM",
        status: "pending",
        isCurrentUser: true,
      },
      {
        id: "c2",
        name: "Lisa Park",
        description: "Coffee run",
        amount: -11.0,
        date: "Yesterday",
        status: "pending",
      },
    ],
  },
};
