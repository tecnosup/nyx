import Link from "next/link";
import { listProducts } from "@/lib/products";
import { listDrops } from "@/lib/drops";
import { totalStock } from "@/lib/types";
import { adminOrderStats } from "@/lib/admin-orders";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, drops, orderStats] = await Promise.all([
    listProducts(),
    listDrops(),
    adminOrderStats(),
  ]);

  const totalUnits = products.reduce((sum, p) => sum + totalStock(p), 0);
  const soldOut = products.filter((p) => totalStock(p) === 0).length;
  const activeDrop = drops.find((d) => d.status === "active");
  const upcoming = drops.filter((d) => d.status === "upcoming").length;

  const stats = [
    { label: "Produtos publicados", value: String(products.length) },
    { label: "Peças em estoque", value: String(totalUnits) },
    { label: "Pedidos pendentes", value: String(orderStats.pending), highlight: orderStats.pending > 0 },
    { label: "Receita confirmada", value: formatPrice(orderStats.revenuePix) },
  ];

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="mb-12">
        <p className="label-mono text-nyx-muted mb-2">Dashboard</p>
        <h1 className="heading-display text-3xl md:text-5xl">
          {activeDrop ? activeDrop.name : "NYX."}
        </h1>
        {activeDrop && (
          <p className="mt-3 text-sm text-nyx-muted">
            Drop ativo ·{" "}
            {products.filter((p) => p.dropId === activeDrop.id).length} peças
            vinculadas
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`border p-6 ${(s as { highlight?: boolean }).highlight ? "border-amber-400 bg-amber-50/10" : "border-nyx-line bg-nyx-cream/40"}`}
          >
            <p className="label-mono text-nyx-muted mb-2">{s.label}</p>
            <p className={`heading-display text-4xl ${(s as { highlight?: boolean }).highlight ? "text-amber-600" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/admin/pedidos"
          className="border border-nyx-line p-8 hover:bg-nyx-cream/60 transition-colors block"
        >
          <p className="label-mono text-nyx-muted mb-3">Vendas</p>
          <h2 className="heading-display text-2xl mb-2">Gerenciar pedidos</h2>
          <p className="text-sm text-nyx-muted">
            Confirmar ou cancelar pedidos recebidos pelo checkout. {orderStats.pending > 0 && <span className="text-amber-600 font-medium">{orderStats.pending} aguardando.</span>}
          </p>
        </Link>
        <Link
          href="/admin/produtos"
          className="border border-nyx-line p-8 hover:bg-nyx-cream/60 transition-colors block"
        >
          <p className="label-mono text-nyx-muted mb-3">Catálogo</p>
          <h2 className="heading-display text-2xl mb-2">Gerenciar produtos</h2>
          <p className="text-sm text-nyx-muted">
            Criar, editar, publicar ou arquivar peças. Upload de imagens,
            controle de estoque por tamanho.
          </p>
        </Link>
        <Link
          href="/admin/drops"
          className="border border-nyx-line p-8 hover:bg-nyx-cream/60 transition-colors block"
        >
          <p className="label-mono text-nyx-muted mb-3">Edições</p>
          <h2 className="heading-display text-2xl mb-2">Gerenciar drops</h2>
          <p className="text-sm text-nyx-muted">
            Programar novos drops, marcar como ativo, arquivar edições
            passadas.
          </p>
        </Link>
      </div>
    </div>
  );
}
