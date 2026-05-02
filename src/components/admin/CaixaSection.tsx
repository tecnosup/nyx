"use client";

import { useState, useTransition } from "react";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { closeCaixaAction } from "@/app/admin/(protected)/pedidos/actions";
import type { Caixa } from "@/lib/admin-caixa";

interface Props {
  caixas: Caixa[];
  pendingCount: number;
}

export function CaixaSection({ caixas, pendingCount }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  function handleClose() {
    setError("");
    startTransition(async () => {
      const res = await closeCaixaAction();
      if (res.ok && res.count !== undefined && res.total !== undefined) {
        setResult({ count: res.count, total: res.total });
      } else if (!res.ok) {
        setError((res as { ok: false; error: string }).error);
      }
    });
  }

  return (
    <div className="border border-nyx-line p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono text-sm text-nyx-ink flex items-center gap-2">
            <Lock size={14} />
            Fechar caixa do dia
          </p>
          <p className="text-xs text-nyx-muted mt-1">
            Soma todos os pedidos concluídos ainda não registrados em caixa e gera um fechamento.
          </p>
          {pendingCount > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {pendingCount} pedido{pendingCount > 1 ? "s" : ""} aguardando fechamento.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={pending || pendingCount === 0}
          onClick={handleClose}
          className="shrink-0 inline-flex items-center gap-2 label-mono text-xs px-5 py-2.5 border border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Lock size={13} />
          {pending ? "Fechando…" : "Fechar caixa"}
        </button>
      </div>

      {result && (
        <div className="border border-green-300 bg-green-50/10 p-4 text-sm">
          <p className="text-green-700 font-medium">Caixa fechado com sucesso!</p>
          <p className="text-nyx-muted mt-0.5">{result.count} pedido{result.count > 1 ? "s" : ""} · Total: {formatPrice(result.total)}</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {caixas.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((p) => !p)}
            className="label-mono text-[10px] text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1 transition-colors"
          >
            {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Histórico de fechamentos ({caixas.length})
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {caixas.map((c) => (
                <div key={c.id} className="border border-nyx-line p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Data</p>
                    <p className="text-nyx-ink">{c.date.split("-").reverse().join("/")}</p>
                    <p className="text-[10px] text-nyx-muted">{c.orderCount} pedido{c.orderCount > 1 ? "s" : ""}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Pix</p>
                    <p className="text-nyx-ink">{formatPrice(c.totalPix)}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Cartão</p>
                    <p className="text-nyx-ink">{formatPrice(c.totalCard)}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Total geral</p>
                    <p className="text-nyx-ink font-medium">{formatPrice(c.totalGeral)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
