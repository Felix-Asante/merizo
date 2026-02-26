import { redirect } from "next/navigation";
import { getActiveOrganizationId } from "@/lib/auth/server";
import { getSettlementSuggestions } from "@/services/expenses/expense-actions";
import { SettleUp } from "@/ui/sections/dashboard/settle-up";

export default async function SettleUpPage() {
  const activeGroupId = await getActiveOrganizationId();
  if (!activeGroupId) redirect("/");

  const { data } = await getSettlementSuggestions(activeGroupId);
  if (!data) redirect("/");

  return <SettleUp settlementData={data} groupId={activeGroupId} />;
}
