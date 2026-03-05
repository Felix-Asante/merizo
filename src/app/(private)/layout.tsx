import { DashboardLayout } from "@/ui/shared/layouts/dashboard-layout";
import { isAuthenticated } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
