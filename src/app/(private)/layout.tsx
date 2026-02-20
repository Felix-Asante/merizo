import { DashboardLayout } from "@/ui/shared/layouts/dashboard-layout";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
