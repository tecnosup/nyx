import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar, AdminBottomNav } from "@/components/admin/AdminNav";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex bg-nyx-bg">
        {/* Desktop sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Mobile header */}
          <header className="md:hidden flex items-center h-14 px-5 border-b border-nyx-line shrink-0">
            <Link href="/admin" className="heading-display text-lg tracking-tight">
              NYX<span className="text-nyx-muted">.admin</span>
            </Link>
          </header>

          {/* Page content — extra bottom padding on mobile for bottom nav */}
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <AdminBottomNav />
      </div>
    </AdminAuthGuard>
  );
}
