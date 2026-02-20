import { TopNavbar } from "@/ui/shared/navigation/top-navbar";
import { BottomNav } from "@/ui/shared/navigation/bottom-nav";
import { Sidebar } from "@/ui/shared/navigation/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavbar />
        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
