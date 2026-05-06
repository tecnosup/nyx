import Link from "next/link";
import { Plus } from "lucide-react";
import { adminListProducts } from "@/lib/admin-products";
import { adminListDrops } from "@/lib/admin-drops";
import { adminListStockMovements } from "@/lib/admin-stock";
import { ProductsTableClient } from "@/components/admin/ProductsTableClient";
import { StockMovements } from "@/components/admin/StockMovements";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, , movements] = await Promise.all([
    adminListProducts(),
    adminListDrops(),
    adminListStockMovements({ limit: 100 }),
  ]);

  return (
    <div className="container-nyx py-12 md:py-16 space-y-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono text-[10px] text-nyx-muted mb-1">Catálogo</p>
          <h1 className="heading-display text-3xl md:text-4xl">Produtos</h1>
          <p className="mt-1 text-sm text-nyx-muted">
            {products.length} {products.length === 1 ? "peça cadastrada" : "peças cadastradas"}
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="shrink-0 inline-flex items-center gap-2 label-mono text-xs px-4 py-2.5 border border-nyx-ink text-nyx-ink hover:bg-nyx-ink hover:text-nyx-bg transition-colors"
        >
          <Plus size={13} />
          Novo produto
        </Link>
      </div>

      {/* Stock movement log — first */}
      <StockMovements movements={movements} />

      {products.length === 0 ? (
        <div className="border border-nyx-line p-12 text-center">
          <p className="text-nyx-muted text-sm">Nenhum produto cadastrado ainda.</p>
          <Link href="/admin/produtos/novo" className="label-mono text-nyx-ink mt-4 inline-block text-xs">
            Criar o primeiro →
          </Link>
        </div>
      ) : (
        <ProductsTableClient products={products} />
      )}
    </div>
  );
}
