import { getUserGroups, ensureDefaultGroup } from "@/services/groups/groups-service-server";
import { getActiveOrganizationId } from "@/lib/auth/server";
import { getDashboardData } from "@/services/dashboard/dashboard-actions";
import { DashboardHome } from "@/ui/sections/dashboard/home";
import { DashboardShimmer } from "@/ui/sections/dashboard/home/dashboard-shimmer";
import { Suspense } from "react";

async function DashboardLoader() {
  const [{ data: groups }, activeGroupId] = await Promise.all([
    getUserGroups(),
    getActiveOrganizationId(),
  ]);

  if (!activeGroupId && groups.length > 0) {
    await ensureDefaultGroup();
  }

  const groupId = activeGroupId ?? groups[0]?.id;
  let initialData = null;

  if (groupId) {
    const result = await getDashboardData(groupId);
    initialData = result.data;
  }

  return <DashboardHome groups={groups} initialData={initialData} />;
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardShimmer />}>
      <DashboardLoader />
    </Suspense>
  );
}
