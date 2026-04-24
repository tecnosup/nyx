import { adminListAudit } from "@/lib/admin-audit";
import { RestoreButton } from "@/components/admin/RestoreButton";
import { revertAuditAction } from "./actions";

export const dynamic = "force-dynamic";

const REVERSIBLE = new Set([
  "product.delete",
  "product.status.published",
  "product.status.draft",
  "drop.delete",
  "drop.restore",
]);

function actionLabel(action: string): string {
  if (action === "product.create") return "Criou produto";
  if (action === "product.update") return "Atualizou produto";
  if (action === "product.delete") return "Excluiu produto";
  if (action === "product.restore") return "Restaurou produto";
  if (action === "product.status.published") return "Publicou produto";
  if (action === "product.status.draft") return "Voltou para rascunho";
  if (action === "drop.create") return "Criou drop";
  if (action === "drop.update") return "Atualizou drop";
  if (action === "drop.delete") return "Excluiu drop";
  if (action === "drop.restore") return "Restaurou drop";
  return action;
}

function revertLabel(action: string): string {
  if (action === "product.delete") return "Restaurar";
  if (action === "product.status.published") return "→ Rascunho";
  if (action === "product.status.draft") return "→ Publicar";
  if (action === "drop.delete") return "Restaurar";
  if (action === "drop.restore") return "Re-excluir";
  return "Reverter";
}

function formatTs(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminAuditPage() {
  const entries = await adminListAudit(200);

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="mb-10">
        <p className="label-mono text-nyx-muted mb-2">Histórico</p>
        <h1 className="heading-display text-3xl md:text-4xl">Auditoria</h1>
        <p className="mt-2 text-sm text-nyx-muted">
          Últimas {entries.length} mutações feitas no painel.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="border border-nyx-line bg-nyx-cream/40 p-12 text-center">
          <p className="text-nyx-muted">Nenhum registro ainda.</p>
        </div>
      ) : (
        <div className="border border-nyx-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-nyx-cream/60 label-mono text-xs text-nyx-muted">
              <tr>
                <th className="text-left px-4 py-3">Quando</th>
                <th className="text-left px-4 py-3">Quem</th>
                <th className="text-left px-4 py-3">Ação</th>
                <th className="text-left px-4 py-3">Entidade</th>
                <th className="text-left px-4 py-3">Resumo</th>
                <th className="text-right px-4 py-3">Reverter</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-nyx-line align-top">
                  <td className="px-4 py-3 font-mono text-xs text-nyx-muted whitespace-nowrap">
                    {formatTs(e.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-nyx-ink">
                    {e.actorEmail ?? e.actorUid}
                  </td>
                  <td className="px-4 py-3">{actionLabel(e.action)}</td>
                  <td className="px-4 py-3 label-mono text-xs text-nyx-muted">
                    {e.entity} · {e.entityId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-nyx-muted">
                    {e.summary ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {REVERSIBLE.has(e.action) ? (
                      <RestoreButton
                        onRestore={revertAuditAction.bind(
                          null,
                          e.action,
                          e.entity,
                          e.entityId
                        )}
                        label={revertLabel(e.action)}
                      />
                    ) : (
                      <span className="text-nyx-soft label-mono text-xs">—</span>
                    )}
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
