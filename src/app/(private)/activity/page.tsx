import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getActiveOrganizationId } from "@/lib/auth/server";
import { getActivityPageData } from "@/services/activity/activity-actions";
import { ActivityPage } from "@/ui/sections/dashboard/activity";
import { Skeleton } from "@/ui/base/skeleton";

function ActivityShimmer() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Skeleton className="h-10 w-24 rounded" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  );
}

async function ActivityLoader() {
  const activeGroupId = await getActiveOrganizationId();
  if (!activeGroupId) redirect("/");

  const { data } = await getActivityPageData(activeGroupId);
  if (!data) redirect("/");

  return <ActivityPage groupId={activeGroupId} initialData={data} />;
}

export default function ActivityRoute() {
  return (
    <Suspense fallback={<ActivityShimmer />}>
      <ActivityLoader />
    </Suspense>
  );
}
