import Link from "next/link";
import { listProducts } from "@/lib/products";
import { listDrops } from "@/lib/drops";
import { totalStock } from "@/lib/types";
import { adminOrderStats } from "@/lib/admin-orders";
import { formatPrice } from "@/lib/utils";
import { Plus, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { QuickSaleButton } from "@/components/admin/QuickSaleButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, drops, orderStats] = await Promise.all([
    listProducts(),
    listDrops(),
    adminOrderStats(),
  ]);

  const totalUnits = products.reduce((sum, p) => sum + totalStock(p), 0);
  const activeDrop = drops.find((d) => d.status === "active");

  return (
    <div className="container-nyx py-8 md:py-12">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-mono text-nyx-muted mb-1">Dashboard</p>
          <h1 className="heading-display text-3xl md:text-4xl">
            {activeDrop ? activeDrop.name : "NYX."}
          </h1>
          {activeDrop && (
            <p className="mt-1 text-sm text-nyx-muted">
              Drop ativo · {products.filter((p) => p.dropId === activeDrop.id).length} peças vinculadas
            </p>
          )}
        </div>

        {/* Quick sale button */}
        <QuickSaleButton />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        <KpiCard label="Produtos publicados" value={String(products.length)} />
        <KpiCard label="Peças em estoque" value={String(totalUnits)} />
        <KpiCard label="Pedidos pendentes" value={String(orderStats.pending)} highlight={orderStats.pending > 0} />
        <KpiCard label="Receita confirmada" value={formatPrice(orderStats.revenuePix)} />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink
          href="/admin/pedidos"
          category="Vendas"
          title="Gerenciar pedidos"
          description={`Confirmar, concluir ou cancelar pedidos.${orderStats.pending > 0 ? ` ${orderStats.pending} aguardando.` : ""}`}
          highlight={orderStats.pending > 0}
          icon={<ShoppingBag size={18} strokeWidth={1.5} />}
        />
        <QuickLink
          href="/admin/financeiro"
          category="Financeiro"
          title="Ver financeiro"
          description="Faturamento, gastos e fechamentos de caixa."
          icon={<TrendingUp size={18} strokeWidth={1.5} />}
        />
        <QuickLink
          href="/admin/produtos"
          category="Catálogo"
          title="Gerenciar produtos"
          description="Criar, editar, publicar ou arquivar peças."
          icon={<Package size={18} strokeWidth={1.5} />}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-4 md:p-5 ${highlight ? "border-amber-400 bg-amber-50/10" : "border-nyx-line bg-nyx-cream/20"}`}>
      <p className="label-mono text-[10px] text-nyx-muted mb-1">{label}</p>
      <p className={`heading-display text-3xl ${highlight ? "text-amber-600" : ""}`}>{value}</p>
    </div>
  );
}

function QuickLink({ href, category, title, description, icon, highlight }: {
  href: string; category: string; title: string; description: string; icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border p-6 hover:bg-nyx-cream/40 transition-colors block group ${highlight ? "border-amber-400" : "border-nyx-line"}`}
    >
      <div className="flex items-center gap-2 text-nyx-muted group-hover:text-nyx-ink transition-colors mb-3">
        {icon}
        <p className="label-mono text-[10px]">{category}</p>
      </div>
      <h2 className="heading-display text-xl mb-1">{title}</h2>
      <p className="text-xs text-nyx-muted leading-relaxed">
        {description}
        {highlight && <span className="text-amber-600 font-medium ml-1">Ver agora →</span>}
      </p>
    </Link>
  );
}
