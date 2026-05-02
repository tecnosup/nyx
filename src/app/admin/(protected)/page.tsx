import Link from "next/link";
import { listProducts } from "@/lib/products";
import { listDrops } from "@/lib/drops";
import { totalStock } from "@/lib/types";
import { adminOrderStats, adminListOrders } from "@/lib/admin-orders";
import { adminListCaixas } from "@/lib/admin-caixa";
import { adminGastoStats, adminListGastos } from "@/lib/admin-gastos";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag, TrendingUp, Package, AlertTriangle,
  ArrowRight, Clock, CheckCheck, XCircle, MessageCircle,
} from "lucide-react";
import { QuickSaleButton } from "@/components/admin/QuickSaleButton";
import { DashboardChart } from "@/components/admin/DashboardChart";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:   <Clock size={12} className="text-amber-500" />,
  confirmed: <MessageCircle size={12} className="text-blue-400" />,
  completed: <CheckCheck size={12} className="text-emerald-500" />,
  cancelled: <XCircle size={12} className="text-nyx-soft" />,
};
const STATUS_COLOR: Record<string, string> = {
  pending:   "text-amber-500",
  confirmed: "text-blue-400",
  completed: "text-emerald-500",
  cancelled: "text-nyx-soft line-through",
};

export default async function AdminDashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const [products, drops, orderStats, recentOrders, caixas, gastos, gastoStats] = await Promise.all([
    listProducts(),
    listDrops(),
    adminOrderStats(),
    adminListOrders(8),
    adminListCaixas(30),
    adminListGastos(),
    adminGastoStats(),
  ]);

  const totalUnits = products.reduce((sum, p) => sum + totalStock(p), 0);
  const activeDrop = drops.find((d) => d.status === "active");

  // Faturamento este mês
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const revenueThisMonth = caixas
    .filter((c) => c.date.startsWith(monthPrefix))
    .reduce((s, c) => s + c.totalGeral, 0);

  // Lucro estimado
  const lucro = revenueThisMonth - gastoStats.monthlyTotal;

  const pendingOrders = recentOrders.filter((o) => o.status === "pending");

  return (
    <div className="container-nyx py-6 md:py-10 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-mono text-[10px] text-nyx-muted capitalize">{dateStr}</p>
          <h1 className="heading-display text-2xl md:text-3xl mt-0.5">
            {activeDrop ? activeDrop.name : "NYX."}
          </h1>
          {activeDrop && (
            <p className="text-xs text-nyx-muted mt-0.5">
              Drop ativo · {products.filter((p) => p.dropId === activeDrop.id).length} peças
            </p>
          )}
        </div>
        <QuickSaleButton products={products} />
      </div>

      {/* ── Alert: pedidos pendentes ── */}
      {pendingOrders.length > 0 && (
        <Link
          href="/admin/pedidos"
          className="flex items-center justify-between gap-3 border border-amber-400/60 bg-amber-400/5 px-5 py-3.5 hover:bg-amber-400/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-600 font-medium">
              {pendingOrders.length} pedido{pendingOrders.length > 1 ? "s" : ""} aguardando confirmação
            </p>
          </div>
          <ArrowRight size={15} className="text-amber-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Faturamento este mês"
          value={formatPrice(revenueThisMonth)}
          sub={`${caixas.filter((c) => c.date.startsWith(monthPrefix)).length} fechamentos`}
          accent="emerald"
        />
        <KpiCard
          label="Pedidos pendentes"
          value={String(orderStats.pending)}
          sub={orderStats.pending > 0 ? "Atenção necessária" : "Tudo em dia"}
          accent={orderStats.pending > 0 ? "amber" : "neutral"}
        />
        <KpiCard
          label="Lucro estimado"
          value={formatPrice(lucro)}
          sub={`Gastos: ${formatPrice(gastoStats.monthlyTotal)}/mês`}
          accent={lucro >= 0 ? "neutral" : "red"}
        />
        <KpiCard
          label="Estoque total"
          value={String(totalUnits)}
          sub={`${products.length} produtos`}
          accent="neutral"
        />
      </div>

      {/* ── Chart + Pedidos recentes ── */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">

        {/* Gráfico de faturamento */}
        <div className="border border-nyx-line p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="label-mono text-[10px] text-nyx-muted">Faturamento por caixa (últimos 30 dias)</p>
            <Link href="/admin/financeiro" className="label-mono text-[9px] text-nyx-soft hover:text-nyx-ink transition-colors inline-flex items-center gap-1">
              Ver tudo <ArrowRight size={10} />
            </Link>
          </div>
          <DashboardChart caixas={caixas} gastos={gastos} />
        </div>

        {/* Pedidos recentes */}
        <div className="border border-nyx-line p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="label-mono text-[10px] text-nyx-muted">Pedidos recentes</p>
            <Link href="/admin/pedidos" className="label-mono text-[9px] text-nyx-soft hover:text-nyx-ink transition-colors inline-flex items-center gap-1">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-xs text-nyx-soft">Nenhum pedido ainda.</p>
            </div>
          ) : (
            <div className="space-y-px">
              {recentOrders.slice(0, 7).map((order) => {
                const d = new Date(order.createdAt);
                const dt = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                const hr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={order.id} className="flex items-center gap-3 py-2.5 border-b border-nyx-line/50 last:border-0">
                    <div className="shrink-0">{STATUS_ICON[order.status]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-nyx-ink truncate font-medium">{order.customerName}</p>
                      <p className="text-[10px] text-nyx-muted truncate">
                        {order.items.map((i) => i.productName).join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-nyx-ink">{formatPrice(order.totalPix)}</p>
                      <p className={`text-[9px] label-mono ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Atalhos rápidos ── */}
      <div className="grid grid-cols-3 gap-3">
        <ShortcutCard href="/admin/pedidos" icon={<ShoppingBag size={16} strokeWidth={1.5} />} label="Pedidos" badge={orderStats.pending > 0 ? orderStats.pending : undefined} />
        <ShortcutCard href="/admin/financeiro" icon={<TrendingUp size={16} strokeWidth={1.5} />} label="Financeiro" />
        <ShortcutCard href="/admin/produtos" icon={<Package size={16} strokeWidth={1.5} />} label="Produtos" />
      </div>

    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({ label, value, sub, accent }: {
  label: string; value: string; sub: string;
  accent: "emerald" | "amber" | "red" | "neutral";
}) {
  const accentMap = {
    emerald: { border: "border-emerald-500/30 bg-emerald-500/5", value: "text-emerald-400" },
    amber:   { border: "border-amber-400/40 bg-amber-400/5",     value: "text-amber-400" },
    red:     { border: "border-red-500/30 bg-red-500/5",         value: "text-red-400" },
    neutral: { border: "border-nyx-line bg-nyx-cream/20",        value: "text-nyx-ink" },
  };
  const s = accentMap[accent];
  return (
    <div className={`border p-4 md:p-5 ${s.border}`}>
      <p className="label-mono text-[9px] text-nyx-muted mb-2 leading-tight">{label}</p>
      <p className={`heading-display text-2xl md:text-3xl ${s.value}`}>{value}</p>
      <p className="text-[10px] text-nyx-soft mt-1.5">{sub}</p>
    </div>
  );
}

function ShortcutCard({ href, icon, label, badge }: {
  href: string; icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <Link href={href} className="border border-nyx-line p-4 hover:bg-nyx-cream/30 transition-colors flex flex-col items-center gap-2 relative group">
      {badge !== undefined && (
        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      <span className="text-nyx-muted group-hover:text-nyx-ink transition-colors">{icon}</span>
      <span className="label-mono text-[9px] text-nyx-muted group-hover:text-nyx-ink transition-colors">{label}</span>
    </Link>
  );
}
