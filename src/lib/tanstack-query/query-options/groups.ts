import { QUERY_KEYS } from "../query-keys";
import { getGroupMembers } from "@/services/groups/groups-service-server";

export const getActiveGroupMembersQueryOptions = (groupId: string) => {
  return {
    queryKey: QUERY_KEYS.groups.activeMembers(groupId),
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
  };
};
