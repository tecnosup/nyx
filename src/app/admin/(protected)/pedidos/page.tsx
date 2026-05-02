import { adminListOrders } from "@/lib/admin-orders";
import { adminListCaixas } from "@/lib/admin-caixa";
import { listProducts } from "@/lib/products";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { CaixaSection } from "@/components/admin/CaixaSection";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const [orders, caixas, products] = await Promise.all([
    adminListOrders(200),
    adminListCaixas(30),
    listProducts(),
  ]);

  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const revenuePix = orders
    .filter((o) => o.status === "confirmed" || o.status === "completed")
    .reduce((s, o) => s + o.totalPix, 0);

  const openCaixaOrders = orders.filter((o) => o.status === "completed" && !o.caixaId);
  const pendingCaixa = openCaixaOrders.length;

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="mb-10">
        <h1 className="heading-display text-3xl md:text-4xl">Pedidos</h1>
        <p className="text-sm text-nyx-muted mt-1">
          Gerencie pedidos do checkout e vendas presenciais.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Kpi label="Total de pedidos" value={String(orders.length)} />
        <Kpi label="Pendentes" value={String(pending)} highlight={pending > 0} />
        <Kpi label="Confirmados" value={String(confirmed)} />
        <Kpi label="Concluídos" value={String(completed)} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <Kpi label="Receita confirmada + concluída" value={formatPrice(revenuePix)} />
        <Kpi label="Aguardando fechamento de caixa" value={String(pendingCaixa)} highlight={pendingCaixa > 0} />
      </div>

      {orders.length === 0 ? (
        <div className="border border-nyx-line p-12 text-center mb-12">
          <p className="label-mono text-nyx-muted">Nenhum pedido ainda.</p>
          <p className="text-xs text-nyx-soft mt-1">
            Os pedidos aparecem aqui assim que um cliente finaliza o checkout ou você registra uma venda manual.
          </p>
        </div>
      ) : (
        <div className="mb-16">
          <OrdersTable orders={orders} products={products} />
        </div>
      )}

      <CaixaSection caixas={caixas} pendingCount={pendingCaixa} openOrders={openCaixaOrders} />
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-5 ${highlight ? "border-amber-400 bg-amber-50/10" : "border-nyx-line"}`}>
      <p className="label-mono text-[10px] text-nyx-muted mb-1">{label}</p>
      <p className={`font-serif text-2xl ${highlight ? "text-amber-600" : "text-nyx-ink"}`}>
        {value}
      </p>
    </div>
  );
}
