import { getUserGroups } from "@/services/groups/groups-service-server";
import { DashboardHome } from "@/ui/sections/dashboard/home";
import { DashboardShimmer } from "@/ui/sections/dashboard/home/dashboard-shimmer";
import { Suspense } from "react";

export default async function Home() {
  const { data: groups } = await getUserGroups();
  return (
    <Suspense fallback={<DashboardShimmer />}>
      <DashboardHome groups={groups} />
    </Suspense>
  );
}
