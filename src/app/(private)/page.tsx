import { getUserOrganizations } from "@/services/organizations/organization-service-server";
import type { UserOrganization } from "@/types/organization";
import { DashboardHome } from "@/ui/sections/dashboard/home";

export default async function Home() {
  const { data: organizations } = await getUserOrganizations();
  return <DashboardHome organizations={organizations as UserOrganization[]} />;
}
