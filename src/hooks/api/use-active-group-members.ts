import { useQuery } from "@tanstack/react-query";
import { getActiveGroup } from "@/services/groups/groups-service-client";
import { getActiveGroupMembersQueryOptions } from "@/lib/tanstack-query/query-options/groups";

export function useActiveGroupMembers() {
  const { data: activeGroup } = getActiveGroup();

  const {
    data,
    error: responseError,
    isLoading,
  } = useQuery(getActiveGroupMembersQueryOptions(activeGroup?.id ?? ""));

  const error = responseError ?? data?.error;
  const members = data?.data ?? [];

  return { members, error, isLoading, activeGroup };
}
