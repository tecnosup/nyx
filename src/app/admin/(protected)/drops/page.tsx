import Link from "next/link";
import { adminListDrops } from "@/lib/admin-drops";
import { adminListProducts } from "@/lib/admin-products";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { DropStatus } from "@/lib/types";
import { deleteDropAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<DropStatus, string> = {
  upcoming: "Próximo",
  active: "Ativo",
  archived: "Arquivado",
};

export default async function AdminDropsPage() {
  const [drops, products] = await Promise.all([
    adminListDrops(),
    adminListProducts(),
  ]);
  const countByDrop = new Map<string, number>();
  for (const p of products) {
    if (p.dropId) countByDrop.set(p.dropId, (countByDrop.get(p.dropId) ?? 0) + 1);
  }

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-mono text-nyx-muted mb-2">Edições</p>
          <h1 className="heading-display text-3xl md:text-4xl">Drops</h1>
          <p className="mt-2 text-sm text-nyx-muted">
            {drops.length} {drops.length === 1 ? "drop cadastrado" : "drops cadastrados"}
          </p>
        </div>
        <Link href="/admin/drops/novo" className="btn-primary">
          + Novo drop
        </Link>
      </div>

      {drops.length === 0 ? (
        <div className="border border-nyx-line bg-nyx-cream/40 p-12 text-center">
          <p className="text-nyx-muted">Nenhum drop cadastrado ainda.</p>
          <Link
            href="/admin/drops/novo"
            className="label-mono text-nyx-ink mt-4 inline-block"
          >
            Criar o primeiro →
          </Link>
        </div>
      ) : (
        <div className="border border-nyx-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-nyx-cream/60 label-mono text-xs text-nyx-muted">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Lançamento</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Peças</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {drops.map((d) => (
                <tr key={d.id} className="border-t border-nyx-line">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/drops/${d.id}/editar`}
                      className="font-medium hover:underline"
                    >
                      {d.name}
                    </Link>
                    <div className="label-mono text-[10px] text-nyx-muted mt-0.5">
                      {d.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-nyx-muted font-mono text-xs">
                    {new Date(d.releaseDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {countByDrop.get(d.id) ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/drops/${d.id}/editar`}
                        className="label-mono text-xs text-nyx-ink hover:text-nyx-muted"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        onDelete={deleteDropAction.bind(null, d.id)}
                        confirmMessage={`Excluir "${d.name}"? Os produtos vinculados ficarão sem drop.`}
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

function StatusBadge({ status }: { status: DropStatus }) {
  const cls =
    status === "active"
      ? "border-nyx-ink text-nyx-ink bg-nyx-cream"
      : status === "upcoming"
      ? "border-nyx-ink text-nyx-ink"
      : "border-nyx-line text-nyx-muted";
  return (
    <span
      className={`label-mono text-[10px] border px-2 py-1 inline-block ${cls}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
