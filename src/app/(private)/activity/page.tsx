import { redirect } from "next/navigation";
import { getActiveOrganizationId } from "@/lib/auth/server";
import { getActivityPageData } from "@/services/activity/activity-actions";
import { ActivityPage } from "@/ui/sections/dashboard/activity";

export default async function ActivityRoute() {
  const activeGroupId = await getActiveOrganizationId();
  if (!activeGroupId) redirect("/");

  const { data } = await getActivityPageData(activeGroupId);
  if (!data) redirect("/");

  return <ActivityPage groupId={activeGroupId} initialData={data} />;
}
