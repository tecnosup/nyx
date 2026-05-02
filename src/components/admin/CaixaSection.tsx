"use client";

import { useState, useTransition } from "react";
import { Lock, ChevronDown, ChevronUp, Unlock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { closeCaixaAction } from "@/app/admin/(protected)/pedidos/actions";
import type { Caixa } from "@/lib/admin-caixa";
import type { Order } from "@/lib/admin-orders";
import { PAYMENT_LABELS } from "@/lib/types";

interface Props {
  caixas: Caixa[];
  pendingCount: number;
  openOrders: Order[];
}

export function CaixaSection({ caixas, pendingCount, openOrders }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showOpen, setShowOpen] = useState(true);

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

  // Totals for open caixa
  const openTotals = openOrders.reduce(
    (acc, o) => {
      acc.total += o.totalPix;
      acc.byMethod[o.paymentMethod] = (acc.byMethod[o.paymentMethod] || 0) + o.totalPix;
      return acc;
    },
    { total: 0, byMethod: {} as Record<string, number> }
  );

  return (
    <div className="space-y-3">
      {/* Open caixa summary */}
      <div className="border border-nyx-line p-5">
        <button
          type="button"
          onClick={() => setShowOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <Unlock size={14} className="text-emerald-500" />
            <p className="label-mono text-sm text-nyx-ink">Caixa aberto</p>
            {pendingCount > 0 && (
              <span className="label-mono text-[9px] px-2 py-0.5 border border-amber-400 text-amber-500">
                {pendingCount} pedido{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="heading-display text-xl text-emerald-500">{formatPrice(openTotals.total)}</p>
            {showOpen ? <ChevronUp size={14} className="text-nyx-muted" /> : <ChevronDown size={14} className="text-nyx-muted" />}
          </div>
        </button>

        {showOpen && (
          <div className="mt-4 pt-4 border-t border-nyx-line space-y-3">
            {pendingCount === 0 ? (
              <p className="text-xs text-nyx-soft text-center py-2">Nenhum pedido concluído aguardando fechamento.</p>
            ) : (
              <>
                {/* Breakdown by payment method */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(openTotals.byMethod).map(([method, val]) => (
                    <div key={method} className="border border-nyx-line p-3">
                      <p className="label-mono text-[9px] text-nyx-muted mb-1">{PAYMENT_LABELS[method as keyof typeof PAYMENT_LABELS] ?? method}</p>
                      <p className="text-sm text-nyx-ink font-medium">{formatPrice(val)}</p>
                    </div>
                  ))}
                </div>

                {/* Individual orders in open caixa */}
                <div className="space-y-1">
                  {openOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-xs py-1.5 border-b border-nyx-line/40 last:border-0">
                      <span className="text-nyx-muted truncate">{o.customerName}</span>
                      <span className="text-nyx-ink shrink-0 ml-3">{formatPrice(o.totalPix)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <p className="text-xs text-nyx-muted">
                {pendingCount > 0
                  ? "Feche o caixa para registrar esse valor no histórico financeiro."
                  : "Conclua pedidos para adicioná-los ao caixa antes de fechar."}
              </p>
              <button
                type="button"
                disabled={pending || pendingCount === 0}
                onClick={handleClose}
                className="shrink-0 inline-flex items-center gap-2 label-mono text-xs px-4 py-2 border border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Lock size={12} />
                {pending ? "Fechando…" : "Fechar caixa"}
              </button>
            </div>

            {result && (
              <div className="border border-green-300 bg-green-50/10 p-3 text-sm">
                <p className="text-green-700 font-medium">Caixa fechado!</p>
                <p className="text-nyx-muted text-xs mt-0.5">{result.count} pedido{result.count > 1 ? "s" : ""} · {formatPrice(result.total)}</p>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}
      </div>

      {/* History */}
      {caixas.length > 0 && (
        <div className="border border-nyx-line p-5">
          <button
            type="button"
            onClick={() => setShowHistory((p) => !p)}
            className="w-full flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-nyx-muted" />
              <p className="label-mono text-sm text-nyx-ink">Histórico de caixas fechados</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-mono text-[9px] text-nyx-soft">{caixas.length} fechamento{caixas.length > 1 ? "s" : ""}</span>
              {showHistory ? <ChevronUp size={14} className="text-nyx-muted" /> : <ChevronDown size={14} className="text-nyx-muted" />}
            </div>
          </button>

          {showHistory && (
            <div className="mt-4 pt-4 border-t border-nyx-line space-y-2">
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
