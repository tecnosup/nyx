import Link from "next/link";
import { adminListCategories } from "@/lib/admin-categories";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const categories = await adminListCategories();

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-mono text-nyx-muted mb-2">Catálogo</p>
          <h1 className="heading-display text-3xl md:text-4xl">Categorias</h1>
          <p className="mt-2 text-sm text-nyx-muted">
            {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
          </p>
        </div>
        <Link href="/admin/categorias/nova" className="btn-primary">
          + Nova categoria
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="border border-nyx-line bg-nyx-cream/40 p-12 text-center">
          <p className="text-nyx-muted">Nenhuma categoria cadastrada.</p>
          <Link href="/admin/categorias/nova" className="label-mono text-nyx-ink mt-4 inline-block">
            Criar a primeira →
          </Link>
        </div>
      ) : (
        <div className="border border-nyx-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-nyx-cream/60 label-mono text-xs text-nyx-muted">
              <tr>
                <th className="text-left px-4 py-3">Label</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-right px-4 py-3">Ordem</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-nyx-line">
                  <td className="px-4 py-3 font-medium">{cat.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-nyx-muted">{cat.slug}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-nyx-muted">
                    {cat.order}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/categorias/${cat.id}/editar`}
                        className="label-mono text-xs text-nyx-ink hover:text-nyx-muted"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        onDelete={deleteCategoryAction.bind(null, cat.id)}
                        confirmMessage={`Excluir "${cat.label}"? Produtos que usam essa categoria não serão afetados imediatamente.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
