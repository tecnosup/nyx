import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-nyx-bg">
        <header className="border-b border-nyx-line">
          <div className="container-nyx flex items-center justify-between h-16">
            <Link href="/admin" className="heading-display text-xl tracking-tight">
              NYX<span className="text-nyx-muted">.admin</span>
            </Link>
            <AdminNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
