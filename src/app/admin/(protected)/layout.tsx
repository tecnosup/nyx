import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSignOut } from "./AdminSignOut";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/drops", label: "Drops" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

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
            <Link
              href="/admin"
              className="heading-display text-xl tracking-tight"
            >
              NYX<span className="text-nyx-muted">.admin</span>
            </Link>
            <nav className="flex items-center gap-6">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="label-mono text-nyx-ink hover:text-nyx-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <AdminSignOut />
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
