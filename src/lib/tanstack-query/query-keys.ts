export const QUERY_KEYS = {
  groups: {
    all: ["groups"] as const,
    activeMembers: (groupId: string) =>
      [...QUERY_KEYS.groups.all, "members", groupId] as const,
  },
  members: {
    all: ["members"] as const,
    active: (groupId: string) => [...QUERY_KEYS.members.all, groupId] as const,
  },
};
