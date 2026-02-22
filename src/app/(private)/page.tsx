import { getUserOrganizations } from "@/services/organizations/organization-service-server";
import type { UserOrganization } from "@/types/organization";
import { DashboardHome } from "@/ui/sections/dashboard/home";
import { DashboardShimmer } from "@/ui/sections/dashboard/home/dashboard-shimmer";
import { Suspense } from "react";

export default async function Home() {
  const { data: organizations } = await getUserOrganizations();
  return (
    <Suspense fallback={<DashboardShimmer />}>
      <DashboardHome organizations={organizations as UserOrganization[]} />
    </Suspense>
  );
}
