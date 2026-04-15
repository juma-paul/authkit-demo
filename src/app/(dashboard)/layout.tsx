import Sidebar from "@/components/shell/Sidebar";
import BottomNav from "@/components/shell/BottomNav";
import { SidebarProvider } from "@/providers/SidebarProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">{children}</main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
