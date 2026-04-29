import { adminListOrders } from "@/lib/admin-orders";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const orders = await adminListOrders(200);

  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const revenuePix = orders
    .filter((o) => o.status === "confirmed")
    .reduce((s, o) => s + o.totalPix, 0);

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="mb-10">
        <h1 className="heading-display text-3xl md:text-4xl">Pedidos</h1>
        <p className="text-sm text-nyx-muted mt-1">
          Pedidos recebidos via checkout — confirme ou cancele manualmente.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Kpi label="Total de pedidos" value={String(orders.length)} />
        <Kpi label="Pendentes" value={String(pending)} highlight={pending > 0} />
        <Kpi label="Confirmados" value={String(confirmed)} />
        <Kpi label="Receita confirmada (Pix)" value={formatPrice(revenuePix)} />
      </div>

      {orders.length === 0 ? (
        <div className="border border-nyx-line p-12 text-center">
          <p className="label-mono text-nyx-muted">Nenhum pedido ainda.</p>
          <p className="text-xs text-nyx-soft mt-1">
            Os pedidos aparecem aqui assim que um cliente finaliza o checkout.
          </p>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
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
