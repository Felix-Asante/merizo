import type { member } from "@/lib/db/pg/drizzle/schemas";

export type UserGroup = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  inviteCode: string;
  memberCount: number;
};

export type CreateGroupBody = {
  name: string;
  slug: string;
  inviteCode: string;
  currency: string;
  type?: string;
};

export type Group = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  inviteCode: string;
  currency: string;
  type?: string;
  metadata: string | null;
};

export type GroupTypeOption = {
  value: string;
  label: string;
  emoji: string;
};

export type GroupMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};
