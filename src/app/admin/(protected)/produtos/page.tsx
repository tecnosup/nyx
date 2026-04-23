import Link from "next/link";
import { adminListProducts } from "@/lib/admin-products";
import { adminListDrops } from "@/lib/admin-drops";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS, totalStock } from "@/lib/types";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, drops] = await Promise.all([
    adminListProducts(),
    adminListDrops(),
  ]);
  const dropMap = new Map(drops.map((d) => [d.id, d.name]));

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-mono text-nyx-muted mb-2">Catálogo</p>
          <h1 className="heading-display text-3xl md:text-4xl">Produtos</h1>
          <p className="mt-2 text-sm text-nyx-muted">
            {products.length} {products.length === 1 ? "peça cadastrada" : "peças cadastradas"}
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="btn-primary">
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border border-nyx-line bg-nyx-cream/40 p-12 text-center">
          <p className="text-nyx-muted">Nenhum produto cadastrado ainda.</p>
          <Link
            href="/admin/produtos/novo"
            className="label-mono text-nyx-ink mt-4 inline-block"
          >
            Criar o primeiro →
          </Link>
        </div>
      ) : (
        <div className="border border-nyx-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-nyx-cream/60 label-mono text-xs text-nyx-muted">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Categoria</th>
                <th className="text-left px-4 py-3">Drop</th>
                <th className="text-right px-4 py-3">Preço</th>
                <th className="text-right px-4 py-3">Estoque</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = totalStock(p);
                const dropName = p.dropId ? dropMap.get(p.dropId) : null;
                return (
                  <tr key={p.id} className="border-t border-nyx-line">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/produtos/${p.id}/editar`}
                        className="font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="label-mono text-[10px] text-nyx-muted mt-0.5">
                        {p.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nyx-muted">
                      {CATEGORY_LABELS[p.category]}
                    </td>
                    <td className="px-4 py-3 text-nyx-muted">
                      {dropName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {stock === 0 ? (
                        <span className="text-red-700">esgotado</span>
                      ) : (
                        stock
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/produtos/${p.id}/editar`}
                          className="label-mono text-xs text-nyx-ink hover:text-nyx-muted"
                        >
                          Editar
                        </Link>
                        <DeleteButton
                          onDelete={deleteProductAction.bind(null, p.id)}
                          confirmMessage={`Excluir "${p.name}"? Esta ação não pode ser desfeita.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  const cls =
    status === "published"
      ? "border-nyx-ink text-nyx-ink"
      : "border-nyx-line text-nyx-muted";
  return (
    <span
      className={`label-mono text-[10px] border px-2 py-1 inline-block ${cls}`}
    >
      {status === "published" ? "Publicado" : "Rascunho"}
    </span>
  );
}
