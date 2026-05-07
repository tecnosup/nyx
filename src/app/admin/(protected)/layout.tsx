import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar, AdminBottomNav } from "@/components/admin/AdminNav";
import { adminOrderStats } from "@/lib/admin-orders";
import { adminListGastos } from "@/lib/admin-gastos";

function todaySP() {
  return new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orderStats, gastos] = await Promise.all([
    adminOrderStats(),
    adminListGastos().catch(() => []),
  ]);
  const pendingCount = orderStats.pending;

  const today = todaySP();
  const OFFSETS = [10, 3, 0];
  // Vermelho: vencidos
  const gastosOverdueCount = gastos.filter((g) =>
    g.remindRenewal && g.dueDate && g.active && g.dueDate < today
  ).length;
  // Amarelo: lembrete ativo hoje (10d, 3d, 0d) mas não vencido
  const gastosUpcomingCount = gastos.filter((g) => {
    if (!g.remindRenewal || !g.dueDate || !g.active || g.dueDate < today) return false;
    return OFFSETS.some((o) => addDays(g.dueDate!, -o) === today);
  }).length;

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex bg-nyx-bg">
        {/* Desktop sidebar */}
        <AdminSidebar pendingCount={pendingCount} gastosOverdueCount={gastosOverdueCount} gastosUpcomingCount={gastosUpcomingCount} />

        {/* Main content — offset do sidebar fixo no desktop */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 md:pl-56">
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
        <AdminBottomNav pendingCount={pendingCount} gastosOverdueCount={gastosOverdueCount} gastosUpcomingCount={gastosUpcomingCount} />
      </div>
    </AdminAuthGuard>
  );
}
