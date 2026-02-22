import { useQuery } from "@tanstack/react-query";
import { getActiveGroup } from "@/services/groups/groups-service-client";
import { getGroupMembers } from "@/services/groups/groups-service-server";

export function useActiveGroupMembers() {
  const { data: activeGroup } = getActiveGroup();

  const {
    data,
    error: responseError,
    isLoading,
  } = useQuery({
    queryKey: ["active-group-members"],
    queryFn: () => getGroupMembers(activeGroup?.id ?? ""),
    enabled: !!activeGroup?.id,
  });

  const error = responseError ?? data?.error;
  const members = data?.data ?? [];

  return { members, error, isLoading };
}
