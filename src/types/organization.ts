export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  memberCount: number;
};

export type CreateOrganizationBody = {
  name: string;
  slug: string;
  inviteCode: string;
  currency: string;
  type?: string;
};
