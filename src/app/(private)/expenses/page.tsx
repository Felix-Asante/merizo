import { getActiveOrganizationId } from "@/lib/auth/server";
import { CreateExpense } from "@/ui/sections/dashboard/create-expense";
import { redirect } from "next/navigation";

export default async function CreateExpensePage() {
  const activeGroupId = await getActiveOrganizationId();
  if (!activeGroupId) redirect("/");

  return <CreateExpense />;
}
