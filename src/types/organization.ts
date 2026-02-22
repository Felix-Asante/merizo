export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  inviteCode: string;
  memberCount: number;
};

export type CreateOrganizationBody = {
  name: string;
  slug: string;
  inviteCode: string;
  currency: string;
  type?: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  inviteCode: string;
  currency: string;
  type?: string;
  metadata: string | null;
};
