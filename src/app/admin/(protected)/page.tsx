import Link from "next/link";
import { listProducts } from "@/lib/products";
import { listDrops } from "@/lib/drops";
import { totalStock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, drops] = await Promise.all([listProducts(), listDrops()]);

  const totalUnits = products.reduce((sum, p) => sum + totalStock(p), 0);
  const soldOut = products.filter((p) => totalStock(p) === 0).length;
  const activeDrop = drops.find((d) => d.status === "active");
  const upcoming = drops.filter((d) => d.status === "upcoming").length;

  const stats = [
    { label: "Produtos publicados", value: products.length },
    { label: "Peças em estoque", value: totalUnits },
    { label: "Esgotados", value: soldOut },
    { label: "Drops próximos", value: upcoming },
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
            className="border border-nyx-line p-6 bg-nyx-cream/40"
          >
            <p className="label-mono text-nyx-muted mb-2">{s.label}</p>
            <p className="heading-display text-4xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
