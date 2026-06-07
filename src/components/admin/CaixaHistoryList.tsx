"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, CalendarDays } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Caixa } from "@/lib/admin-caixa";

function fmtDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
  return label.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CaixaHistoryList({ caixas }: { caixas: Caixa[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openRowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-h-[420px] overflow-y-auto scrollbar-thin divide-y divide-nyx-line">
        {caixas.map((c) => {
          const isOpen = openId === c.id;
          return (
            <div key={c.id} ref={isOpen ? openRowRef : undefined}>
              <button
                type="button"
                onClick={() => {
                  const next = isOpen ? null : c.id;
                  setOpenId(next);
                  if (next) {
                    requestAnimationFrame(() => {
                      openRowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    });
                  }
                }}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-nyx-line/10 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-nyx-ink font-medium">{fmtDayLabel(c.date)}</p>
                  <p className="text-[11px] text-nyx-muted mt-0.5">
                    {c.orderCount} venda{c.orderCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-amber-400 font-medium tabular-nums">{formatPrice(c.totalGeral)}</span>
                  <ChevronDown size={14} className={`text-nyx-soft transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {c.totalPix > 0 && <Stat label="Pix" value={formatPrice(c.totalPix)} />}
                    {c.totalCard > 0 && <Stat label="Cartão" value={formatPrice(c.totalCard)} />}
                    {c.totalTransferencia > 0 && <Stat label="Transferência" value={formatPrice(c.totalTransferencia)} />}
                    {c.totalCombinar > 0 && <Stat label="Combinar" value={formatPrice(c.totalCombinar)} />}
                  </div>
                  <Link
                    href={`/admin/financeiro?caixaDate=${c.date}#agenda-caixa`}
                    className="inline-flex items-center gap-1.5 label-mono text-[9px] px-2.5 py-1.5 border border-nyx-line text-nyx-muted hover:text-nyx-ink hover:border-nyx-muted transition-colors"
                  >
                    <CalendarDays size={11} />
                    Ver na agenda
                  </Link>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-mono text-[9px] text-nyx-muted mb-0.5">{label}</p>
      <p className="text-xs text-nyx-ink">{value}</p>
    </div>
  );
}
